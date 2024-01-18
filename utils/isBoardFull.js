// check if board has no 'null' cells

export default function isBoardFull(board) {
    for (let row of board) {
        for (let cell of row) {
            if (cell === null) return false;
        }
    }

    return true;
}
