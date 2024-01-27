import arrayRandom from "@/utils/arrayRandom";
import generatePlayerObject from "@/utils/generatePlayerObject";
import getEmptyBoard from "@/utils/getEmptyBoard";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useGameLogic from "./useGameLogic";

export default function useOfflineGame() {
    const queryParams = useSearchParams();

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";

    const [board, setBoard] = useState(getEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState(null);

    // not ai, always client
    const player1Ref = useRef(generatePlayerObject("Player 1", "X", false, true));
    const player1 = player1Ref.current;

    // if ai on, player 2 is ai. else player 2 is client
    const player2Ref = useRef(
        generatePlayerObject(
            smartAI ? "Smart Bot" : randomAI ? "Random Bot" : "Player 2",
            "O",
            smartAI || randomAI,
            smartAI || randomAI ? false : true
        )
    );
    const player2 = player2Ref.current;

    // get game logic after first player is set
    const { onRandomMoveClick, onSmartMoveClick, onCellClick, reset, currentGameStatus } = useGameLogic(
        currentPlayer
            ? {
                  player1,
                  player2,
                  board,
                  currentPlayer,
                  setBoard,
                  setCurrentPlayer,
              }
            : null
    );

    // randomize first player
    useEffect(() => {
        setCurrentPlayer(arrayRandom([player1, player2]));
    }, []);

    return {
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
    };
}
