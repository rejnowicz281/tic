import Cell from "./Cell";
import css from "./index.module.css";

export default function Board({ board, onCellClick }) {
    return (
        <div className={css.board}>
            {[...Array(3)].map((_, row) =>
                [...Array(3)].map((_, column) => (
                    <Cell
                        onClick={() => onCellClick(row, column)}
                        content={board[row][column]}
                        key={`${row}${column}`}
                    />
                ))
            )}
        </div>
    );
}
