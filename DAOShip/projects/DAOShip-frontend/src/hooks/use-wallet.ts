import { useState, useEffect } from "react";
import { connectWallet, disconnectWallet, getWalletAddress } from "@/lib/wallet";

interface WalletHook {
  isConnected: boolean;
  walletAddress: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = (): WalletHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Initialize wallet state on mount
  useEffect(() => {
    const initWallet = async () => {
      try {
        const address = await getWalletAddress();
        if (address) {
          setWalletAddress(address);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
        setIsConnected(false);
        setWalletAddress("");
      }
    };

    initWallet();
  }, []);

  const connect = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setIsConnected(false);
      setWalletAddress("");
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      setIsConnected(false);
      setWalletAddress("");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  };

  return {
    isConnected,
    walletAddress,
    connect,
    disconnect,
  };
};
