export const contractABI = [
  {
    inputs: [],
    name: "completeTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "taskAmount",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "breakTime",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "rounds",
        type: "uint32",
      },
    ],
    name: "createGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "endGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "games",
    outputs: [
      {
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "taskAmount",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "taskCompleted",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "breakTime",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "rounds",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
