import React, { useEffect } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding'
import Button from 'react-bootstrap/Button';
import { useWalletContext } from './WalletContext';

const ONBOARD_TEXT = 'Click here to install MetaMask!';
const CONNECT_TEXT = 'Connect';
const CONNECTED_TEXT = 'Connected';


function ConnectWalletButton() {
    const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
    const [isDisabled, setDisabled] = React.useState(false);
    const [accounts, setAccounts] = React.useState([]);
    const onboarding = React.useRef();

    const { ethereum } = window;

    const { account, setAccount } = useWalletContext();

    useEffect(() => {
      if (!onboarding.current) {
        onboarding.current = new MetaMaskOnboarding();
      }
    }, []);

    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(CONNECTED_TEXT);
                setDisabled(true);
                onboarding.current.stopOnboarding();
            } else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
            }
        }
    }, [accounts]);

    useEffect(() => {
        function handleNewAccounts(newAccounts) {
            setAccounts(newAccounts);
            setAccount(newAccounts[0]);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            ethereum.request({ method: 'eth_requestAccounts' }).then(handleNewAccounts);
            ethereum.on('accountsChanged', handleNewAccounts);
            
            return () => { 
                ethereum.off('accountsChanged', handleNewAccounts);
            };
        }
    }, []);

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            ethereum.request({ method: 'eth_requestAccounts' }).then((newAccounts) => setAccounts(newAccounts));
        } else {
            onboarding.current.startOnboarding();
        }
    };
    
    return (
        <div className="mt-2"><Button disabled={isDisabled} onClick={onClick} variant={ (isDisabled) ? "light" : "dark" } className="float-end">{buttonText}</Button></div>
    )
}

export default ConnectWalletButton;