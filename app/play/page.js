"use client";

import Board from "@/components/Board";
import useOnlineGame from "@/hooks/useOnlineGame";
import generatePlayerObject from "@/utils/generatePlayerObject";
import getEmptyBoard from "@/utils/getEmptyBoard";
import _getGameStatus from "@/utils/getGameStatus";
import _hitCell from "@/utils/hitCell";
import _isBoardEmpty from "@/utils/isBoardEmpty";
import _isBoardFull from "@/utils/isBoardFull";
import minimax from "@/utils/minimax";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlayPage() {
    const queryParams = useSearchParams();

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";
    const gameId = queryParams.get("game");

    const [board, setBoard] = useState(getEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState(null);

    // not ai, always client (initially)
    const [player1, setPlayer1] = useState(generatePlayerObject("Player 1", "X", false, true));

    // if ai on, player 2 is ai. if ai is on or game is online, player 2 is not client (initially)
    const [player2, setPlayer2] = useState(
        generatePlayerObject(
            smartAI ? "Smart Bot" : randomAI ? "Random Bot" : "Player 2",
            "O",
            smartAI || randomAI,
            gameId || smartAI || randomAI ? false : true
        )
    );

    // randomize first player
    useEffect(() => {
        setCurrentPlayer(getRandomPlayer());
    }, []);

    // set up online game - if game id is null, it's an offline game and connectionStatus is null
    const { connectionStatus, channel } = useOnlineGame(
        gameId,
        currentPlayer,
        setCurrentPlayer,
        switchPlayer,
        board,
        setBoard,
        player1,
        setPlayer1,
        player2,
        setPlayer2
    );

    // get current game status - win, draw or playing
    const currentGameStatus = getGameStatus();

    if (!currentPlayer) return <p>Initializing...</p>;

    // make sure AI makes first move if it's the first player (if board is empty)
    if (currentPlayer.ai && isBoardEmpty(board)) makeAIMove(currentPlayer);

    function getRandomPlayer() {
        return Math.random() < 0.5 ? player1 : player2;
    }

    async function makeSmartMove(player = currentPlayer, playerSwitch = true) {
        if (currentGameStatus.status !== "PLAYING" || connectionStatus === "WAITING" || isBoardFull()) return;

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

                    score = minimax(copiedBoard, false, player, player.id === player1.id ? player2 : player1);
                    if (score > max_score) {
                        row = i;
                        column = j;
                        max_score = score;
                    }
                }
            }
        }

        const res = await makeMove(row, column, player.sign, playerSwitch);

        return res;
    }

    async function makeRandomMove(sign = currentPlayer.sign, playerSwitch = true) {
        if (currentGameStatus.status !== "PLAYING" || connectionStatus === "WAITING" || isBoardFull()) return;

        while (true) {
            const row = Math.floor(Math.random() * 3);
            const column = Math.floor(Math.random() * 3);

            const res = await makeMove(row, column, sign, playerSwitch);

            if (res.success) return res;
        }
    }

    async function makeMove(row, column, sign = currentPlayer.sign, playerSwitch = true) {
        const res = hitCell(row, column, sign);

        if (res.success) {
            setBoard(res.board);
            if (playerSwitch) switchPlayer();

            if (connectionStatus === "READY") {
                const info = {
                    board: res.board,
                };

                const moveTrigger = await channel.trigger("client-board-move", info);
                if (moveTrigger) console.log("Move sent", info, moveTrigger);
                else console.log("Error sending move");
            }
        }

        console.log(res);
        return res;
    }

    function onRandomMoveClick() {
        if (currentPlayer.client) makeRandomMove();
    }

    function onSmartMoveClick() {
        if (currentPlayer.client) makeSmartMove();
    }

    function onCellClick(row, column) {
        if (currentGameStatus.status !== "PLAYING" || connectionStatus === "WAITING" || !currentPlayer.client) return;

        makeMove(row, column);
    }

    function hitCell(row, column, sign = currentPlayer.sign) {
        return _hitCell([...board], row, column, sign);
    }

    function isBoardFull() {
        return _isBoardFull(board);
    }

    function isBoardEmpty() {
        return _isBoardEmpty(board);
    }

    function getGameStatus() {
        return _getGameStatus(board, player1, player2);
    }

    function switchPlayer() {
        const otherPlayer =
            currentPlayer.id === player1.id ? player2 : currentPlayer.id === player2.id ? player1 : null;

        // if other player is ai, make ai move, else switch player
        if (otherPlayer.ai) makeAIMove(otherPlayer, false);
        else setCurrentPlayer(otherPlayer);
    }

    function makeAIMove(player, playerSwitch = true) {
        if (smartAI) makeSmartMove(player, playerSwitch);
        else if (randomAI) makeRandomMove(player.sign, playerSwitch);
    }

    async function reset() {
        const emptyBoard = getEmptyBoard();
        const randomPlayer = getRandomPlayer();

        setBoard(emptyBoard);
        setCurrentPlayer(randomPlayer);

        if (connectionStatus === "READY") {
            const info = {
                board: emptyBoard,
                currentPlayer: randomPlayer,
            };

            const infoTrigger = await channel.trigger("client-info-sync", info);
            if (infoTrigger) console.log("Info sent", info, infoTrigger);
            else console.log("Error sending info");
        }
    }

    return (
        <div>
            <h1>Play Page</h1>
            {connectionStatus && <p>Connection status: {connectionStatus}</p>}
            <h2>Players:</h2>
            <p>{JSON.stringify(player1)}</p>
            <p>{JSON.stringify(player2)}</p>

            {currentGameStatus.status === "PLAYING" ? (
                <p>Current player: {currentPlayer.name}</p>
            ) : currentGameStatus.status === "WIN" ? (
                <p>Winner: {currentGameStatus.winner.name}</p>
            ) : currentGameStatus.status === "DRAW" ? (
                <p>Draw</p>
            ) : null}
            <button onClick={onRandomMoveClick}>Make random move</button>
            <button onClick={onSmartMoveClick}>Make smart move</button>
            {connectionStatus ? (
                currentGameStatus.status !== "PLAYING" && <button onClick={reset}>Reset</button>
            ) : (
                <button onClick={reset}>Reset</button>
            )}
            <Board board={board} onCellClick={onCellClick} />
        </div>
    );
}
