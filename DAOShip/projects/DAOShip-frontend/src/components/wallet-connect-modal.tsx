import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Wallet, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string) => void;
}

const WalletConnectModal = ({
  isOpen,
  onClose,
  onConnect,
}: WalletConnectModalProps) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async (walletType: string) => {
    setConnecting(walletType);

    try {
      await onConnect(walletType);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-black/80 backdrop-blur-lg border border-white/10 text-white">
        <div className="flex flex-col space-y-4 p-2">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold">Connect Your Wallet</h2>
            <p className="text-sm text-gray-400 mt-1">
              Select a wallet to connect to this dApp
            </p>
          </div>

          <div className="space-y-3">
            <WalletOption
              name="Pera Wallet"
              description="Algorand's official mobile wallet"
              icon={<Wallet className="h-6 w-6" />}
              onClick={() => handleConnect("Pera Wallet")}
              isLoading={connecting === "Pera Wallet"}
            />

            <WalletOption
              name="WalletConnect"
              description="Connect to mobile wallets"
              icon={<QrCode className="h-6 w-6" />}
              onClick={() => handleConnect("WalletConnect")}
              isLoading={connecting === "WalletConnect"}
            />

            <WalletOption
              name="Defly Wallet"
              description="Multi-blockchain wallet for DeFi"
              icon={<Wallet className="h-6 w-6" />}
              onClick={() => handleConnect("Defly Wallet")}
              isLoading={connecting === "Defly Wallet"}
            />

            <WalletOption
              name="MyAlgo Wallet"
              description="Web-based Algorand wallet"
              icon={<Wallet className="h-6 w-6" />}
              onClick={() => handleConnect("MyAlgo Wallet")}
              isLoading={connecting === "MyAlgo Wallet"}
            />
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-xs text-yellow-400 text-center">
              ⚡ Make sure your wallet is connected to Algorand MainNet
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-4 py-2 px-4 border border-white/20 rounded-md hover:bg-white/10 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface WalletOptionProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isLoading: boolean;
}

const WalletOption = ({
  name,
  description,
  icon,
  onClick,
  isLoading,
}: WalletOptionProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 flex items-center justify-between group disabled:opacity-70"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-md">{icon}</div>
        <div className="text-left">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </div>
      )}
    </button>
  );
};

export default WalletConnectModal;
