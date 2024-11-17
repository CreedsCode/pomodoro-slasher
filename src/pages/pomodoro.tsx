import { useRouter } from "next/router";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import {
  createSmartAccountClient,
  BiconomySmartAccountV2,
  PaymasterMode,
} from "@biconomy/account";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { contractABI } from "../contract/contractABI";
import { chains } from "@/config/chains";

// Game creation form interface
interface GameConfig {
  time: number; // Session duration in minutes
  taskAmount: number; // Number of tasks to complete
  amount: string; // Amount to stake in ETH
  breakTime: number; // Break duration in minutes
  rounds: number; // Number of rounds
}

// Game state interface matching contract struct
interface Game {
  time: number;
  taskAmount: number;
  taskCompleted: number;
  amount: string;
  breakTime: number;
  rounds: number;
  player: string;
}

export default function Pomodoro() {
  const { login, authenticated: isAuthenticated } = usePrivy();
  const { wallets } = useWallets();
  const [game, setGame] = useState<Game | null>(null);
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for new game creation
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    time: 25,
    taskAmount: 1,
    amount: "0.01",
    breakTime: 5,
    rounds: 4,
  });

  // Contract configuration
  const CONTRACT_ADDRESS = "0x166c5cef16D3234621059EEa66c1144A4F4807E2";
  const CONTRACT_ABI = contractABI;

  // Initialize contract interaction
  useEffect(() => {
    if (smartAccount) {
      checkExistingGame();
    }
  }, [smartAccount]);

  const checkExistingGame = async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.providers.JsonRpcProvider(
        "https://sepolia-rpc.scroll.io"
      );
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const existingGame = await contract.games(
        await smartAccount?.getAccountAddress()
      );

      if (existingGame.player !== ethers.constants.AddressZero) {
        setGame({
          time: existingGame.time.toNumber(),
          taskAmount: existingGame.taskAmount,
          taskCompleted: existingGame.taskCompleted,
          amount: ethers.utils.formatEther(existingGame.amount),
          breakTime: existingGame.breakTime.toNumber(),
          rounds: existingGame.rounds,
          player: existingGame.player,
        });
      }
    } catch (error) {
      console.error("Error checking existing game:", error);
      toast.error("Failed to check existing game");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewGame = async () => {
    try {
      if (!wallets?.[0]) {
        toast.error("No wallet connected");
        return;
      }

      if (!smartAccount) {
        toast.error("Smart account not initialized");
        return;
      }

      setIsLoading(true);
      const toastId = toast("Creating new game...", { autoClose: false });

      try {
        // Get the provider and contract
        const provider = await wallets[0].getEthersProvider();
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        // Log values for debugging
        console.log("Game Config:", {
          time: gameConfig.time * 60,
          taskAmount: gameConfig.taskAmount,
          amount: ethers.utils.parseEther(gameConfig.amount).toString(),
          breakTime: gameConfig.breakTime * 60,
          rounds: gameConfig.rounds,
        });

        const createGameTx = await contract.populateTransaction.createGame(
          gameConfig.time * 60,
          gameConfig.taskAmount,
          ethers.utils.parseEther(gameConfig.amount),
          gameConfig.breakTime * 60,
          gameConfig.rounds
        );

        console.log("Transaction Data:", createGameTx);

        const tx = {
          to: CONTRACT_ADDRESS,
          data: createGameTx.data,
          value: ethers.utils.parseEther(gameConfig.amount),
        };

        console.log("Final Transaction:", tx);

        toast.update(toastId, {
          render: "Sending transaction...",
          autoClose: false,
        });

        const userOpResponse = await smartAccount.sendTransaction(tx, {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        });

        console.log("UserOp Response:", userOpResponse);

        if (!userOpResponse) {
          throw new Error("Transaction failed - no response received");
        }

        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash:", transactionHash);

        // Wait for transaction confirmation
        toast.update(toastId, {
          render: "Waiting for confirmation...",
          autoClose: false,
        });

        await checkExistingGame(); // Refresh game state after creation

        toast.update(toastId, {
          render: "Game created successfully!",
          type: "success",
          autoClose: 1000,
        });
      } catch (err) {
        console.error("Detailed error:", err);
        throw err; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error("Error creating new game:", error);
      toast.error(error.message || "Failed to create new game");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize smart account when wallet is connected
  useEffect(() => {
    if (isAuthenticated && wallets.length > 0 && !smartAccount) {
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

        rpcUrl: "https://sepolia-rpc.scroll.io",
        chainId: 534351, // Scroll Sepolia
      });

      setSmartAccount(smartWallet);
    } catch (error) {
      console.error("Failed to initialize smart account:", error);
      toast.error("Failed to initialize wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show login screen
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-24 bg-gray-900">
      <div className="text-[2.5rem] md:text-[4rem] font-bold text-orange-400 mb-8 text-center">
        Pomodoro Slasher
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 items-center">
        {isLoading ? (
          <div className="text-orange-400">Loading...</div>
        ) : game ? (
          <div className="bg-gray-800 rounded-xl p-6 w-full">
            <h2 className="text-xl text-white mb-4">Current Game</h2>
            <div className="space-y-4 text-gray-400">
              <div>Time: {game.time} minutes</div>
              <div>
                Tasks: {game.taskCompleted}/{game.taskAmount}
              </div>
              <div>Stake Amount: {game.amount} ETH</div>
              <div>Break Time: {game.breakTime} minutes</div>
              <div>Rounds: {game.rounds}</div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 w-full">
            <h2 className="text-xl text-white mb-4">Create New Game</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-400">Time (minutes):</span>
                <input
                  type="number"
                  value={gameConfig.time}
                  onChange={(e) =>
                    setGameConfig({
                      ...gameConfig,
                      time: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </label>
              <label className="block">
                <span className="text-gray-400">Tasks:</span>
                <input
                  type="number"
                  value={gameConfig.taskAmount}
                  onChange={(e) =>
                    setGameConfig({
                      ...gameConfig,
                      taskAmount: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </label>
              <label className="block">
                <span className="text-gray-400">Stake Amount (ETH):</span>
                <input
                  type="text"
                  value={gameConfig.amount}
                  onChange={(e) =>
                    setGameConfig({ ...gameConfig, amount: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </label>
              <label className="block">
                <span className="text-gray-400">Break Time (minutes):</span>
                <input
                  type="number"
                  value={gameConfig.breakTime}
                  onChange={(e) =>
                    setGameConfig({
                      ...gameConfig,
                      breakTime: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </label>
              <label className="block">
                <span className="text-gray-400">Rounds:</span>
                <input
                  type="number"
                  value={gameConfig.rounds}
                  onChange={(e) =>
                    setGameConfig({
                      ...gameConfig,
                      rounds: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </label>
              <button
                onClick={createNewGame}
                disabled={isLoading}
                className="w-full h-[3rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
              >
                Create Game
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
