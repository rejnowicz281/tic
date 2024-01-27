import { pusherClient } from "@/pusher";
import arrayRandom from "@/utils/arrayRandom";
import generatePlayerObject from "@/utils/generatePlayerObject";
import getEmptyBoard from "@/utils/getEmptyBoard";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
import useGameLogic from "./useGameLogic";

export default function useOnlineGame() {
    const queryParams = useSearchParams();

    const [gameID, setGameID] = useState(queryParams.get("game"));

    const [board, setBoard] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);

    const [player1, setPlayer1] = useState(null);
    const [player2, setPlayer2] = useState(null);

    const [connectionStatus, setConnectionStatus] = useState("WAITING");
    const channelName = `presence-${gameID}`;
    const channelRef = useRef(null);

    // get game logic after connection is ready
    const { switchPlayer, onRandomMoveClick, onSmartMoveClick, onCellClick, reset, currentGameStatus } = useGameLogic(
        connectionStatus === "READY"
            ? {
                  player1,
                  player2,
                  board,
                  currentPlayer,
                  setBoard,
                  setCurrentPlayer,
                  channel: channelRef.current,
                  connectionStatus,
              }
            : null
    );

    function unsubscribe(connectionStatus) {
        if (channelRef.current) {
            pusherClient.unsubscribe(channelName);
            channelRef.current = null;
            setConnectionStatus(connectionStatus);
        }
    }

    useEffect(() => {
        if (!gameID) setGameID(uniqid());
    }, []);

    // set up pusher channel
    useEffect(() => {
        if (channelRef.current || !gameID) return;

        const channel = pusherClient.subscribe(channelName);

        channelRef.current = channel;
    }, [gameID]);

    useEffect(() => {
        const channel = channelRef.current;

        if (!channel || !gameID) return;

        channel.bind("pusher:member_added", (member) => {
            console.log("member added", member);

            if (channel.members.count === 2) {
                const gameAlreadyStarted = board && currentPlayer && player1 && player2;

                const gameInfo = gameAlreadyStarted
                    ? { board, currentPlayer, player1, player2 }
                    : (() => {
                          const player1 = generatePlayerObject("Player 1", "X", false, true);
                          const player2 = generatePlayerObject("Player 2", "O", false, false);
                          const currentPlayer = arrayRandom([player1, player2]);
                          const board = getEmptyBoard();

                          setBoard(board);
                          setCurrentPlayer(currentPlayer);
                          setPlayer1(player1);
                          setPlayer2(player2);

                          return { board, currentPlayer, player1, player2 };
                      })();

                const infoTrigger = channel.trigger("client-starting-info-sync", gameInfo);
                if (infoTrigger) {
                    setConnectionStatus("READY");
                    console.log("Other player connected, sending starting info", gameInfo, infoTrigger);
                } else {
                    unsubscribe("ERROR");
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
    }, [currentPlayer, gameID]);

    useEffect(() => {
        const channel = channelRef.current;

        if (!channel || !gameID) return;

        channel.bind("pusher:subscription_succeeded", (data) => {
            console.log("subscription succeeded", data);

            if (data.count > 2) {
                console.log("Too many players connected to this channel");
                unsubscribe("TOO_MANY_PLAYERS");
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
            unsubscribe("ERROR");
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
    }, [gameID]);

    return {
        connectionStatus,
        channel: channelRef.current,
        currentPlayer,
        setCurrentPlayer,
        board,
        setBoard,
        player1,
        player2,
        onRandomMoveClick,
        onSmartMoveClick,
        onCellClick,
        reset,
        currentGameStatus,
        gameID,
    };
}
