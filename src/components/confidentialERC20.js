import { useEffect, useState } from "react";
import {
  Wallet,
  Lock,
  RefreshCw,
  HelpCircle,
  Key,
  DollarSign,
  ArrowUpIcon,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { CodeSnippets } from "./code-snippets";
import { BrowserProvider, Contract, ethers } from "ethers";
import { toHexString } from "@/utils/utils";
import erc20ABI from "@/abi/erc20ABI.json";
import { useWallet } from "@/contexts/wallet-context";
import Link from "next/link";
import { getFhevmInstance } from "@/utils/fhevm";

const CONTRACT_ADDRESS_SWAP = "0x5550edF005ffFc7f398Dc7A2DD6d5021E8D97886";
const CONTRACT_ADDRESS_TOKEN_A = "0x811945Cc1D17482359a27A4E7D43C352DFAE0540";
const CONTRACT_ADDRESS_TOKEN_B = "0x79B912539834946DF7DFaA2539b31D2B4E487d76";

const addLiquidityABI = [
  {
    inputs: [
      {
        internalType: "einput",
        name: "_addToken0Amount",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "inputProof0",
        type: "bytes",
      },
      {
        internalType: "einput",
        name: "_addToken1Amount",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "inputProof1",
        type: "bytes",
      },
    ],
    name: "mockAddLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ConfidentialERC20 = () => {
  const [signer, setSigner] = useState(null);
  const [amountSwap, setAmountSwap] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [userBalanceA, setUserBalanceA] = useState("Hidden");
  const [userBalanceB, setUserBalanceB] = useState("Hidden");
  const [amountAddTokenA, setAmountAddTokenA] = useState("");
  const [amountAddTokenB, setAmountAddTokenB] = useState("");
  const [isAddingTokenA, setIsAddingTokenA] = useState(false);
  const [isAddingTokenB, setIsAddingTokenB] = useState(false);
  const [amountRemoveLiquidity, setAmountRemoveLiquidity] = useState("");
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);
  const [instance, setInstance] = useState(null);
  const { disconnect } = useWallet();

  useEffect(() => {
    const getInstance = async () => {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const instance = await getFhevmInstance();
      setInstance(instance);
      setSigner(signer);
    };

    getInstance();

    //below this is extra code, just to show how to handle account changes
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setSigner(signer);
        } catch (error) {
          console.error("Error updating signer:", error);
          disconnect();
        }
      } else {
        disconnect();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  if (!instance) return null;

  const swap = async (event) => {
    event.preventDefault();
    setIsSwapping(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS_SWAP, addLiquidityABI, signer);
      const input = await instance.createEncryptedInput(
        CONTRACT_ADDRESS_SWAP,
        await signer.getAddress()
      );
      input.add64(ethers.parseUnits(amountSwap.toString(), 6));
      const encryptedInput = input.encrypt();

      const response = await contract._mint(
        encryptedInput.handles[0],
        "0x" + toHexString(encryptedInput.inputProof)
      );
      await response.wait();
      setAmountSwap("");
    } catch (e) {
      console.log(e);
    } finally {
      setIsSwapping(false);
    }
  };

  const mockAddLiquidity = async (event) => {
    event.preventDefault();
    setIsAddingTokenA(true);
    setIsAddingTokenB(true);
    try {
      const contract = new Contract(
        CONTRACT_ADDRESS_SWAP,
        addLiquidityABI,
        signer
      );
      const inputA = await instance.createEncryptedInput(
        CONTRACT_ADDRESS_SWAP,
        await signer.getAddress()
      );
      inputA.add64(ethers.parseUnits(amountAddTokenA.toString(), 6));
      const encryptedInputA = inputA.encrypt();

      const inputB = await instance.createEncryptedInput(
        CONTRACT_ADDRESS_SWAP,
        await signer.getAddress()
      );
      inputB.add64(ethers.parseUnits(amountAddTokenB.toString(), 6));
      const encryptedInputB = inputB.encrypt();

      const response = await contract.mockAddLiquidity(
        encryptedInputA.handles[0],
        "0x" + toHexString(encryptedInputA.inputProof),
        encryptedInputB.handles[0],
        "0x" + toHexString(encryptedInputB.inputProof)
      );
      await response.wait();
      setAmountAddTokenA("");
      setAmountAddTokenB("");
    } catch (e) {
      console.log(e);
    } finally {
      setIsAddingTokenA(false);
      setIsAddingTokenB(false);
    }
  };

  const reencryptA = async () => {
    setIsDecrypting(true);
    try {
      // Step 1: Check local storage for existing keys and EIP-712 signature for this contract
      const contractKey = `reencrypt_${CONTRACT_ADDRESS_TOKEN_A}`;
      const storedData = JSON.parse(localStorage.getItem(contractKey));

      let publicKey, privateKey, signature;

      if (storedData) {
        // Use existing keys and signature if found
        ({ publicKey, privateKey, signature } = storedData);
      } else {
        // Step 2: Generate keys and request EIP-712 signature if no data in local storage
        const { publicKey: genPublicKey, privateKey: genPrivateKey } = instance.generateKeypair();
        const eip712 = instance.createEIP712(genPublicKey, CONTRACT_ADDRESS_TOKEN_A);

        // Prompt user to sign the EIP-712 message
        signature = await signer.signTypedData(
          eip712.domain,
          { Reencrypt: eip712.types.Reencrypt },
          eip712.message
        );

        // Store generated data in local storage
        publicKey = genPublicKey;
        privateKey = genPrivateKey;
        localStorage.setItem(
          contractKey,
          JSON.stringify({ publicKey, privateKey, signature })
        );
      }

      // Step 3: Use the public key, private key, and signature in the reencrypt function
      const contract = new Contract(CONTRACT_ADDRESS_TOKEN_A, erc20ABI, signer);
      const balanceHandle = await contract.balanceOf(await signer.getAddress());

      if (balanceHandle.toString() === "0") {
        setUserBalanceA("0");
      } else {
        const balanceResult = await instance.reencrypt(
          balanceHandle,
          privateKey,
          publicKey,
          signature.replace("0x", ""),
          CONTRACT_ADDRESS_TOKEN_A,
          await signer.getAddress()
        );
        setUserBalanceA(balanceResult.toString());
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsDecrypting(false);
    }
  };

  const reencryptB = async () => {
    setIsDecrypting(true);
    try {
      // Step 1: Check local storage for existing keys and EIP-712 signature for this contract
      const contractKey = `reencrypt_${CONTRACT_ADDRESS_TOKEN_B}`;
      const storedData = JSON.parse(localStorage.getItem(contractKey));

      let publicKey, privateKey, signature;

      if (storedData) {
        // Use existing keys and signature if found
        ({ publicKey, privateKey, signature } = storedData);
      } else {
        // Step 2: Generate keys and request EIP-712 signature if no data in local storage
        const { publicKey: genPublicKey, privateKey: genPrivateKey } = instance.generateKeypair();
        const eip712 = instance.createEIP712(genPublicKey, CONTRACT_ADDRESS_TOKEN_B);

        // Prompt user to sign the EIP-712 message
        signature = await signer.signTypedData(
          eip712.domain,
          { Reencrypt: eip712.types.Reencrypt },
          eip712.message
        );

        // Store generated data in local storage
        publicKey = genPublicKey;
        privateKey = genPrivateKey;
        localStorage.setItem(
          contractKey,
          JSON.stringify({ publicKey, privateKey, signature })
        );
      }

      // Step 3: Use the public key, private key, and signature in the reencrypt function
      const contract = new Contract(CONTRACT_ADDRESS_TOKEN_B, erc20ABI, signer);
      const balanceHandle = await contract.balanceOf(await signer.getAddress());

      if (balanceHandle.toString() === "0") {
        setUserBalanceB("0");
      } else {
        const balanceResult = await instance.reencrypt(
          balanceHandle,
          privateKey,
          publicKey,
          signature.replace("0x", ""),
          CONTRACT_ADDRESS_TOKEN_B,
          await signer.getAddress()
        );
        setUserBalanceB(balanceResult.toString());
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsDecrypting(false);
    }
  };

  const reencrypt = async () => {
    await reencryptA();
    await reencryptB();
  }

  const formatBalance = (balance) => {
    if (balance === "Hidden") return balance;
    const amount = balance?.slice(0, -6) || "0";
    return `${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-mono">
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* <img src="/inco-logo.svg" alt="Inco Logo" className="w-24" /> */}
              <h1 className="text-xl font-bold text-[#BCD0FC] hidden md:flex">
                IncoSwap - Confidential Swap Any Tokens
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {" "}
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-white"
                onClick={disconnect}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 h-full grid place-items-center w-full">
        <div className="grid gap-6 md:grid-cols-1 md:max-w-xl w-full">
          <div className="flex justify-end gap-3">
            <Link href="https://faucet.rivest.inco.org" target="_blank">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent hover:text-white/80"
              >
                <ArrowUpIcon className="w-4 h-4 mr-2 rotate-45" />
                Get Inco Tokens
              </Button>
            </Link>
          </div>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  Pool Info
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    {/* <span className="text-slate-400">Name:</span> */}
                    <span className="text-green-400">INCO - CUSD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Symbol:</span>
                    <span className="text-green-400">INCO - CUSD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance of Token A:</span>
                    <div className="flex items-center space-x-2">
                      {userBalanceA === "Hidden" ? (
                        <Lock size={16} className="text-slate-500" />
                      ) : (
                        <DollarSign size={16} className="text-green-400" />
                      )}
                      <span
                        className={`${
                          userBalanceA === "Hidden"
                            ? "text-white/80"
                            : "text-green-400"
                        }`}
                      >
                        {formatBalance(userBalanceA)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance of Token B:</span>
                    <div className="flex items-center space-x-2">
                      {userBalanceB === "Hidden" ? (
                        <Lock size={16} className="text-slate-500" />
                      ) : (
                        <DollarSign size={16} className="text-green-400" />
                      )}
                      <span
                        className={`${
                          userBalanceB === "Hidden"
                            ? "text-white/80"
                            : "text-green-400"
                        }`}
                      >
                        {formatBalance(userBalanceB)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-400 hover:text-white"
                  variant="outline"
                  onClick={reencrypt}
                  disabled={isDecrypting}
                >
                  {isDecrypting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Decrypt Balance
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <form onSubmit={swap} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  Swap Tokens
                </h2>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-slate-300 placeholder-slate-500"
                    placeholder="Enter amount"
                    value={amountSwap}
                    onChange={(e) => setAmountSwap(e.target.value)}
                    disabled={isSwapping}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isSwapping || !amountSwap}
                >
                  {isSwapping ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Swapping...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Swap
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <form onSubmit={mockAddLiquidity} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  Add Liquidity
                </h2>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-slate-300 placeholder-slate-500"
                    placeholder="Enter amount For Token A"
                    value={amountAddTokenA}
                    onChange={(e) => setAmountAddTokenA(e.target.value)}
                    disabled={isAddingTokenA}
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-slate-300 placeholder-slate-500"
                    placeholder="Enter amount For Token B"
                    value={amountAddTokenB}
                    onChange={(e) => setAmountAddTokenB(e.target.value)}
                    disabled={isAddingTokenB}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={
                    isAddingTokenA ||
                    isAddingTokenB ||
                    !amountAddTokenA ||
                    !amountAddTokenB
                  }
                >
                  {isAddingTokenA || isAddingTokenB ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <form onSubmit={swap} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  Remove Liquidity
                </h2>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-slate-300 placeholder-slate-500"
                    placeholder="Enter amount For LP(Liquidity Provider) Token"
                    value={amountRemoveLiquidity}
                    onChange={(e) => setAmountRemoveLiquidity(e.target.value)}
                    disabled={isRemovingLiquidity}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isRemovingLiquidity || !amountRemoveLiquidity}
                >
                  {isRemovingLiquidity ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Remove
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfidentialERC20;
