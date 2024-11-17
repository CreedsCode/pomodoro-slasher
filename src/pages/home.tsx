import React, { useState, useEffect } from "react";
import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
} from "@biconomy/account";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { chains } from "@/config/chains";

interface Session {
  date: string;
  workDuration: string;
  breakDuration: string;
  rounds: number;
  totalDuration: string;
  tasksCompleted: number;
  totalTasks: number;
  stake: string;
  slashed: string;
  status: "Completed" | "Failed";
}

export default function Home() {
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const { login, logout, authenticated: isAuthenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  // Initialize smart account when wallet is connected
  useEffect(() => {
    if (isAuthenticated && wallets.length > 0 && !smartAccountAddress) {
      initializeSmartAccount();
    }
  }, [isAuthenticated, wallets]);

  const initializeSmartAccount = async () => {
    try {
      setIsLoading(true);
      const wallet = wallets[0] as ConnectedWallet;
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

  // Mocked data matching smart contract structure
  const mockedData = {
    lockedValue: "0.5 ETH",
    unlockDate: "2024-04-15",
    daysRemaining: 30,
    history: [
      {
        date: "2024-03-15",
        workDuration: "25 mins",
        breakDuration: "5 mins",
        rounds: 4,
        totalDuration: "110 mins",
        tasksCompleted: 4,
        totalTasks: 4,
        stake: "0.1 ETH",
        slashed: "0 ETH",
        status: "Completed",
      },
      {
        date: "2024-03-14",
        workDuration: "25 mins",
        breakDuration: "5 mins",
        rounds: 4,
        totalDuration: "110 mins",
        tasksCompleted: 2,
        totalTasks: 4,
        stake: "0.1 ETH",
        slashed: "0.05 ETH",
        status: "Failed",
      },
      {
        date: "2024-03-13",
        workDuration: "25 mins",
        breakDuration: "5 mins",
        rounds: 4,
        totalDuration: "110 mins",
        tasksCompleted: 4,
        totalTasks: 4,
        stake: "0.1 ETH",
        slashed: "0 ETH",
        status: "Completed",
      },
    ] as Session[],
  };

  const HistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white">Session History</h2>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {mockedData.history.map((session, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-300">{session.date}</div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    session.status === "Completed"
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {session.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Work Session:</div>
                <div className="text-gray-300">{session.workDuration}</div>

                <div className="text-gray-400">Break Time:</div>
                <div className="text-gray-300">{session.breakDuration}</div>

                <div className="text-gray-400">Rounds:</div>
                <div className="text-gray-300">{session.rounds}</div>

                <div className="text-gray-400">Total Duration:</div>
                <div className="text-gray-300">{session.totalDuration}</div>

                <div className="text-gray-400">Tasks:</div>
                <div className="text-gray-300">
                  {session.tasksCompleted} / {session.totalTasks}
                </div>

                <div className="text-gray-400">Stake:</div>
                <div className="text-gray-300">{session.stake}</div>

                {session.status === "Failed" && (
                  <>
                    <div className="text-gray-400">Slashed:</div>
                    <div className="text-red-400">{session.slashed}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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

  // Updated Main App Screen
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-24 bg-gray-900">
      <div className="text-[2.5rem] md:text-[4rem] font-bold text-orange-400 mb-8 text-center">
        Hi Slasher
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6 items-center">
        {/* Locked Value Card */}
        <div className="bg-gray-800 rounded-xl p-6 w-full">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl text-white font-bold">
              Total Locked Value
            </h2>
            <div className="text-4xl text-orange-400 font-bold">
              {mockedData.lockedValue}
            </div>
            <div className="text-gray-400 text-center">
              <p>Unlocks on: {mockedData.unlockDate}</p>
              <p>{mockedData.daysRemaining} days remaining</p>
            </div>
          </div>
        </div>

        {/* Latest Session Card */}
        <div className="bg-gray-800 rounded-xl p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-white">Last Session</h2>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              View All History
            </button>
          </div>

          {mockedData.history.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-300">
                  {mockedData.history[0].date}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    mockedData.history[0].status === "Completed"
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }`}
                >
                  {mockedData.history[0].status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Work Session:</div>
                <div className="text-gray-300">
                  {mockedData.history[0].workDuration}
                </div>

                <div className="text-gray-400">Break Time:</div>
                <div className="text-gray-300">
                  {mockedData.history[0].breakDuration}
                </div>

                <div className="text-gray-400">Rounds:</div>
                <div className="text-gray-300">
                  {mockedData.history[0].rounds}
                </div>

                <div className="text-gray-400">Total Duration:</div>
                <div className="text-gray-300">
                  {mockedData.history[0].totalDuration}
                </div>

                <div className="text-gray-400">Tasks:</div>
                <div className="text-gray-300">
                  {mockedData.history[0].tasksCompleted} /{" "}
                  {mockedData.history[0].totalTasks}
                </div>

                <div className="text-gray-400">Stake:</div>
                <div className="text-gray-300">
                  {mockedData.history[0].stake}
                </div>

                {mockedData.history[0].status === "Failed" && (
                  <>
                    <div className="text-gray-400">Slashed:</div>
                    <div className="text-red-400">
                      {mockedData.history[0].slashed}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 h-[3rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors"
            onClick={() => router.push("/deposit")}
          >
            Deposit
          </button>
          <button
            className="flex-1 h-[3rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors"
            onClick={() => router.push("/pomodoro")}
          >
            Create Session
          </button>
        </div>

        {/* Disconnect Button */}
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

      {/* History Modal */}
      {showHistoryModal && <HistoryModal />}
    </main>
  );
}
