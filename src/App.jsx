import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ethers } from 'ethers';
import contractABI from './contractABI';
import 'react-toastify/dist/ReactToastify.css';

const TieredPaymentUI = () => {
  const [account, setAccount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [isMobile, setIsMobile] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [showDepositInfo, setShowDepositInfo] = useState(false);

  // Contract configurations remain the same
  const BSC_MAINNET_PARAMS = {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  };

  const CONTRACT_ABI = contractABI;
  const CONTRACT_ADDRESS = "0xffd698f8d1aBF430ba36061E8d8B657EcAe58414";
  const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
  ];
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

  useEffect(() => {
    checkMobileDevice();
    setupNetworkListeners();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      await setupWeb3();
    }
  };

  const handleDisconnect = () => {
    setAccount('');
    setContract(null);
    setProvider(null);
    setUsdtBalance('0');
    setShowDepositInfo(false);
    toast.info("Wallet disconnected");
  };

  const setupWeb3 = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      setProvider(provider);
      setContract(contract);

      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const balance = await usdtContract.balanceOf(await signer.getAddress());
      setUsdtBalance(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error("Error setting up web3:", error);
      setError("Failed to setup web3 connection");
      toast.error("Failed to setup web3 connection");
    }
  };

/*   const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await setupWeb3();
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  }; */

  const checkMobileDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobile(/android|ios|iphone|ipad/i.test(userAgent.toLowerCase()));
  };

  const setupNetworkListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const handleChainChanged = (chainId) => {
    setCurrentNetwork(chainId);
    if (chainId !== BSC_MAINNET_PARAMS.chainId) {
      toast.error("Please switch to BSC Network");
    }
    window.location.reload();
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentNetwork(chainId);
      
      if (chainId !== BSC_MAINNET_PARAMS.chainId) {
        await switchToBscTestnet();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  const switchToBscTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_MAINNET_PARAMS.chainId }],
      });
      
      toast.success("Successfully connected to BSC Network");
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_MAINNET_PARAMS],
          });
          
          toast.success("BSC Network has been added to your wallet");
          return true;
        } catch (addError) {
          toast.error("Failed to add BSC Network to your wallet");
          return false;
        }
      }
      toast.error("Failed to switch network to BSC Network");
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      if (window.ethereum) {
        const networkValid = await checkNetwork();
        if (!networkValid) return;

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        console.log(accounts[0])
        setAccount(accounts[0]);
        await setupWeb3();
        
        toast.success("Successfully connected to your wallet");
      } else {
        handleNoMetaMask();
      }
    } catch (error) {
      setError("Error connecting wallet");
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleNoMetaMask = () => {
    if (isMobile) {
      const dappUrl = window.location.href;
      const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
      
      const timeout = setTimeout(() => {
        window.location.href = 'https://metamask.io/download/';
      }, 1500);

      window.location.href = metamaskAppDeepLink;

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          clearTimeout(timeout);
        }
      });
    } else {
      setError("Please install MetaMask!");
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  const approveUSDT = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const amount = ethers.parseUnits(usdtAmount);
      const tx = await usdtContract.approve(CONTRACT_ADDRESS, amount);
      await tx.wait();
      toast.success("USDT Approved Successfully");
      return true;
    } catch (error) {
      console.error("USDT Approval Error:", error);
      setError("Error approving USDT");
      toast.error("Failed to approve USDT");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError('');

      const networkValid = await checkNetwork();
      if (!networkValid) return;

      const approved = await approveUSDT();
      if (!approved) return;

      const amount = ethers.parseUnits(usdtAmount);
      const tx = await contract.purchase(amount);
      
      toast.info("Transaction Submitted. Please wait for confirmation...");

      await tx.wait();
      
      toast.success("Purchase completed successfully!");

      setUsdtAmount('');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider.getSigner());
      const newBalance = await usdtContract.balanceOf(account);
      setUsdtBalance(ethers.formatUnits(newBalance));
    } catch (err) {
      setError(err.message || 'Transaction failed');
      toast.error(err.message || "Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    checkMobileDevice();
    //checkIfWalletIsConnected();
    setupNetworkListeners();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="card">
        <h2>Token Purchase</h2>
        
        {!account ? (
          <button 
            onClick={connectWallet} 
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="purchase-form">
            <div className="wallet-info">
              <span>Connected: {formatAddress(account)}</span>
              <span>USDT Balance: {parseFloat(usdtBalance).toFixed(2)}</span>
            </div>

            <div className="input-group">
              <label htmlFor="usdtAmount">USDT Amount</label>
              <input
                id="usdtAmount"
                type="number"
                min="1"
                max="10000"
                value={usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                placeholder="Enter USDT amount"
                className="amount-input"
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              onClick={handlePurchase} 
              disabled={loading || !usdtAmount || usdtAmount < 1 || usdtAmount > 10000}
              className="purchase-button"
            >
              {loading ? 'Processing...' : 'Purchase Tokens'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin-bottom: 20px;
          text-align: center;
        }

        .connect-button, .purchase-button {
          width: 100%;
          padding: 10px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .connect-button:disabled, .purchase-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .purchase-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .wallet-info {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .amount-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .error-message {
          color: #d32f2f;
          padding: 10px;
          background: #ffebee;
          border-radius: 4px;
          font-size: 14px;
        }

        label {
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default TieredPaymentUI;