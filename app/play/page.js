"use client";

import Board from "@/components/Board";
import getEmptyBoard from "@/utils/getEmptyBoard";
import _getGameStatus from "@/utils/getGameStatus";
import _isBoardFull from "@/utils/isBoardFull";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import uniqid from "uniqid";

export default function PlayPage() {
    const queryParams = useSearchParams();

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";

    const [board, setBoard] = useState(getEmptyBoard());

    const player1Ref = useRef({
        id: uniqid(),
        name: "Player 1",
        sign: "X",
    });

    const player2Ref = useRef({
        id: uniqid(),
        name: smartAI ? "Smart Bot" : randomAI ? "Random Bot" : "Player 2",
        sign: "O",
        ai: smartAI || randomAI,
    });

    const player1 = player1Ref.current;
    const player2 = player2Ref.current;

    const [currentPlayer, setCurrentPlayer] = useState();

    const currentGameStatus = getGameStatus();

    // randomize first player
    useEffect(() => {
        setCurrentPlayer(getRandomPlayer());
    }, []);

    // check if AI should make a move
    useEffect(() => {
        if (currentPlayer?.ai) {
            if (smartAI) {
                makeSmartMove();
            } else if (randomAI) {
                makeRandomMove();
            }
        }
    }, [currentPlayer]);

    function getRandomPlayer() {
        return Math.random() < 0.5 ? player1 : player2;
    }

    function minimax(currentBoard, isMaximizing) {
        const gameStatus = _getGameStatus(currentBoard, player1, player2);

        if (gameStatus.status == "WIN") {
            if (gameStatus.winner.id === currentPlayer.id) return 1;
            else return -1;
        } else if (gameStatus.status == "DRAW") return 0;

        let copiedBoard;
        let score;

        if (isMaximizing) {
            let max_score = -Infinity;

            for (let i = 0; i < currentBoard.length; i++) {
                for (let j = 0; j < currentBoard[i].length; j++) {
                    if (currentBoard[i][j] === null) {
                        copiedBoard = JSON.parse(JSON.stringify(currentBoard));

                        copiedBoard[i][j] = currentPlayer.sign;
                        score = minimax(copiedBoard, false);
                        max_score = Math.max(max_score, score);
                    }
                }
            }
            return max_score;
        } else {
            let min_score = Infinity;

            for (let i = 0; i < currentBoard.length; i++) {
                for (let j = 0; j < currentBoard[i].length; j++) {
                    if (currentBoard[i][j] === null) {
                        copiedBoard = JSON.parse(JSON.stringify(currentBoard));

                        copiedBoard[i][j] = currentPlayer.id === player1.id ? player2.sign : player1.sign;
                        score = minimax(copiedBoard, true);
                        min_score = Math.min(min_score, score);
                    }
                }
            }
            return min_score;
        }
    }

    function makeSmartMove() {
        if (isBoardFull() || currentGameStatus.status !== "PLAYING") return;

        let row;
        let column;

        let copiedBoard;
        let max_score = -Infinity;
        let score;

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === null) {
                    copiedBoard = JSON.parse(JSON.stringify(board));

                    copiedBoard[i][j] = currentPlayer.sign;

                    score = minimax(copiedBoard, false);
                    if (score > max_score) {
                        row = i;
                        column = j;
                        max_score = score;
                    }
                }
            }
        }

        const move = makeMove(row, column);

        console.log(move);
    }

    function makeRandomMove() {
        if (isBoardFull() || currentGameStatus.status !== "PLAYING") return;

        while (true) {
            const row = Math.floor(Math.random() * 3);
            const column = Math.floor(Math.random() * 3);

            const move = makeMove(row, column);

            console.log(move);

            if (move.success || move.error == "NO_CURRENT_PLAYER") break;
        }
    }

    function onCellClick(row, column) {
        if (currentGameStatus.status !== "PLAYING") return;

        const move = makeMove(row, column);

        console.log(move);
    }

    function makeMove(row, column) {
        // make move as current player

        if (!currentPlayer) return { success: false, error: "NO_CURRENT_PLAYER" };

        const newBoard = [...board];

        const cellValue = newBoard[row][column];

        if (cellValue !== null) return { success: false, error: "CELL_OCCUPIED" };

        newBoard[row][column] = currentPlayer.sign;
        setBoard(newBoard);
        switchPlayer();

        return { success: true, row, column, sign: currentPlayer.sign };
    }

    function isBoardFull() {
        return _isBoardFull(board);
    }

    function getGameStatus() {
        return _getGameStatus(board, player1, player2);
    }

    function switchPlayer() {
        setCurrentPlayer(currentPlayer.id === player1.id ? player2 : currentPlayer.id === player2.id ? player1 : null);
    }

    function reset() {
        setBoard(getEmptyBoard());
        setCurrentPlayer(getRandomPlayer());
    }

    return (
        <div>
            <h1>Play Page</h1>
            {currentGameStatus.status === "PLAYING" ? (
                smartAI || randomAI ? (
                    <p>You are playing against an AI. ({smartAI ? "Smart" : randomAI ? "Random" : "Unknown Type"})</p>
                ) : (
                    <p>Current player: {currentPlayer?.name}</p>
                )
            ) : currentGameStatus.status === "WIN" ? (
                <p>
                    Winner:{" "}
                    {(smartAI || randomAI) && !currentGameStatus.winner.ai ? "You" : currentGameStatus.winner.name}
                </p>
            ) : currentGameStatus.status === "DRAW" ? (
                <p>Draw</p>
            ) : null}
            <button onClick={makeRandomMove}>Make random move</button>
            <button onClick={makeSmartMove}>Make smart move</button>
            {currentGameStatus.status !== "PLAYING" && <button onClick={reset}>Reset</button>}
            <Board board={board} onCellClick={onCellClick} />
        </div>
    );
}
