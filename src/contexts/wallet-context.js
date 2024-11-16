import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const RIVEST_CHAIN = {
  id: 21097,
  network: "Rivest",
  name: "Rivest Testnet",
  nativeCurrency: {
    name: "INCO",
    symbol: "INCO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://validator.rivest.inco.org"],
    },
    public: {
      http: ["https://validator.rivest.inco.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.rivest.inco.org",
    },
  },
};

const WalletContext = createContext({
  address: null,
  signer: null,
  isConnecting: false,
  isConnected: false,
  chainId: null,
  isCorrectChain: false,
  connect: async () => { },
  disconnect: () => { },
  switchChain: async () => { },
});

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      checkConnection();

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [mounted]);

  const handleChainChanged = (newChainId) => {
    if (typeof window !== "undefined") {
      setChainId(Number(newChainId));
      setIsCorrectChain(Number(newChainId) === RIVEST_CHAIN.id);
      window.location.reload();
    }
  };

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setChainId(Number(chainId));
        setIsCorrectChain(Number(chainId) === RIVEST_CHAIN.id);

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setAddress(accounts[0]);
          setSigner(signer);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAddress(accounts[0]);
        setSigner(signer);
        setIsConnected(true);
      } catch (error) {
        console.error("Error updating signer:", error);
        disconnect();
      }
    } else {
      disconnect();
    }
  };

  const switchChain = async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${RIVEST_CHAIN.id.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${RIVEST_CHAIN.id.toString(16)}`,
                chainName: RIVEST_CHAIN.name,
                nativeCurrency: RIVEST_CHAIN.nativeCurrency,
                rpcUrls: RIVEST_CHAIN.rpcUrls.public.http,
                blockExplorerUrls: [RIVEST_CHAIN.blockExplorers.default.url],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding chain:", addError);
        }
      }
      console.error("Error switching chain:", switchError);
    }
  };

  const connect = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    console.log("trying to connect");

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(Number(chainId));

      if (Number(chainId) !== RIVEST_CHAIN.id) {
        await switchChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setAddress(accounts[0]);
      setSigner(signer);
      setIsConnected(true);
      setIsCorrectChain(Number(chainId) === RIVEST_CHAIN.id);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    setIsCorrectChain(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        signer,
        isConnecting,
        isConnected,
        chainId,
        isCorrectChain,
        connect,
        disconnect,
        switchChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
