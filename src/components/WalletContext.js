import React, { createContext, useState, useEffect, useContext } from "react";

const WalletContext = createContext();

const WalletContextProvider = ({ children }) => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        setAccount("");
    }, [])

    return (
        // the Provider gives access to the context to its children
        <WalletContext.Provider value={{ account: account, setAccount }}>
          {children}
        </WalletContext.Provider>
      );
}

const useWalletContext = () => {
    // get the context
    const context = useContext(WalletContext);
  
    // if `undefined`, throw an error
    if (context === undefined) {
      throw new Error("useWalletContext was used outside of its Provider");
    }
  
    return context;
  };

export { WalletContext, WalletContextProvider, useWalletContext };