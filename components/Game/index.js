"use client";

import Board from "@/components/Board";
import WaitingRoom from "@/components/WaitingRoom";
import useOfflineGame from "@/hooks/useOfflineGame";
import useOnlineGame from "@/hooks/useOnlineGame";
import { useSearchParams } from "next/navigation";

export default function Game() {
    const queryParams = useSearchParams();

    const online = queryParams.get("online") === "true";

    const gameData = online ? useOnlineGame() : useOfflineGame();

    const {
        player1,
        player2,
        board,
        currentPlayer,
        onRandomMoveClick,
        onSmartMoveClick,
        onCellClick,
        reset,
        currentGameStatus,
        connectionStatus,
        gameID,
    } = gameData;

    if (connectionStatus === "TOO_MANY_PLAYERS") return <p>Too many players</p>;
    if (connectionStatus === "ERROR") return <p>Connection error</p>;
    if (connectionStatus === "WAITING" && !currentPlayer) return <WaitingRoom gameID={gameID} />;
    if (!currentPlayer) return <p>Initializing...</p>;

    return (
        <>
            {connectionStatus && <p>Connection status: {connectionStatus}</p>}
            {gameID && <p>Game ID: {gameID}</p>}
            <h2>Players:</h2>
            <p>{JSON.stringify(player1)}</p>
            <p>{JSON.stringify(player2)}</p>

            {currentGameStatus?.status === "PLAYING" ? (
                <p>Current player: {currentPlayer.name}</p>
            ) : currentGameStatus?.status === "WIN" ? (
                <p>Winner: {currentGameStatus?.winner.name}</p>
            ) : currentGameStatus?.status === "DRAW" ? (
                <p>Draw</p>
            ) : null}
            <button onClick={onRandomMoveClick}>Make random move</button>
            <button onClick={onSmartMoveClick}>Make smart move</button>
            {connectionStatus === "READY" ? (
                currentGameStatus?.status !== "PLAYING" && <button onClick={reset}>Reset</button>
            ) : !connectionStatus ? (
                <button onClick={reset}>Reset</button>
            ) : null}
            <Board board={board} onCellClick={onCellClick} />
        </>
    );
}
