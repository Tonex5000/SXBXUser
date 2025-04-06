import React, { useState, useEffect } from 'react';
import { AlertCircle, Wallet, DollarSign, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';

// Contract ABIs
const SXBXTokenABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_reserveWallet",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "usdtAmount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "ref",
				"type": "address"
			}
		],
		"name": "buy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fee",
				"type": "uint256"
			}
		],
		"name": "Buy",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "enableTechnicalCorrection",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldRate",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newRate",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isTechnicalCorrection",
				"type": "bool"
			}
		],
		"name": "ExchangeRateUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FeeWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "recoverTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "referred",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "ReferralReward",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "sxbxAmount",
				"type": "uint256"
			}
		],
		"name": "sell",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fee",
				"type": "uint256"
			}
		],
		"name": "Sell",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_buyFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_sellFee",
				"type": "uint256"
			}
		],
		"name": "setBaseFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_exchangeRate",
				"type": "uint256"
			}
		],
		"name": "setExchangeRate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_minPurchase",
				"type": "uint256"
			}
		],
		"name": "setMinPurchaseForReferral",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_reward",
				"type": "uint256"
			}
		],
		"name": "setReferralReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokensRecovered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "accumulatedFees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "exchangeRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "exchangeRate24HoursAgo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getExchangeRateLimits",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "minAllowedRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxAllowedRate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getReserveCoverage",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalCirculatingValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasPurchased",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isInTechnicalCorrection",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastExchangeRateUpdateTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_FEE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_RATE_INCREASE_PERCENT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "minPurchaseForReferral",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "mirrorSXBX",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paymentToken",
		"outputs": [
			{
				"internalType": "contract IERC20Metadata",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "RATE_UPDATE_TIMELOCK",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "referralReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "referrer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "reserveWallet",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sxbxMirrorToken",
		"outputs": [
			{
				"internalType": "contract SXBXMirrorToken",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

const SXBXTokenApp = () => {
  // Contract addresses
  const sxbxTokenAddress = "0x8fb35D11080e44eFCa3295c7190F1F2bBf32Bd37"; // Your SXBX contract address
  
  // State variables
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [sxbxBalance, setSxbxBalance] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [referralAddress, setReferralAddress] = useState('');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [buyFeeRate, setBuyFeeRate] = useState(0.002); // 0.2% default
  const [sellFeeRate, setSellFeeRate] = useState(0.003); // 0.3% default
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [usdtApproved, setUsdtApproved] = useState(false);
  const [usdtAddress, setUsdtAddress] = useState('0x5369AF454AD2Bb2BE3c3f282Abc783200168dE42'); // Setting default USDT address
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // Contract instances
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [sxbxContract, setSxbxContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);

  // Initialize ethers provider
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
        } catch (error) {
          console.error("Failed to initialize provider:", error);
          showNotification('error', 'Failed to initialize Web3 provider');
        }
      } else {
        showNotification('error', 'Please install MetaMask to use this app');
      }
    };

    initProvider();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!provider) {
      showNotification('error', 'Web3 provider not available');
      return;
    }
    
    try {
      setLoading(true);
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const accounts = await provider.send("eth_requestAccounts", []);
      const userAddress = accounts[0]; // Get the first account
      setAccount(userAddress);
      
      // Set up signer - important for transactions
      const signer = await provider.getSigner();
      setSigner(signer);
      
      setConnected(true);
      
      // Initialize contracts with signer for transactions
      const sxbxTokenContract = new ethers.Contract(sxbxTokenAddress, SXBXTokenABI, signer);
      setSxbxContract(sxbxTokenContract);
      
      // Get payment token address from SXBX contract if possible, otherwise use default
      try {
        const paymentTokenAddress = await sxbxTokenContract.paymentToken();
        setUsdtAddress(paymentTokenAddress);
      } catch (error) {
        console.warn("Could not get payment token address, using default:", error);
        // Use the default address set in state
      }
      
      const usdtTokenContract = new ethers.Contract(usdtAddress, ERC20ABI, signer);
      setUsdtContract(usdtTokenContract);
      
      // Load contract data
      await loadContractData(sxbxTokenContract, usdtTokenContract, userAddress);
      
      setLoading(false);
      showNotification('success', 'Wallet connected successfully!');
    } catch (error) {
      console.error("Connection error:", error);
      setLoading(false);
      showNotification('error', 'Failed to connect wallet: ' + error.message);
    }
  };

  // Load contract data
  const loadContractData = async (sxbxContract, usdtContract, userAddress) => {
    try {
      // Get exchange rate
      try {
        const rate = await sxbxContract.exchangeRate();
        setExchangeRate(ethers.formatUnits(rate, 18)); // Assuming 18 decimals
      } catch (error) {
        console.warn("Could not get exchange rate, using default:", error);
      }
      
      // Get fee rates
      try {
        const buyFee = await sxbxContract.buyFee();
        setBuyFeeRate(Number(buyFee) / 10000); // Convert from basis points
        
        const sellFee = await sxbxContract.sellFee();
        setSellFeeRate(Number(sellFee) / 10000); // Convert from basis points
      } catch (error) {
        console.warn("Could not get fee rates, using defaults:", error);
      }
      
      // Get SXBX balance
      try {
        const sxbxUserBalance = await sxbxContract.mirrorSXBX(userAddress);
        setSxbxBalance(parseFloat(ethers.formatUnits(sxbxUserBalance, 18)));
      } catch (error) {
        console.error("Error getting SXBX balance:", error);
        showNotification('error', 'Failed to load SXBX balance');
      }
      
      // Get USDT balance
      try {
        const usdtUserBalance = await usdtContract.balanceOf(userAddress);
        const decimals = await usdtContract.decimals();
        setUsdtBalance(parseFloat(ethers.formatUnits(usdtUserBalance, decimals)));
      } catch (error) {
        console.error("Error getting USDT balance:", error);
        showNotification('error', 'Failed to load USDT balance');
      }
      
      // Check if USDT is approved
      try {
        const allowance = await usdtContract.allowance(userAddress, sxbxTokenAddress);
        setUsdtApproved(!allowance.isZero());
      } catch (error) {
        console.error("Error checking allowance:", error);
      }
    } catch (error) {
      console.error("Error loading contract data:", error);
      showNotification('error', 'Failed to load contract data: ' + error.message);
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    if (!connected || !sxbxContract || !usdtContract) return;
    
    try {
      // Get SXBX balance
      const sxbxUserBalance = await sxbxContract.mirrorSXBX(account);
      setSxbxBalance(parseFloat(ethers.formatUnits(sxbxUserBalance, 18)));
      
      // Get USDT balance
      const usdtUserBalance = await usdtContract.balanceOf(account);
      const decimals = await usdtContract.decimals();
      setUsdtBalance(parseFloat(ethers.formatUnits(usdtUserBalance, decimals)));
      
      // Check if USDT is approved
      const allowance = await usdtContract.allowance(account, sxbxTokenAddress);
      setUsdtApproved(!allowance.isZero());
      
      showNotification('success', 'Balances refreshed successfully!');
    } catch (error) {
      console.error("Error refreshing balances:", error);
      showNotification('error', 'Failed to refresh balances: ' + error.message);
    }
  };

  // Approve USDT
  const approveUsdt = async () => {
    if (!connected || !usdtContract || !signer) return;
    
    try {
      setApproving(true);
      // Approve max amount
      const tx = await usdtContract.approve(
        sxbxTokenAddress, 
        ethers.MaxUint256 // Use MaxUint256 from ethers
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      setUsdtApproved(true);
      setApproving(false);
      showNotification('success', 'USDT approved successfully!');
    } catch (error) {
      console.error("Approval error:", error);
      setApproving(false);
      showNotification('error', 'Failed to approve USDT: ' + error.message);
    }
  };

  // Buy tokens function
  const buyTokens = async () => {
    if (!connected || !sxbxContract || !usdtContract || !buyAmount || parseFloat(buyAmount) <= 0) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }
    
    if (!usdtApproved) {
      showNotification('error', 'Please approve USDT first');
      return;
    }
    
    try {
      setLoading(true);
      // Convert amount to Wei
      const decimals = await usdtContract.decimals();
      const amountInWei = ethers.parseUnits(buyAmount, decimals);
      
      // Call buy function
      const refAddress = referralAddress || ethers.ZeroAddress; // Use ZeroAddress from ethers
      const tx = await sxbxContract.buy(amountInWei, refAddress);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Refresh balances
      await refreshBalances();
      
      setBuyAmount('');
      setLoading(false);
      showNotification('success', 'Successfully bought SXBX tokens!');
    } catch (error) {
      console.error("Buy error:", error);
      setLoading(false);
      showNotification('error', 'Transaction failed: ' + error.message);
    }
  };

  // Sell tokens function
  const sellTokens = async () => {
    if (!connected || !sxbxContract || !sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > sxbxBalance) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }
    
    try {
      setLoading(true);
      // Convert amount to Wei
      const amountInWei = ethers.parseUnits(sellAmount, 18);
      
      // Call sell function
      const tx = await sxbxContract.sell(amountInWei);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Refresh balances
      await refreshBalances();
      
      setSellAmount('');
      setLoading(false);
      showNotification('success', 'Successfully sold SXBX tokens!');
    } catch (error) {
      console.error("Sell error:", error);
      setLoading(false);
      showNotification('error', 'Transaction failed: ' + error.message);
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white">
          <h1 className="text-xl font-bold">SXBX Token Interface</h1>
          <p className="text-sm opacity-80">Exchange Rate: 1 SXBX = {exchangeRate} USDT</p>
        </div>
        
        {/* Notification */}
        {notification.message && (
          <div className={`p-3 ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} flex items-center`}>
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{notification.message}</p>
          </div>
        )}
        
        {/* Connect Wallet Section */}
        <div className="p-4 border-b">
          {!connected ? (
            <button 
              onClick={connectWallet} 
              disabled={loading || !provider}
              className="w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5 mr-2" />}
              Connect Wallet
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600">Connected Account</p>
                  <p className="font-medium">{account.slice(0, 6)}...{account.slice(-4)}</p>
                </div>
                <button 
                  onClick={refreshBalances}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm text-gray-600">SXBX Balance</p>
                  <p className="font-medium">{sxbxBalance.toFixed(4)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm text-gray-600">USDT Balance</p>
                  <p className="font-medium">{usdtBalance.toFixed(4)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Trading Section */}
        {connected && (
          <div className="p-4">
            {/* USDT Approval Section */}
            {!usdtApproved && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700 mb-2">You need to approve USDT spending before buying tokens</p>
                <button
                  onClick={approveUsdt}
                  disabled={approving}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                >
                  {approving ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Approve USDT'}
                </button>
              </div>
            )}
            
            {/* Buy Section */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Buy SXBX Tokens</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="buyAmount" className="block text-sm font-medium text-gray-700 mb-1">USDT Amount</label>
                  <div className="relative">
                    <input
                      id="buyAmount"
                      type="number"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      placeholder="Enter USDT amount"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  {buyAmount && (
                    <p className="mt-1 text-sm text-gray-500">
                      You will receive approximately {((parseFloat(buyAmount) * (1 - buyFeeRate)) / parseFloat(exchangeRate)).toFixed(4)} SXBX
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-1">Referral Address (Optional)</label>
                  <input
                    id="referral"
                    type="text"
                    value={referralAddress}
                    onChange={(e) => setReferralAddress(e.target.value)}
                    placeholder="0x..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={buyTokens}
                  disabled={loading || !buyAmount || !usdtApproved}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Buy SXBX Tokens'}
                </button>
              </div>
            </div>
            
            {/* Sell Section */}
            <div>
              <h2 className="text-lg font-medium mb-2">Sell SXBX Tokens</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="sellAmount" className="block text-sm font-medium text-gray-700 mb-1">SXBX Amount</label>
                  <input
                    id="sellAmount"
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="Enter SXBX amount"
                    max={sxbxBalance}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {sellAmount && (
                    <p className="mt-1 text-sm text-gray-500">
                      You will receive approximately {((parseFloat(sellAmount) * parseFloat(exchangeRate)) * (1 - sellFeeRate)).toFixed(4)} USDT
                    </p>
                  )}
                </div>
                
                <button
                  onClick={sellTokens}
                  disabled={loading || !sellAmount || parseFloat(sellAmount) > sxbxBalance}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Sell SXBX Tokens'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600 border-t">
          <p>SXBX Token - Buy Fee: {(buyFeeRate * 100).toFixed(1)}% | Sell Fee: {(sellFeeRate * 100).toFixed(1)}%</p>
          <p className="mt-1">Contract: {sxbxTokenAddress.slice(0, 6)}...{sxbxTokenAddress.slice(-4)}</p>
          <p className="mt-1">USDT: {usdtAddress.slice(0, 6)}...{usdtAddress.slice(-4)}</p>
        </div>
      </div>
    </div>
  );
};

export default SXBXTokenApp;
