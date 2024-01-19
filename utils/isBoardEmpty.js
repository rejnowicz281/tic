// check if board has all 'null' cells

export default function isBoardEmpty(board) {
    for (let row of board) {
        for (let cell of row) {
            if (cell !== null) return false;
        }
    }

    return true;
}
