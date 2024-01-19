"use client";

import Board from "@/components/Board";
import generatePlayerObject from "@/utils/generatePlayerObject";
import getEmptyBoard from "@/utils/getEmptyBoard";
import _getGameStatus from "@/utils/getGameStatus";
import _hitCell from "@/utils/hitCell";
import isBoardEmpty from "@/utils/isBoardEmpty";
import _isBoardFull from "@/utils/isBoardFull";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PlayPage() {
    const queryParams = useSearchParams();

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";

    const [board, setBoard] = useState(getEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState(null);

    const player1Ref = useRef(generatePlayerObject("Player 1", "X"));

    const player2Ref = useRef(
        generatePlayerObject(smartAI ? "Smart Bot" : randomAI ? "Random Bot" : "Player 2", "O", smartAI || randomAI)
    );

    const player1 = player1Ref.current;
    const player2 = player2Ref.current;
    const currentGameStatus = getGameStatus();

    // randomize first player
    useEffect(() => {
        setCurrentPlayer(getRandomPlayer());
    }, []);

    if (!currentPlayer) return <p>Initializing...</p>;

    // make sure AI makes first move if it's the first player (if board is empty)
    if (currentPlayer.ai && isBoardEmpty(board)) makeAIMove(currentPlayer);

    function getRandomPlayer() {
        return Math.random() < 0.5 ? player1 : player2;
    }

    function minimax(currentBoard, isMaximizing, playerMaximizing) {
        const gameStatus = _getGameStatus(currentBoard, player1, player2);

        if (gameStatus.status == "WIN") {
            if (gameStatus.winner.id === playerMaximizing.id) return 1;
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

                        copiedBoard[i][j] = playerMaximizing.sign;
                        score = minimax(copiedBoard, false, playerMaximizing);
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

                        copiedBoard[i][j] = playerMaximizing.id === player1.id ? player2.sign : player1.sign;
                        score = minimax(copiedBoard, true, playerMaximizing);
                        min_score = Math.min(min_score, score);
                    }
                }
            }
            return min_score;
        }
    }

    function makeSmartMove(player = currentPlayer, playerSwitch = true) {
        if (currentGameStatus.status !== "PLAYING" || isBoardFull()) return;

        let row;
        let column;

        let copiedBoard;
        let max_score = -Infinity;
        let score;

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === null) {
                    copiedBoard = JSON.parse(JSON.stringify(board));

                    copiedBoard[i][j] = player.sign;

                    score = minimax(copiedBoard, false, player);
                    if (score > max_score) {
                        row = i;
                        column = j;
                        max_score = score;
                    }
                }
            }
        }

        const res = makeMove(row, column, player.sign, playerSwitch);

        return res;
    }

    function makeRandomMove(sign = currentPlayer.sign, playerSwitch = true) {
        if (currentGameStatus.status !== "PLAYING" || isBoardFull()) return;

        while (true) {
            const row = Math.floor(Math.random() * 3);
            const column = Math.floor(Math.random() * 3);

            const res = makeMove(row, column, sign, playerSwitch);

            if (res.success) return res;
        }
    }

    function onCellClick(row, column) {
        if (currentGameStatus.status !== "PLAYING") return;

        makeMove(row, column);
    }

    function makeMove(row, column, sign = currentPlayer.sign, playerSwitch = true) {
        const res = hitCell(row, column, sign);

        if (res.success) {
            setBoard(res.board);
            if (playerSwitch) switchPlayer();
        }

        console.log(res);
        return res;
    }

    function hitCell(row, column, sign = currentPlayer.sign) {
        return _hitCell([...board], row, column, sign);
    }

    function isBoardFull() {
        return _isBoardFull(board);
    }

    function getGameStatus() {
        return _getGameStatus(board, player1, player2);
    }

    function switchPlayer() {
        const otherPlayer =
            currentPlayer.id === player1.id ? player2 : currentPlayer.id === player2.id ? player1 : null;

        if (otherPlayer.ai) makeAIMove(otherPlayer, false);
        else setCurrentPlayer(otherPlayer);
    }

    function makeAIMove(player, playerSwitch = true) {
        if (smartAI) makeSmartMove(player, playerSwitch);
        else if (randomAI) makeRandomMove(player.sign, playerSwitch);
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
                    <p>You are playing against an AI. ({smartAI ? "Smart" : randomAI ? "Random" : "NULL"})</p>
                ) : (
                    <p>Current player: {currentPlayer.name}</p>
                )
            ) : currentGameStatus.status === "WIN" ? (
                <p>
                    Winner:{" "}
                    {(smartAI || randomAI) && !currentGameStatus.winner.ai ? "You" : currentGameStatus.winner.name}
                </p>
            ) : currentGameStatus.status === "DRAW" ? (
                <p>Draw</p>
            ) : null}
            <button onClick={() => makeRandomMove()}>Make random move</button>
            <button onClick={() => makeSmartMove()}>Make smart move</button>
            <button onClick={reset}>Reset</button>
            <Board board={board} onCellClick={onCellClick} />
        </div>
    );
}
