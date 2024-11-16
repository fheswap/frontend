import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import Header from "./header";

const NotConnected = () => {
  const { connect, isConnecting, switchChain } = useWallet();
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    setHasProvider(typeof window !== "undefined" && Boolean(window.ethereum));
  }, []);

  const handleAddNetwork = async (e) => {
    e.preventDefault();
    try {
      await switchChain();
    } catch (error) {
      console.error("Failed to add network:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex justify-center">
            <Image
              src="/mosaic.png"
              alt="Gentry Logo"
              width={480}
              height={320}
              className="max-w-md"
            />
          </div>

          <div className="flex flex-col items-center gap-8 max-w-xl w-full mt-5">
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full bg-[#3673F5] hover:bg-[#3673F5]/80 text-[#020B20] py-5 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl relative group"
            >
              <span className="absolute inset-0 h-full w-full rounded-lg overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
              </span>
              <span className="relative">
                {isConnecting ? "Connecting..." : "Connect your wallet"}
              </span>
            </button>

            <button
              onClick={handleAddNetwork}
              className="text-[#2196F3] hover:text-[#90CAF9] transition-colors flex items-center gap-2 group"
            >
              Add Rivest Testnet
              <svg
                className="w-4 h-4 transform -rotate-45 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotConnected;
