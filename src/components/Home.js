import { useEffect, useState } from "react";
import DeployedVaults from "./DeployedVaults";
import WithdrawModal from "./WithdrawModal";
import { Row, Col, Form, InputGroup, Button, Modal, Alert } from 'react-bootstrap';
import { defaultTokens } from '../models/defaultTokens';
import HodlBank from '../abi/HodlBank.json'
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import moment from 'moment';

function Home() {
  const [contract, setContract] = useState({});
  const [value, setValue] = useState({ dueIn: 30, token1: "", token2: "", token3: "" });
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawModalData, setWithdrawModalData] = useState({});
  const [withdrawModalLoading, setWithdrawModalLoading] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const hodlBank = new ethers.Contract("0xe8D7ef301b86BCbCb954Bb62e797dEe4a480e4E2", HodlBank.abi, signer);

  const handleClose = () => setShowWithdrawModal(false);

  async function handleWithdraw(strategyId) {
    setWithdrawModalLoading(true);

    try {
      const result = await contract.withdrawStrategy(strategyId);

      await result.wait();
        toast.success(`Withdrawal comppleted`);
        getStrategies();

        setWithdrawModalLoading(false);
        setWithdrawModalData({});
        setShowWithdrawModal(false);

        provider.once(result.hash, (transaction) => {
      });
    } catch (e) {
      toast.error(`${e.message}`);
      setWithdrawModalLoading(false);
      setWithdrawModalData({});
      setShowWithdrawModal(false);
    }
  }

  async function getStrategies() {
    setLoading(true);

    try {
      const strategies = await hodlBank.getStrategies();
      console.log("strats", strategies)

      const strategiesMapped = strategies.map((strategy) => {
        const bonus = moment(new Date(strategy.dueOn.toString() * 1000).toUTCString()).diff(new Date(strategy.createdOn.toString() * 1000).toUTCString(), "days");
        const dueDiff = moment(new Date(strategy.dueOn.toString() * 1000).toUTCString()).diff(new Date(), 'days', true);
        return { name: strategy.name, strategyId: strategy.strategyId.toString(), bonus: bonus, dueOn: new Date(strategy.dueOn.toString() * 1000).toUTCString(), isDue: (dueDiff <= 0), ratios: strategy.ratios, initialAmount: ethers.utils.formatUnits(strategy.initialAmount) }
      });

      console.log("strategies", strategiesMapped);
      setVaults(strategiesMapped);
    } catch (e) {
      toast.error(`${e.message}`);
    }
    setLoading(false);
  }

  useEffect(() => {
    console.log("effect");

    hodlBank.on("StrategyDeployed", (e) => {
      console.log("deployed", e);
    });

    setContract(hodlBank);


    getStrategies();
  }, []);

  const onInput = (e) => {
    value[e.target.name] = e.target.value;
    setValue(value);
  },
    onFormSubmit = (e) => {
      e.preventDefault();

      if (!value.name || value.name === "") {
        toast.error("Name cannot be empty");
        return;
      }

      if (!value.deposit || value.deposit === "") {
        toast.error("Deposit cannot be empty");
        return;
      }

      if (!value.dueIn || value.dueIn === "") {
        toast.error("Due In cannot be empty");
        return;
      }

      if ((value.token1 === "") && value.token2 === "" && value.token3 === "") {
        toast.error("Select at least 1 token");
        return;
      }

      let tokenRatio = 0;
      if (value.token1 && value.token1 !== "") tokenRatio += Number(value.token1ratio);
      if (value.token2 && value.token2 !== "") tokenRatio += Number(value.token2ratio);
      if (value.token3 && value.token3 !== "") tokenRatio += Number(value.token3ratio);

      if (tokenRatio !== 100) {
        toast.error("Ratio must equal 100%");
        return;
      }

      deployStrategy();
    };

  async function deployStrategy() {
    setLoading(true);

    let ratios = [];
    if (value.token1 && value.token1 !== "") {
      ratios.push({ token: value.token1, ratio: value.token1ratio, value: 0 });
    }
    if (value.token2 && value.token2 !== "") {
      ratios.push({ token: value.token2, ratio: value.token2ratio, value: 0 });
    }
    if (value.token3 && value.token3 !== "") {
      ratios.push({ token: value.token3, ratio: value.token3ratio, value: 0 });
    }


    const dueIn = Number(value.dueIn) * 24 * 3600;
    console.log("due", dueIn);
    try{
      const result = await contract.deployStrategy(value.name, ratios, dueIn, { value: ethers.utils.parseEther(value.deposit) });
      toast.info(`Transaction commited\n(${result.hash})`);

      provider.once(result.hash, (transaction) => {
        toast.success(`Vault "${value.name}" deployed`);
        getStrategies();
      });      
    } catch(e) {
      console.log(e);
      toast.error(`${e.message}`);
    }

    setLoading(false);
  }

  function withdrawCallback(strategy) {
    setWithdrawModalData(strategy);
    setShowWithdrawModal(true);
  }

  return (
    <Form onSubmit={onFormSubmit}><Row>
      <Col className="col-4">
        <h3 className="mb-4 mt-3">Create Vault</h3>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>
            Name
          </Form.Label>
          <Col sm={9}>
            <Form.Control type="input" name="name" placeholder="Get Rich Quick Strategy" onChange={onInput}
              value={value.name} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="">
          <Form.Label column sm={3}>
            Deposit
          </Form.Label>
          <Col sm={9}>
            <InputGroup className="mb-3">
              <Form.Control type="number" step="0.1" name="deposit" onChange={onInput}
                value={value.deposit} />
              <InputGroup.Text>ETH&nbsp;</InputGroup.Text>
            </InputGroup>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={3}>
            Due In
          </Form.Label>
          <Col sm={9}>
            <InputGroup className="mb-3">
              <Form.Control type="number" name="dueIn" min="7" max="3650" step="1" onChange={onInput} value={value.dueIn} />
              <InputGroup.Text>DAYS</InputGroup.Text>
            </InputGroup>
          </Col>
        </Form.Group>
        <h4>Tokens</h4>

        <Form.Group as={Row} className="mb-1">
          <InputGroup className="mb-3">
            <Form.Select sm={3} name="token1" onChange={onInput}>
              <option key={'token1_default'} value="">Choose Token</option>
              {defaultTokens.map((token, i) => <option key={i} value={token.address}>{token.name}</option>)}
            </Form.Select>
            <Form.Control type="number" name="token1ratio" min="1" max="100" step="1" onChange={onInput} value={value.token1ratio} />
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group as={Row} className="mb-1">
          <InputGroup className="mb-3">
            <Form.Select sm={3} name="token2" onChange={onInput}>
              <option key={'token2_default'} value="">Choose Token</option>
              {defaultTokens.map((token, i) => <option key={i} value={token.address}>{token.name}</option>)}
            </Form.Select>
            <Form.Control type="number" name="token2ratio" min="1" max="100" step="1" onChange={onInput} value={value.token2ratio} />
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group as={Row} className="mb-1">
          <InputGroup className="mb-3">
            <Form.Select sm={3} name="token3" onChange={onInput}>
              <option key={'token3_default'} value="">Choose Token</option>
              {defaultTokens.map((token, i) => <option key={i} value={token.address}>{token.name}</option>)}
            </Form.Select>
            <Form.Control type="number" name="token3ratio" min="1" max="100" step="1" onChange={onInput} value={value.token3ratio} />
            <InputGroup.Text>%</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group as={Row} className="mb-1">
          <div className="text-center"><Button variant="dark" className="w-50 mt-3" type="submit" disabled={loading} onClick={() => !loading ? deployStrategy : null}>{loading ? 'Processing…' : 'DEPLOY'}</Button></div>
        </Form.Group>
      </Col>
      <Col className="col-1"></Col>
      <Col className="col-7">
        <Row>
          <DeployedVaults vaults={vaults} loading={loading} withdrawCallback={withdrawCallback} />
        </Row>
      </Col>
    </Row>
      <WithdrawModal show={showWithdrawModal} handleClose={handleClose} isLoading={withdrawModalLoading} handleWithdraw={handleWithdraw} strategy={withdrawModalData} />
    </Form>
  );
}

export default Home;