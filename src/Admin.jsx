import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Shield, RefreshCw, Save, Wallet, AlertTriangle } from 'lucide-react';

// Updated Contract ABI (including admin functions)
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
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "changeAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
				"name": "isIncrease",
				"type": "bool"
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
		"name": "getRateChangeLimits",
		"outputs": [
			{
				"internalType": "bool",
				"name": "canIncrease",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "canDecrease",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "maxAllowedRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timeUntilNextIncrease",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timeUntilNextDecrease",
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
		"name": "lastRateDecreaseTime",
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
		"name": "lastRateIncreaseTime",
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
		"name": "RATE_CHANGE_TIMELOCK",
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
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const SXBXAdminPanel = () => {
  // Contract address
  const sxbxTokenAddress = "0x8fb35D11080e44eFCa3295c7190F1F2bBf32Bd37"//"0xB07E9D6A5d76370Ea6984A3cca59528828DE0070";
  
  // State variables
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  // Contract state
  const [buyFee, setBuyFee] = useState(20);
  const [sellFee, setSellFee] = useState(30);
  const [exchangeRate, setExchangeRate] = useState("1");
  const [minPurchase, setMinPurchase] = useState("50");
  const [referralReward, setReferralReward] = useState("10");
  const [reserveWallet, setReserveWallet] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // New state for token recovery
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customTokenBalance, setCustomTokenBalance] = useState(0);
  const [customTokenDecimals, setCustomTokenDecimals] = useState(18);
  const [customTokenSymbol, setCustomTokenSymbol] = useState('');
  const [recoveryAmount, setRecoveryAmount] = useState('');
  
  // Fee withdrawal state
  const [accumulatedFees, setAccumulatedFees] = useState(0);
  const [reserveCoverage, setReserveCoverage] = useState(0);
  const [totalCirculatingValue, setTotalCirculatingValue] = useState(0);
  
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
          showNotification('error', 'Failed to initialize Web3 provider');
        }
      } else {
        showNotification('error', 'Please install MetaMask to use this admin panel');
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
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const accounts = await provider.send("eth_requestAccounts", []);
      const userAddress = accounts[0];
      setAccount(userAddress);
      
      const signer = await provider.getSigner();
      setSigner(signer);
      setConnected(true);
      
      // Initialize contract with signer
      const sxbxTokenContract = new ethers.Contract(sxbxTokenAddress, SXBXTokenABI, signer);
      setSxbxContract(sxbxTokenContract);
      
      // Check if connected account is the owner
      const ownerAddress = await sxbxTokenContract.owner();
      setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
      
      if (userAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        showNotification('error', 'This wallet is not the contract owner');
        setLoading(false);
        return;
      }
      
      // Get USDT contract
      const usdtAddress = await sxbxTokenContract.paymentToken();
      const usdtTokenContract = new ethers.Contract(usdtAddress, ERC20ABI, signer);
      setUsdtContract(usdtTokenContract);
      
      // Load contract data
      await loadContractData(sxbxTokenContract, usdtTokenContract);
      
      setLoading(false);
      showNotification('success', 'Connected as contract owner');
    } catch (error) {
      console.error("Connection error:", error);
      setLoading(false);
      showNotification('error', 'Failed to connect wallet: ' + error.message);
    }
  };

  // Load contract data
  const loadContractData = async (sxbxContract, usdtContract) => {
    try {
      setLoading(true);
      
      // Get current fee settings
      const currentBuyFee = await sxbxContract.buyFee();
      setBuyFee(currentBuyFee.toString());
      
      const currentSellFee = await sxbxContract.sellFee();
      setSellFee(currentSellFee.toString());
      
      // Get exchange rate
      const rate = await sxbxContract.exchangeRate();
      setExchangeRate(ethers.formatUnits(rate, 18));
      
      // Get referral settings
      const minPurchaseValue = await sxbxContract.minPurchaseForReferral();
      setMinPurchase(ethers.formatUnits(minPurchaseValue, 18));
      
      const rewardValue = await sxbxContract.referralReward();
      setReferralReward(ethers.formatUnits(rewardValue, 18));
      
      // Get reserve wallet
      const reserve = await sxbxContract.reserveWallet();
      setReserveWallet(reserve);
      
      // Get contract USDT balance
      const contractUsdtBalance = await usdtContract.balanceOf(sxbxTokenAddress);
      const decimals = await usdtContract.decimals();
      setTokenBalance(parseFloat(ethers.formatUnits(contractUsdtBalance, decimals)));
      
      // Get accumulated fees
      const fees = await sxbxContract.accumulatedFees();
      setAccumulatedFees(parseFloat(ethers.formatUnits(fees, decimals)));
      
      // Get reserve coverage
      const coverage = await sxbxContract.getReserveCoverage();
      setReserveCoverage(parseFloat(coverage) / 100); // Convert basis points to percentage
      
      // Get total circulating value
      const circulating = await sxbxContract.getTotalCirculatingValue();
      setTotalCirculatingValue(parseFloat(ethers.formatUnits(circulating, decimals)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading contract data:", error);
      setLoading(false);
      showNotification('error', 'Failed to load contract data: ' + error.message);
    }
  };

  // Refresh contract data
  const refreshData = async () => {
    if (!connected || !sxbxContract || !usdtContract) return;
    await loadContractData(sxbxContract, usdtContract);
    showNotification('success', 'Data refreshed successfully');
  };

  // Update fees
  const updateFees = async () => {
    if (!connected || !sxbxContract || !isOwner) return;
    
    try {
      setLoading(true);
      // Send transaction to update fees
      const tx = await sxbxContract.setBaseFees(buyFee, sellFee);
      await tx.wait();
      
      setLoading(false);
      showNotification('success', 'Fee rates updated successfully');
    } catch (error) {
      console.error("Error updating fees:", error);
      setLoading(false);
      showNotification('error', 'Failed to update fees: ' + error.message);
    }
  };

  // Update exchange rate
  const updateExchangeRate = async () => {
    if (!connected || !sxbxContract || !isOwner) return;
    
    try {
      setLoading(true);
      // Convert to wei with 18 decimals
      const rateInWei = ethers.parseUnits(exchangeRate, 18);
      
      // Send transaction to update exchange rate
      const tx = await sxbxContract.setExchangeRate(rateInWei);
      await tx.wait();
      
      setLoading(false);
      showNotification('success', 'Exchange rate updated successfully');
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      setLoading(false);
      showNotification('error', 'Failed to update exchange rate: ' + error.message);
    }
  };

  // Enable technical correction
  const enableTechnicalCorrection = async () => {
    if (!connected || !sxbxContract || !isOwner) return;
    
    try {
      setLoading(true);
      // Send transaction to enable technical correction
      const tx = await sxbxContract.enableTechnicalCorrection();
      await tx.wait();
      
      setLoading(false);
      showNotification('success', 'Technical correction mode enabled');
    } catch (error) {
      console.error("Error enabling technical correction:", error);
      setLoading(false);
      showNotification('error', 'Failed to enable technical correction: ' + error.message);
    }
  };

  // Update referral settings
  const updateReferralSettings = async () => {
    if (!connected || !sxbxContract || !isOwner) return;
    
    try {
      setLoading(true);
      // Convert to wei with 18 decimals
      const minPurchaseInWei = ethers.parseUnits(minPurchase, 18);
      const rewardInWei = ethers.parseUnits(referralReward, 18);
      
      // Send transactions to update referral settings
      const tx1 = await sxbxContract.setMinPurchaseForReferral(minPurchaseInWei);
      await tx1.wait();
      
      const tx2 = await sxbxContract.setReferralReward(rewardInWei);
      await tx2.wait();
      
      setLoading(false);
      showNotification('success', 'Referral settings updated successfully');
    } catch (error) {
      console.error("Error updating referral settings:", error);
      setLoading(false);
      showNotification('error', 'Failed to update referral settings: ' + error.message);
    }
  };

  // Withdraw fees
  const withdrawFees = async () => {
    if (!connected || !sxbxContract || !isOwner || !withdrawAmount) return;
    
    try {
      setLoading(true);
      // Convert to wei with appropriate decimals
      const decimals = await usdtContract.decimals();
      const amountInWei = ethers.parseUnits(withdrawAmount, decimals);
      
      // Send transaction to withdraw fees
      const tx = await sxbxContract.withdrawFees(amountInWei);
      await tx.wait();
      
      // Refresh data
      await loadContractData(sxbxContract, usdtContract);
      
      setWithdrawAmount('');
      setLoading(false);
      showNotification('success', 'Fees withdrawn successfully');
    } catch (error) {
      console.error("Error withdrawing fees:", error);
      setLoading(false);
      showNotification('error', 'Failed to withdraw fees: ' + error.message);
    }
  };

  // Check token balance
  const checkTokenBalance = async () => {
    if (!connected || !signer || !customTokenAddress) return;
    
    try {
      setLoading(true);
      
      // Validate address
      if (!ethers.isAddress(customTokenAddress)) {
        showNotification('error', 'Invalid token address');
        setLoading(false);
        return;
      }
      
      // Create token contract instance
      const tokenContract = new ethers.Contract(customTokenAddress, ERC20ABI, signer);
      
      // Get token information
      const decimals = await tokenContract.decimals();
      setCustomTokenDecimals(decimals);
      
      const symbol = await tokenContract.symbol();
      setCustomTokenSymbol(symbol);
      
      // Get token balance
      const balance = await tokenContract.balanceOf(sxbxTokenAddress);
      setCustomTokenBalance(parseFloat(ethers.formatUnits(balance, decimals)));
      
      setLoading(false);
      showNotification('success', `Found ${symbol} token balance`);
    } catch (error) {
      console.error("Error checking token balance:", error);
      setLoading(false);
      showNotification('error', 'Failed to check token balance: ' + error.message);
    }
  };

  // Recover tokens
  const recoverTokens = async () => {
    if (!connected || !sxbxContract || !isOwner || !recoveryAmount || !customTokenAddress) return;
    
    try {
      setLoading(true);
      
      // Convert to wei with appropriate decimals
      const amountInWei = ethers.parseUnits(recoveryAmount, customTokenDecimals);
      
      // Send transaction to recover tokens
      const tx = await sxbxContract.recoverTokens(customTokenAddress, amountInWei);
      await tx.wait();
      
      // Reset recovery amount
      setRecoveryAmount('');
      
      // Check balance again
      checkTokenBalance();
      
      setLoading(false);
      showNotification('success', 'Tokens recovered successfully');
    } catch (error) {
      console.error("Error recovering tokens:", error);
      setLoading(false);
      showNotification('error', 'Failed to recover tokens: ' + error.message);
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-700 p-4 text-white">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">SXBX Token Admin Panel</h1>
          </div>
          <p className="text-sm opacity-80">Contract: {sxbxTokenAddress}</p>
        </div>
        
        {/* Notification */}
        {notification.message && (
          <div className={`p-3 ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} flex items-center`}>
            <p>{notification.message}</p>
          </div>
        )}
        
        {/* Connect Wallet Section */}
        <div className="p-4 border-b">
          {!connected ? (
            <button 
              onClick={connectWallet} 
              disabled={loading || !provider}
              className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5 mr-2" />}
              Connect Admin Wallet
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Account</p>
                <p className="font-medium">{account.slice(0, 6)}...{account.slice(-4)}</p>
                <p className="text-sm mt-1 text-green-600">{isOwner ? 'Owner ✓' : 'Not Owner ✗'}</p>
              </div>
              <button 
                onClick={refreshData}
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          )}
        </div>
        
        {/* Admin Panel (only visible to owner) */}
        {connected && isOwner && (
          <div className="p-4">
            {/* Fee Settings */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-3">Fee Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buy Fee (basis points)</label>
                  <input
                    type="number"
                    value={buyFee}
                    onChange={(e) => setBuyFee(e.target.value)}
                    placeholder="20 = 0.2%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sell Fee (basis points)</label>
                  <input
                    type="number"
                    value={sellFee}
                    onChange={(e) => setSellFee(e.target.value)}
                    placeholder="30 = 0.3%"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={updateFees}
                disabled={loading}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md w-full flex justify-center items-center"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                Update Fees
              </button>
            </div>
            
            {/* Exchange Rate */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-3">Exchange Rate</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SXBX to USDT Rate</label>
                <input
                  type="text"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="1 = 1:1 ratio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1">1 SXBX = {exchangeRate} USDT</p>
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={updateExchangeRate}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex justify-center items-center"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                  Update Exchange Rate
                </button>
                <button
                  onClick={enableTechnicalCorrection}
                  disabled={loading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md flex justify-center items-center"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Enable Technical Correction
                </button>
              </div>
            </div>
            
            {/* Referral Settings */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-3">Referral Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase (USDT)</label>
                  <input
                    type="text"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Reward (SXBX)</label>
                  <input
                    type="text"
                    value={referralReward}
                    onChange={(e) => setReferralReward(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={updateReferralSettings}
                disabled={loading}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md w-full flex justify-center items-center"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                Update Referral Settings
              </button>
            </div>
            
            {/* Fee Withdrawal & Reserves */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-3">Fee Withdrawal & Reserves</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Reserve Wallet</p>
                  <p className="font-medium text-sm truncate">{reserveWallet}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reserve Coverage</p>
                  <p className="font-medium">{reserveCoverage.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">USDT Balance in Contract</p>
                  <p className="font-medium">{tokenBalance.toFixed(2)} USDT</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Accumulated Fees</p>
                  <p className="font-medium">{accumulatedFees.toFixed(2)} USDT</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Circulating Value</p>
                  <p className="font-medium">{totalCirculatingValue.toFixed(2)} USDT</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={withdrawFees}
                  disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > accumulatedFees}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Withdraw Fees
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Note: You can only withdraw up to the accumulated fees amount while maintaining 100% reserve coverage.</p>
            </div>
            
            {/* Token Recovery */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-3">Recover Stuck Tokens</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Address</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customTokenAddress}
                    onChange={(e) => setCustomTokenAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={checkTokenBalance}
                    disabled={loading || !customTokenAddress}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Check Balance
                  </button>
                </div>
              </div>
              
              {customTokenBalance > 0 && (
                <div className="mb-4">
                  <div className="p-3 bg-blue-50 rounded-md mb-3">
                    <p className="text-sm text-blue-700">Found {customTokenBalance.toFixed(6)} {customTokenSymbol} tokens in contract</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={recoveryAmount}
                        onChange={(e) => setRecoveryAmount(e.target.value)}
                        placeholder={`Amount to recover (max ${customTokenBalance.toFixed(6)})`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      onClick={recoverTokens}
                      disabled={loading || !recoveryAmount || parseFloat(recoveryAmount) <= 0 || parseFloat(recoveryAmount) > customTokenBalance}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
                    >
                      Recover Tokens
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Note: This function cannot be used to recover SXBX or the payment token (USDT).</p>
                </div>
              )}
              
              {customTokenBalance === 0 && customTokenSymbol && (
                <div className="p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">No {customTokenSymbol} tokens found in contract</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600 border-t">
          <p>SXBX Token Admin Panel - Access Restricted</p>
        </div>
      </div>
    </div>
  );
};

export default SXBXAdminPanel;