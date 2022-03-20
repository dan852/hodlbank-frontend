import { Modal, Alert, Button, Table } from 'react-bootstrap';
import { defaultTokens } from '../models/defaultTokens';
import { ethers } from 'ethers';
import moment from 'moment';

function WithdrawModal(props) {
    const show = props.show;
    const handleClose = props.handleClose;
    const handleWithdraw = props.handleWithdraw;
    const strategy = props.strategy;
    const ratios = props.strategy.ratios || [];
    const isLoading = props.isLoading;

    function getTokenName(address) {
        const matches = defaultTokens.filter(e => e.address === address);
        if(matches.length) {
          return matches[0].name;
        }
      }

    return <Modal show={show} onHide={props.handleClose} backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
      <Modal.Title>{strategy.name}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Alert variant="danger" show={!strategy.isDue}>
      <Alert.Heading>HODL!</Alert.Heading>
      <p>
          Your vault will be ready to be withdrawn in <strong>{ (moment(strategy.dueOn).diff(new Date(), 'days', true) < 1) ? `${ moment(strategy.dueOn).diff(new Date(), 'hours')} hours` : `${ moment(strategy.dueOn).diff(new Date(), 'days') } days` }</strong>.
      </p>
      <p>
        If you proceed now, we will take a 50% penalty.
      </p>
      </Alert>
      <h3>Deposited</h3>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th align="center">#</th>
            <th>Token</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
        { ratios.map((ratio, i) => <tr><td>{i+1}</td><td>{getTokenName(ratio.token)}</td><td>{ ethers.utils.formatUnits(ratio.value.toString()) }</td></tr>) }
        </tbody>
      </Table>

      <h3>Estimated Payout</h3>
      <Table bordered size="sm">
        <thead>
          <tr>
            <th align="center">#</th>
            <th>Token</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
        { ratios.map((ratio, i) => <tr><td>{i+1}</td><td>{getTokenName(ratio.token)}</td><td>{ (!strategy.isDue) ? <span className="text-danger">{ ethers.utils.formatUnits(ratio.value.div(2).toString()) }</span> : ethers.utils.formatUnits(ratio.value.toString())}</td></tr>) }
        </tbody>
      </Table>

      { (strategy.isDue) ? <span className="text-success">You will receive approx. {strategy.bonus} HBNK as a reward</span> : "" }
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" disabled={isLoading} onClick={handleClose}>
        Close
      </Button>
      <Button variant={ (!strategy.isDue) ? "danger" : "success"} disabled={isLoading} onClick={() => !isLoading ? handleWithdraw(strategy.strategyId) : null}>{isLoading ? 'Processing…' : 'Withdraw'}</Button>
    </Modal.Footer>
  </Modal>
}

export default WithdrawModal;