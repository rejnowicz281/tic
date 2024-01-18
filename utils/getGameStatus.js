import getWinner from "./getWinner";
import isBoardFull from "./isBoardFull";

export default function getGameStatus(board, player1, player2) {
    const winner = getWinner(board, player1, player2);

    if (winner !== null) {
        return { status: "WIN", winner };
    } else if (isBoardFull(board)) {
        return { status: "DRAW" };
    } else {
        return { status: "PLAYING" };
    }
}
