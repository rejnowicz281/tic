import getPlayer from "./getPlayer";

export default function getWinner(board, player1, player2) {
    // check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] !== null && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
            return getPlayer(board[i][0], player1, player2);
        }
    }

    // check columns
    for (let i = 0; i < 3; i++) {
        if (board[0][i] !== null && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
            return getPlayer(board[0][i], player1, player2);
        }
    }

    // check diagonals
    if (board[0][0] !== null && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
        return getPlayer(board[0][0], player1, player2);
    }

    if (board[0][2] !== null && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
        return getPlayer(board[0][2], player1, player2);
    }

    return null;
}
