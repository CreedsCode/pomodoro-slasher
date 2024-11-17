import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PrivyProvider } from "@privy-io/react-auth";
import { sepolia, scrollSepolia, baseSepolia } from "viem/chains";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string} //Use your own appId from https://dashboard.privy.io/
        config={{
          supportedChains: [baseSepolia], // <-- Add your supported chains here
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
            noPromptOnSignature: false,
          },
          fiatOnRamp: {
            useSandbox: true,
          },
          loginMethods: ["email"], // <-- Add your supported login methods here
          // loginMethods: ["email", "google", "twitter", "discord", "apple"], // <-- Add your supported login methods here
        }}
      >
        <ToastContainer />

        <Component {...pageProps} />
      </PrivyProvider>
    </>
  );
}
