import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';


function AddTokenButton() {
    const tokenAddress = '0x4E8137a8B6Dd3Ef64553AFf211ebf323CeF2C9D8';
    const tokenSymbol = 'HBNK';
    const tokenDecimals = 18;
    const tokenImage = 'https://i.ibb.co/1KfD9HP/Screenshot-2022-03-20-at-10-52-22-AM.png';
    const { ethereum } = window;

    useEffect(() => {

    }, []);

    async function addToken() {
        try {
            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
            await ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                  address: tokenAddress, // The address that the token is at.
                  symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                  decimals: tokenDecimals, // The number of decimals in the token
                  image: tokenImage, // A string url of the token logo
                },
              },
            });
        } catch(e) {

        }
    }
    
    return (
        <div className="mt-2"><Button onClick={addToken} variant="outline-secondary" size="sm">Add HBNK Token</Button></div>
    )
}

export default AddTokenButton;