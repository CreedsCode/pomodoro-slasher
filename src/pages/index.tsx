import Link from "next/link";

export default function Landing() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-24 bg-gray-900">
      <div className="text-[2.5rem] md:text-[4rem] font-bold text-orange-400 mb-8 text-center">
        Pomodoro Slasher
      </div>

      <div className="max-w-2xl text-center flex flex-col gap-8">
        <h2 className="text-xl md:text-2xl text-white font-semibold">
          Get Shit Done or Get Slashed
        </h2>

        <div className="flex flex-col gap-4 text-gray-300">
          <p>
            Stake your tokens and commit to completing your tasks within
            Pomodoro sessions.
          </p>
          <p>
            Complete all tasks? Get your stake back. Fail? Your tokens get
            locked until Christmas! 🎄
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-orange-400 font-bold mb-2">Stake</h3>
            <p className="text-gray-300">Put your tokens on the line</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-orange-400 font-bold mb-2">Focus</h3>
            <p className="text-gray-300">Complete tasks in Pomodoro sessions</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-orange-400 font-bold mb-2">Earn or Learn</h3>
            <p className="text-gray-300">Succeed or wait till Christmas</p>
          </div>
        </div>

        <Link
          href="/home"
          className="w-full max-w-[12rem] mx-auto h-[3.5rem] bg-orange-400 text-black font-bold rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center"
        >
          Start Slashing Todo&apros;s
        </Link>
      </div>

      <div className="mt-12 text-gray-500 text-sm">
        Built during ETHGlobal Bangkok 2024, with ❤️ and sleep deprivation
      </div>
    </main>
  );
}
