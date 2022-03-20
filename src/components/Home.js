import { useEffect, useState } from "react";
import DeployedVaultsTable from "./DeployedVaultsTable";
import WithdrawModal from "./WithdrawModal";
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { defaultTokens } from '../models/defaultTokens';
import HodlBank from '../abi/HodlBank.json'
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Addresses from '../models/addresses';
import moment from 'moment';
import DeployVaultForm from "./DeployVaultForm";

function Home() {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [value, setValue] = useState({ dueIn: 30, token1: "", token2: "", token3: "" });
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawModalData, setWithdrawModalData] = useState({});
  const [withdrawModalLoading, setWithdrawModalLoading] = useState(false);

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
      console.log(contract);
      const strategies = await contract.getStrategies();

      const strategiesMapped = strategies.map((strategy) => {
        const bonus = moment(new Date(strategy.dueOn.toString() * 1000).toUTCString()).diff(new Date(strategy.createdOn.toString() * 1000).toUTCString(), "days");
        const dueDiff = moment(new Date(strategy.dueOn.toString() * 1000).toUTCString()).diff(new Date(), 'days', true);
        return { name: strategy.name, strategyId: strategy.strategyId.toString(), bonus: bonus, dueOn: new Date(strategy.dueOn.toString() * 1000).toUTCString(), isDue: (dueDiff <= 0), ratios: strategy.ratios, initialAmount: ethers.utils.formatUnits(strategy.initialAmount) }
      });

      setVaults(strategiesMapped);
    } catch (e) {
      toast.error(`${e.message}`);
    }
    setLoading(false);
  }

  function init() {
    console.log("init");
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    const signer = prov.getSigner();
    setProvider(prov);
    const hodlBank = new ethers.Contract(Addresses.contract, HodlBank.abi, signer);

    hodlBank.on("StrategyDeployed", (e) => {
      console.log("deployed", e);
    });

    console.log("Contract at", hodlBank.address);

    setContract(hodlBank);
  }

  useEffect(init, []);

  useEffect(() => {
    if(contract)
      getStrategies();
  }, [contract])

  function onInput(e)  {
    value[e.target.name] = e.target.value;
    setValue(value);
  };
  function onFormSubmit(e) {
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
    <>
    <Row>
      <Col className="col-4">
        <DeployVaultForm loading={loading} onChange={onInput} onSubmit={onFormSubmit} onDeployStrategy={deployStrategy} formData={value} />
      </Col>
      <Col className="col-1"></Col>
      <Col className="col-7">
        <Row>
          <DeployedVaultsTable vaults={vaults} loading={loading} withdrawCallback={withdrawCallback} />
        </Row>
      </Col>
    </Row>
    <WithdrawModal show={showWithdrawModal} handleClose={handleClose} isLoading={withdrawModalLoading} handleWithdraw={handleWithdraw} strategy={withdrawModalData} />
    </>
  );
}

export default Home;