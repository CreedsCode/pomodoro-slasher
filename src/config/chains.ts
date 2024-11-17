export interface Chain {
  name: string;
  contractAddress: string;
  providerUrl: string;
  explorerUrl: string;
  chainId: number;
}

export const chains: Chain[] = [
  {
    name: "Base Sepolia",
    contractAddress: "0x166c5cef16D3234621059EEa66c1144A4F4807E2", // Update with your contract address
    providerUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org/tx/",
    chainId: 84532,
  }
];

export const defaultChainId = chains[0].chainId; 