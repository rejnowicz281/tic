import getGameStatus from "./getGameStatus";

export default function minimax(currentBoard, isMaximizing, playerMaximizing, playerMinimizing) {
    const gameStatus = getGameStatus(currentBoard, playerMaximizing, playerMinimizing);

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
                    score = minimax(copiedBoard, false, playerMaximizing, playerMinimizing);
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

                    copiedBoard[i][j] = playerMinimizing.sign;
                    score = minimax(copiedBoard, true, playerMaximizing, playerMinimizing);
                    min_score = Math.min(min_score, score);
                }
            }
        }
        return min_score;
    }
}
