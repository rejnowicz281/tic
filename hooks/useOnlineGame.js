import { pusherClient } from "@/pusher";
import { useEffect, useRef, useState } from "react";

export default function useOnlineGame(
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
) {
    if (!gameId) return { connectionStatus: null };

    const [connectionStatus, setConnectionStatus] = useState("WAITING");
    const channelName = `presence-${gameId}`;
    const channelRef = useRef(null);

    // unsubscribe from channel if connection status is null and a channel is already set up
    useEffect(() => {
        if (!connectionStatus && channelRef.current) {
            pusherClient.unsubscribe(channelName);
            channelRef.current = null;
        }
    }, [connectionStatus]);

    // set up pusher channel (only once)
    useEffect(() => {
        if (channelRef.current) return;

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

    return { connectionStatus, channel: channelRef.current };
}
