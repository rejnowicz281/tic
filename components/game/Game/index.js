"use client";

import Board from "@/components/game/Board";
import WaitingRoom from "@/components/game/WaitingRoom";
import Loading from "@/components/general/Loading";
import useOfflineGame from "@/hooks/useOfflineGame";
import useOnlineGame from "@/hooks/useOnlineGame";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GrPowerReset } from "react-icons/gr";
import { LuBrain, LuDice1 } from "react-icons/lu";
import { RiHome2Line } from "react-icons/ri";

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

    if (connectionStatus === "TOO_MANY_PLAYERS")
        return <div className="text-4xl flex flex-1 justify-center items-center">Too many players</div>;
    if (connectionStatus === "ERROR")
        return <div className="text-4xl flex flex-1 justify-center items-center">Connection error</div>;
    if (connectionStatus === "WAITING" && !currentPlayer) return <WaitingRoom gameID={gameID} />;
    if (!currentPlayer) return <Loading />;

    return (
        <div className="bg-gray-800 flex-col flex text-white flex-1">
            <div className="aspect-square h-screen flex flex-col gap-3 p-10">
                <Board
                    clickDisabled={currentGameStatus?.status === "PLAYING" && !currentPlayer.client}
                    board={board}
                    onCellClick={onCellClick}
                />

                <div className="flex flex-col gap-3 items-center">
                    {connectionStatus === "READY" ? (
                        currentGameStatus?.status !== "PLAYING" && (
                            <button
                                className="rounded max-w-screen-sm w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                                onClick={reset}
                            >
                                <GrPowerReset className="text-3xl" />
                                Reset
                            </button>
                        )
                    ) : !connectionStatus ? (
                        <button
                            className="rounded max-w-screen-sm w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                            onClick={reset}
                        >
                            <GrPowerReset className="text-3xl" />
                            Reset
                        </button>
                    ) : null}
                    <button
                        disabled={currentGameStatus?.status === "PLAYING" && !currentPlayer.client}
                        className="disabled:bg-[#3C5061] rounded max-w-screen-sm w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                        onClick={onSmartMoveClick}
                    >
                        <LuBrain className="text-3xl" />
                        Make Smart Move
                    </button>
                    <button
                        disabled={currentGameStatus?.status === "PLAYING" && !currentPlayer.client}
                        className="disabled:bg-[#3C5061] rounded max-w-screen-sm w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                        onClick={onRandomMoveClick}
                    >
                        <LuDice1 className="text-3xl" />
                        Make Random Move
                    </button>
                </div>
                {currentGameStatus?.status === "PLAYING" ? (
                    <p className="text-2xl text-center font-bold">
                        Current player: {currentPlayer.name} ({currentPlayer.sign})
                    </p>
                ) : currentGameStatus?.status === "WIN" ? (
                    <p className="text-2xl text-center font-bold">
                        Winner: {currentGameStatus.winner.name} ({currentGameStatus.winner.sign})
                    </p>
                ) : currentGameStatus?.status === "DRAW" ? (
                    <p className="text-2xl text-center font-bold">Draw</p>
                ) : null}
            </div>

            <div className="flex gap-4 flex-col pb-4 items-center px-10">
                {(player1.ai || player2.ai) && <p className="text-2xl">You are playing against an AI.</p>}
                {gameID && <p className="text-xl">Game ID: {gameID}</p>}
                {connectionStatus && (
                    <p className="text-2xl">
                        Connection status: <span className="font-bold">{connectionStatus}</span>
                    </p>
                )}
                <Link
                    href="/"
                    className="rounded max-w-screen-sm w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                >
                    <RiHome2Line className="text-3xl" />
                    Back To Menu
                </Link>
            </div>
        </div>
    );
}
