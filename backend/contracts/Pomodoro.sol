// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Contract Address (Scroll Sepolia) - 0x166c5cef16D3234621059EEa66c1144A4F4807E2

contract Pomodoro {
    struct Game {
        uint256 time;
        uint32 taskAmount;
        uint32 taskCompleted;
        uint256 amount;
        uint256 breakTime;
        uint32 rounds;
        address player;
    }

    mapping(address => Game) public games;

    modifier gameExists() {
        require(games[msg.sender].player != address(0), "Game does not exist");
        _;
    }

    function createGame(
        uint256 time,
        uint32 taskAmount,
        uint256 amount,
        uint256 breakTime,
        uint32 rounds
    ) public payable {
        require(games[msg.sender].player == address(0), "Game already exists");
        require(msg.value >= amount, "Incorrect amount sent");
        Game memory newGame = Game({
            time: time,
            taskAmount: taskAmount,
            taskCompleted: 0,
            amount: amount,
            breakTime: breakTime,
            rounds: rounds,
            player: msg.sender
        });
        games[msg.sender] = newGame;
    }

    function completeTask() public gameExists {
        require(
            games[msg.sender].taskCompleted < games[msg.sender].taskAmount,
            "All tasks completed"
        );
        games[msg.sender].taskCompleted++;
    }

    function endGame() public gameExists {
        // transfer native token to msg.sender
        payable(msg.sender).transfer(
            (games[msg.sender].amount * games[msg.sender].taskCompleted) /
                games[msg.sender].taskAmount
        );
    }
}
