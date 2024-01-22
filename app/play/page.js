"use client";

import Board from "@/components/Board";
import { pusherClient } from "@/pusher";
import generatePlayerObject from "@/utils/generatePlayerObject";
import getEmptyBoard from "@/utils/getEmptyBoard";
import _getGameStatus from "@/utils/getGameStatus";
import _hitCell from "@/utils/hitCell";
import _isBoardEmpty from "@/utils/isBoardEmpty";
import _isBoardFull from "@/utils/isBoardFull";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PlayPage() {
    const queryParams = useSearchParams();

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";

    // online game config
    const game = queryParams.get("game");
    const [connectionStatus, setConnectionStatus] = useState(game ? "WAITING" : null);
    const channelNameRef = useRef(`presence-${game}`);
    const channelRef = useRef(null);

    const [board, setBoard] = useState(getEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState(null);

    const [player1, setPlayer1] = useState(generatePlayerObject("Player 1", "X", false, true));

    const [player2, setPlayer2] = useState(
        generatePlayerObject(
            smartAI ? "Smart Bot" : randomAI ? "Random Bot" : "Player 2",
            "O",
            smartAI || randomAI,
            game || smartAI || randomAI ? false : true
        )
    );

    const currentGameStatus = getGameStatus();
    const channelName = channelNameRef.current;

    // randomize first player
    useEffect(() => {
        setCurrentPlayer(getRandomPlayer());
    }, []);

    // unsubscribe from channel if connection status is null and a channel is already set up
    useEffect(() => {
        if (!connectionStatus && channelRef.current) {
            pusherClient.unsubscribe(channelName);
            channelRef.current = null;
        }
    }, [connectionStatus]);

    // set up pusher channel (if not already set up)
    useEffect(() => {
        if (channelRef.current || !connectionStatus) return;

        const channel = pusherClient.subscribe(channelName);

        channelRef.current = channel;
    }, []);

    useEffect(() => {
        const channel = channelRef.current;

        if (!channel || !currentPlayer) return;

        channel.bind("pusher:member_added", (member) => {
            console.log("member added", member);

            if (channel.members.count === 2) {
                const gameInfo = {
                    board,
                    currentPlayer,
                    player1,
                    player2,
                };
                const infoTrigger = channel.trigger("client-starting-info-sync", gameInfo);
                if (infoTrigger) {
                    setConnectionStatus("READY");
                    console.log("Other player connected, sending starting info", gameInfo, infoTrigger);
                } else {
                    setConnectionStatus(null);
                    console.log("Error sending starting info");
                }
            }
        });

        channel.bind("client-board-move", (data) => {
            console.log("move received", data);
            setBoard(data.board);
            switchPlayer();
        });

        return () => {
            channel.unbind("client-board-move");
            channel.unbind("pusher:member_added");
        };
    }, [currentPlayer]);

    useEffect(() => {
        const channel = channelRef.current;

        if (!channel) return;

        channel.bind("pusher:subscription_succeeded", (data) => {
            console.log("subscription succeeded", data);

            if (data.count > 2) {
                console.log("Too many players connected to this channel");
                setConnectionStatus(null);
            } else if (data.count === 2) {
                console.log("Two players ready, waiting for starting info sync");
            } else {
                console.log("Not enough players connected to this channel");
            }
        });

        channel.bind("pusher:member_removed", (member) => {
            console.log("member removed", member);
            if (channel.members.count !== 2) setConnectionStatus("WAITING");
        });

        channel.bind("pusher:subscription_error", (data) => {
            console.log("subscription error", data);
            setConnectionStatus(null);
        });

        channel.bind("client-starting-info-sync", (data) => {
            console.log("starting info sync received", data);

            setBoard(data.board);
            setCurrentPlayer({ ...data.currentPlayer, client: !data.currentPlayer.client });
            setPlayer2({ ...data.player2, client: !data.player2.client });
            setPlayer1({ ...data.player1, client: !data.player1.client });
            setConnectionStatus("READY");
        });

        channel.bind("client-info-sync", (data) => {
            console.log("info sync received", data);

            if (data.board) setBoard(data.board);
            if (data.currentPlayer) setCurrentPlayer({ ...data.currentPlayer, client: !data.currentPlayer.client });
            if (data.player1) setPlayer2({ ...data.player2, client: !data.player2.client });
            if (data.player2) setPlayer1({ ...data.player1, client: !data.player1.client });
        });

        return () => {
            channel.unbind("pusher:subscription_succeeded");
            channel.unbind("pusher:subscription_error");
            channel.unbind("pusher:member_removed");
            channel.unbind("client-starting-info-sync");
            channel.unbind("client-info-sync");
        };
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

                    score = minimax(copiedBoard, false, player);
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

    async function onCellClick(row, column) {
        if (currentGameStatus.status !== "PLAYING" || connectionStatus === "WAITING" || !currentPlayer.client) return;

        const res = await makeMove(row, column);

        return res;
    }

    async function makeMove(row, column, sign = currentPlayer.sign, playerSwitch = true) {
        const res = hitCell(row, column, sign);

        if (res.success) {
            setBoard(res.board);
            if (playerSwitch) switchPlayer();

            if (connectionStatus === "READY") {
                const channel = channelRef.current;

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
            const channel = channelRef.current;

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
            <button
                onClick={() => {
                    if (currentPlayer.client) makeRandomMove();
                }}
            >
                Make random move
            </button>
            <button
                onClick={() => {
                    if (currentPlayer.client) makeSmartMove();
                }}
            >
                Make smart move
            </button>
            {connectionStatus ? (
                currentGameStatus.status !== "PLAYING" && <button onClick={reset}>Reset</button>
            ) : (
                <button onClick={reset}>Reset</button>
            )}
            <Board board={board} onCellClick={onCellClick} />
        </div>
    );
}
