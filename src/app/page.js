"use client";

import NotConnected from "@/components/not-connected";
import { Source_Code_Pro } from "next/font/google";
import React from "react";
import { WalletProvider } from "@/contexts/wallet-context";
import { useWallet } from "@/contexts/wallet-context";
import Connected from "@/components/connected";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
});

const HomeContent = () => {
  const { isConnected } = useWallet();

  return isConnected ? <Connected /> : <NotConnected />;
};

const Home = () => {
  return (
    <WalletProvider>
      <div className={sourceCodePro.className}>
        <HomeContent />
      </div>
    </WalletProvider>
  );
};

export default Home;
