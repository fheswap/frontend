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

const CONTRACT_ADDRESS_TOKEN_0 = "0x86bFF69F59EBc79D73669481B0d1Bf3fB07Ba196";
const CONTRACT_ADDRESS_TOKEN_1 = "0x08F472c5b04Bf80Ffa6a6C25605aF19668A474Eb";
const mintABI = [
  {
    inputs: [
      {
        internalType: "einput",
        name: "encryptedAmount",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "inputProof",
        type: "bytes",
      },
    ],
    name: "_mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Mint = () => {
  const [signer, setSigner] = useState(null);
  const [amountMint, setAmountMint] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [userBalance, setUserBalance] = useState("Hidden");
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

  const mintToken0 = async () => {
    setIsMinting(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS_TOKEN_0, mintABI, signer);
      const input = await instance.createEncryptedInput(
        CONTRACT_ADDRESS_TOKEN_0,
        await signer.getAddress()
      );
      input.add64(ethers.parseUnits(amountMint.toString(), 6));
      console.log("amountMint for token 0: ", amountMint);
      const encryptedInput = input.encrypt();

      const response = await contract._mint(
        encryptedInput.handles[0],
        "0x" + toHexString(encryptedInput.inputProof)
      );
      await response.wait();
    } catch (e) {
      console.log(e);
    } finally {
      setIsMinting(false);
    }
  };

  const mintToken1 = async () => {
    setIsMinting(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS_TOKEN_1, mintABI, signer);
      const input = await instance.createEncryptedInput(
        CONTRACT_ADDRESS_TOKEN_1,
        await signer.getAddress()
      );
      input.add64(ethers.parseUnits(amountMint.toString(), 6));
      console.log("amountMint for token 1: ", amountMint);
      const encryptedInput = input.encrypt();

      const response = await contract._mint(
        encryptedInput.handles[0],
        "0x" + toHexString(encryptedInput.inputProof)
      );
      await response.wait();
    } catch (e) {
      console.log(e);
    } finally {
      setIsMinting(false);
    }
  };

  const mint = async (event) => {
    event.preventDefault();
    await mintToken0();
    await mintToken1();
    setAmountMint("");
  };

  return (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={mint} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">
                  Mint Tokens
                </h2>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-slate-300 placeholder-slate-500"
                    placeholder="Enter amount"
                    value={amountMint}
                    onChange={(e) => setAmountMint(e.target.value)}
                    disabled={isMinting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isMinting || !amountMint}
                >
                  {isMinting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Mint
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
        </Card>
  );
};

export default Mint;
