"use client";

import Board from "@/components/Board";
import { useEffect, useRef, useState } from "react";
import uniqid from "uniqid";

export default function PlayPage() {
    const [hits, setHits] = useState([...Array(3)].map(() => [...Array(3)].map(() => null)));

    const player1Ref = useRef({
        id: uniqid(),
        name: "Player 1",
        sign: "X",
    });

    const player2Ref = useRef({
        id: uniqid(),
        name: "Player 2",
        sign: "O",
    });

    const player1 = player1Ref.current;
    const player2 = player2Ref.current;

    console.log(player1, player2);

    const [currentPlayer, setCurrentPlayer] = useState();

    const currentGameStatus = getGameStatus();

    // randomize first player
    useEffect(() => {
        function getRandomPlayer() {
            return Math.random() < 0.5 ? player1 : player2;
        }

        setCurrentPlayer(getRandomPlayer());
    }, []);

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

    function switchPlayer() {
        setCurrentPlayer(currentPlayer.id === player1.id ? player2 : currentPlayer.id === player2.id ? player1 : null);
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
                currentPlayer && (
                    <p>
                        Current Player: {currentPlayer.name}, {currentPlayer.sign}
                    </p>
                )
            ) : currentGameStatus.status === "WIN" ? (
                <p>Winner: {currentGameStatus.winner.name}</p>
            ) : currentGameStatus.status === "DRAW" ? (
                <p>Draw</p>
            ) : null}
            <Board hits={hits} onCellClick={onCellClick} />
        </div>
    );
}
