import arrayRandom from "@/utils/arrayRandom";
import getEmptyBoard from "@/utils/getEmptyBoard";
import _getGameStatus from "@/utils/getGameStatus";
import _hitCell from "@/utils/hitCell";
import _isBoardEmpty from "@/utils/isBoardEmpty";
import _isBoardFull from "@/utils/isBoardFull";
import minimax from "@/utils/minimax";
import { useSearchParams } from "next/navigation";

export default function useGameLogic(data) {
    const queryParams = useSearchParams();

    if (!data) return {};

    const { player1, player2, board, currentPlayer, setBoard, setCurrentPlayer, connectionStatus, channel } = data;

    const smartAI = queryParams.get("smart") === "true";
    const randomAI = queryParams.get("random") === "true";

    // get current game status - win, draw or playing
    const currentGameStatus = getGameStatus();

    // make sure AI makes first move if it's the first player (if board is empty)
    if (currentPlayer.ai && isBoardEmpty(board)) makeAIMove(currentPlayer);

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
        const randomPlayer = arrayRandom([player1, player2]);

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

    return {
        onRandomMoveClick,
        onSmartMoveClick,
        onCellClick,
        reset,
        switchPlayer,
        currentGameStatus,
    };
}
