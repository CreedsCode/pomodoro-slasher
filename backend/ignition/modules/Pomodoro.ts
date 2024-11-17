// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";


const Pomodoro = buildModule("Pomodoro", (m) => {
  const pomodoro = m.contract("Pomodoro");
  return { pomodoro };
});

export default Pomodoro;
