import Cell from "./Cell";
import css from "./index.module.css";

export default function Board({ board, onCellClick = () => {}, clickDisabled }) {
    return (
        <div className={css.board}>
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
