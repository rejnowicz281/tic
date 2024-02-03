import Cell from "./Cell";

export default function Board({ board, onCellClick = () => {}, clickDisabled }) {
    return (
        <div className="mx-auto max-w-screen-sm w-full aspect-square grid grid-cols-3 grid-rows-3 gap-2">
            {[...Array(3)].map((_, row) =>
                [...Array(3)].map((_, column) => (
                    <Cell
                        disabled={clickDisabled}
                        onClick={() => onCellClick(row, column)}
                        content={board[row][column]}
                        key={`${row}${column}`}
                    />
                ))
            )}
        </div>
    );
}
