"use client";

import Board from "@/components/Board";
import { useState } from "react";

export default function PlayPage() {
    const [hits, setHits] = useState([...Array(3)].map(() => [...Array(3)].map(() => null)));

    const player1 = {
        id: 1,
        name: "Player 1",
        sign: "X",
    };

    const player2 = {
        id: 2,
        name: "Player 2",
        sign: "O",
    };

    const [currentPlayerId, setCurrentPlayerId] = useState(player1.id);

    const currentGameStatus = getGameStatus();

    const currentPlayer = getCurrentPlayer();

    function getWinner() {
        // check rows
        for (let i = 0; i < 3; i++) {
            if (hits[i][0] !== null && hits[i][0] === hits[i][1] && hits[i][0] === hits[i][2]) {
                return getPlayer(hits[i][0]);
            }
        }

        // check columns
        for (let i = 0; i < 3; i++) {
            if (hits[0][i] !== null && hits[0][i] === hits[1][i] && hits[0][i] === hits[2][i]) {
                return getPlayer(hits[0][i]);
            }
        }

        // check diagonals
        if (hits[0][0] !== null && hits[0][0] === hits[1][1] && hits[0][0] === hits[2][2]) {
            return getPlayer(hits[0][0]);
        }

        if (hits[0][2] !== null && hits[0][2] === hits[1][1] && hits[0][2] === hits[2][0]) {
            return getPlayer(hits[0][2]);
        }

        return null;
    }

    // check if board has no 'null' cells
    function isBoardFull() {
        for (let row of hits) {
            for (let cell of row) {
                if (cell === null) return false;
            }
        }

        return true;
    }

    function getGameStatus() {
        const winner = getWinner();

        if (winner !== null) {
            return { status: "WIN", winner };
        } else if (isBoardFull()) {
            return { status: "DRAW" };
        } else {
            return { status: "PLAYING" };
        }
    }

    // return player based on sign
    function getPlayer(sign) {
        return sign === player1.sign ? player1 : sign === player2.sign ? player2 : null;
    }

    function getCurrentPlayer() {
        return currentPlayerId === player1.id ? player1 : currentPlayerId === player2.id ? player2 : null;
    }

    function switchPlayer() {
        setCurrentPlayerId(
            currentPlayerId === player1.id ? player2.id : currentPlayerId === player2.id ? player1.id : null
        );
    }

    function onCellClick(row, column) {
        const newHits = [...hits];
        const cellValue = newHits[row][column];

        if (cellValue === null && currentGameStatus.status === "PLAYING") {
            newHits[row][column] = currentPlayer.sign;
            setHits(newHits);
            switchPlayer();
        }
    }

    return (
        <div>
            <h1>Play Page</h1>
            {currentGameStatus.status === "PLAYING" ? (
                <p>
                    Current Player: {currentPlayer.name}, {currentPlayer.sign}
                </p>
            ) : currentGameStatus.status === "WIN" ? (
                <p>Winner: {currentGameStatus.winner.name}</p>
            ) : currentGameStatus.status === "DRAW" ? (
                <p>Draw</p>
            ) : null}
            <Board hits={hits} onCellClick={onCellClick} />
        </div>
    );
}
