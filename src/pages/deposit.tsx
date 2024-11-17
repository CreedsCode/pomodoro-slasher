import { useRouter } from "next/router";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Transak from "@biconomy/transak";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
} from "@biconomy/account";
import { chains } from "@/config/chains";

export default function Deposit() {
  const router = useRouter();
  const { login, logout, authenticated: isAuthenticated } = usePrivy();
  const { wallets } = useWallets();
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(true);

  const TestCredentialsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white">Test Credentials</h2>
          <button
            onClick={() => setShowTestCredentials(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <div>
            <h3 className="text-orange-400 font-bold mb-2">
              Card Payment Details
            </h3>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-white">Card Number: 4111 1111 1111 1111</p>
              <p className="text-white">Expiry: 10/33</p>
              <p className="text-white">CVV: 123</p>
              <p className="text-gray-400 text-xs mt-1">Supports: USD, IDR</p>
            </div>
          </div>

          <div>
            <h3 className="text-orange-400 font-bold mb-2">Alternative Card</h3>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-white">Card Number: 4485 1415 2054 4212</p>
              <p className="text-white">Expiry: 10/33</p>
              <p className="text-white">CVV: 100</p>
              <p className="text-gray-400 text-xs mt-1">
                Supports: GBP, EUR, AUD, CAD, CHF, NOK, JPY, KRW, ZAR, NZD, SGD,
                HKD
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-orange-400 font-bold mb-2">Important Notes</h3>
            <div className="bg-gray-700 p-3 rounded-lg">
              <p className="text-white">• 3D Secure Password: Checkout1!</p>
              <p className="text-white">
                • Bank/Phone Verification Code: 000000
              </p>
              <p className="text-white">
                • Test Environment: All transactions are simulated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Initialize smart account when wallet is connected
  useEffect(() => {
    if (isAuthenticated && wallets.length > 0 && !smartAccountAddress) {
      initializeSmartAccount();
    }
  }, [isAuthenticated, wallets]);

  const initializeSmartAccount = async () => {
    try {
      setIsLoading(true);
      const wallet = wallets[0];
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();

      const smartWallet = await createSmartAccountClient({
        signer,
        biconomyPaymasterApiKey: " ",
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${chains[0].chainId}/ `,
        rpcUrl: "https://base-sepolia-rpc.publicnode.com",
        chainId: 84532,
      });

      setSmartAccount(smartWallet);
      const address = await smartWallet.getAccountAddress();
      setSmartAccountAddress(address);
    } catch (error) {
      console.error("Failed to initialize smart account:", error);
      toast.error("Failed to initialize wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTransak = async () => {
    try {
      if (!isAuthenticated || !smartAccountAddress) {
        toast.error("Please connect your wallet first");
        return;
      }

      // Initialize Transak with smart account address
      const transak = new Transak("STAGING", {
        walletAddress: smartAccountAddress, // Using smart account address instead of EOA
        network: "base_sepolia",
        defaultCryptoCurrency: "ETH",
        defaultNetwork: "base_sepolia",
        userData: {
          firstName: "",
          email: "",
        },
      });

      transak.init();
    } catch (error) {
      console.error("Failed to open Transak:", error);
      toast.error("Failed to open deposit widget");
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-24 bg-gray-900">
        <div className="text-[2.5rem] md:text-[4rem] font-bold text-orange-400 mb-8 text-center">
          Pomodoro Slasher
        </div>

        <div className="w-full max-w-md flex flex-col gap-6 items-center">
          <div className="text-center mb-8">
            <h2 className="text-xl text-white mb-4">Welcome Back, Slasher!</h2>
            <p className="text-gray-400">
              Connect your wallet to start slashing tasks
            </p>
          </div>

          <button
            className="w-full max-w-[12rem] h-[3rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
            onClick={login}
          >
            Connect Wallet
          </button>
        </div>
      </main>
    );
  }

  // Wallet connected screen
  if (showLoginScreen && isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-24 bg-gray-900">
        <div className="text-[2.5rem] md:text-[4rem] font-bold text-orange-400 mb-8 text-center">
          Pomodoro Slasher
        </div>

        <div className="w-full max-w-md flex flex-col gap-6 items-center">
          <div className="bg-gray-800 rounded-xl p-6 w-full">
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-xl text-white mb-4">Wallet Connected!</h2>

                <div className="mb-4">
                  <p className="text-sm text-gray-400">
                    Embedded Wallet Address:
                  </p>
                  <p className="text-orange-400 text-sm break-all">
                    {wallets[0]?.address || "Loading..."}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-400">
                    Smart Account Address:
                  </p>
                  {isLoading ? (
                    <p className="text-orange-400 text-sm">Initializing...</p>
                  ) : (
                    <p className="text-orange-400 text-sm break-all">
                      {smartAccountAddress || "Not initialized"}
                    </p>
                  )}
                </div>

                <button
                  className="w-full h-[3rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
                  onClick={() => setShowLoginScreen(false)}
                  disabled={isLoading}
                >
                  {isLoading ? "Initializing..." : "Continue to App"}
                </button>
              </div>
            </div>
          </div>

          <button
            className="w-full max-w-[10rem] h-[3rem] bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => {
              logout();
              setShowLoginScreen(true);
              setSmartAccount(null);
              setSmartAccountAddress(null);
            }}
          >
            Disconnect
          </button>
        </div>
      </main>
    );
  }

  // Main deposit screen
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-24 bg-gray-900">
      <div className="text-[2.5rem] md:text-[4rem] font-bold text-orange-400 mb-8 text-center">
        Deposit
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 items-center">
        {/* Deposit Card */}
        <div className="bg-gray-800 rounded-xl p-6 w-full">
          <div className="flex flex-col items-center gap-6">
            <p className="text-gray-400 text-center">
              Deposit funds to start slashing tasks
            </p>

            <div className="w-full flex flex-col gap-2">
              <button
                className="w-full h-[3rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors"
                onClick={handleOpenTransak}
              >
                Open to Deposit Funds
              </button>

              <button
                className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                onClick={() => setShowTestCredentials(true)}
              >
                View Test Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Go Back Button */}
        <button
          className="w-full max-w-[10rem] h-[3rem] bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
          onClick={() => router.push("/home")}
        >
          Go Back
        </button>
      </div>

      {/* Test Credentials Modal */}
      {showTestCredentials && <TestCredentialsModal />}
    </main>
  );
}
