import { Table, Button, Spinner } from 'react-bootstrap';
import { defaultTokens } from '../models/defaultTokens';
import { ethers } from 'ethers';
import moment from 'moment';

function DeployedVaultsTable(props) {
  const vaults = props.vaults;
  const loading = props.loading;

  const withdrawCallback = props.withdrawCallback;

  function getTokenName(address) {
    const matches = defaultTokens.filter(e => e.address === address);
    if(matches.length) {
      return matches[0].name;
    }
  }

  function getDueTime(dueOn) {
    if(moment(dueOn).diff(new Date(), 'days', true) < 0 ) {
      return `now`;
    }
    else if(moment(dueOn).diff(new Date(), 'days', true) < 1 ) {
      return `${ moment(dueOn).diff(new Date(), 'hours')} hours`
    } else {
      return `${ moment(dueOn).diff(new Date(), 'days') } days`;
    } 
  }
  
  return (
    <>
      <h3 className="mb-4 mt-3">Your Vaults</h3>
      <Table bordered size="sm">
          <thead key={'vaults_table_head__'}>
            <tr key={'vaults_table_head'}>
              <th align="center">#</th>
              <th>Name</th>
              <th>Token</th>
              <th>%</th>
              <th>Amount</th>
              <th>Due</th>
              <th></th>
            </tr>
          </thead>
          <tbody key={'vaults_table_body__'}>
            <tr key="vaults_table_loading" style={(!loading) ? {display: 'none'} : {} }><td colSpan="7" align="center"><Spinner animation="border" className="my-3" /></td></tr>
            <tr key="vaults_table_no_data" style={(loading || vaults.length !== 0) ? {display: 'none'} : {} }><td colSpan="7" align="center">No Vaults deployed</td></tr>
            { 
              vaults.map((vault, i) => { 
                //if(vault.ratios.length === 0) return;
                return <>
                  <tr key={ 'vaults_table_row_' && (i+1)} style={(loading) ? {display: 'none'} : {} }>
                    <td align="center" rowSpan={vault.ratios.length}>{i+1}</td>
                    <td rowSpan={vault.ratios.length}>{vault.name}<br /><small>{ vault.initialAmount.toString() } ETH</small></td>
                    <td>{ getTokenName(vault.ratios[0].token || "") }</td>
                    <td>{ vault.ratios[0].ratio.toString() }</td>
                    <td>{ ethers.utils.formatUnits(vault.ratios[0].value) }</td>
                    <td rowSpan={vault.ratios.length}>{ getDueTime(vault.dueOn) }</td>
                    <td className="text-center" rowSpan={vault.ratios.length}><Button variant={(vault.isDue) ? "success" : "outline-danger"} className="btn-sm" onClick={() => withdrawCallback( vault )}>Withdraw</Button></td>
                  </tr>
                  { 
                    vault.ratios.map(
                      (ratio, ii) => { 
                        if(ii > 0) { 
                          return <tr key={ 'vaults_table_row_' && (i+1) && (ii+1)} style={(loading) ? {display: 'none'} : {}}>
                                  <td>{ getTokenName(ratio.token) }</td>
                                  <td>{ ratio.ratio.toString() }</td>
                                  <td>{ ethers.utils.formatUnits(ratio.value) }</td>
                                </tr> 
                        } else {
                          return <></>;
                        }
                      }
                    ) 
                  }
                </> 
              }
            ) 
          }
          </tbody>
      </Table> 
    </>
  );
}

export default DeployedVaultsTable;