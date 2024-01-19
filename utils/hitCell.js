export default function hitCell(board, row, column, sign) {
    const cellValue = board[row][column];

    if (cellValue !== null) return { success: false, error: "CELL_OCCUPIED" };

    board[row][column] = sign;

    return { success: true, board, row, column, sign };
}
