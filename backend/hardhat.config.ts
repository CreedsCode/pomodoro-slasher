import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: ["0x169f107e9e7bc499446571ee668bff07d6bdbedfdad13d3cae8d757895098c39"],
    },
  },
};

export default config;
