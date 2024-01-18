import css from "./index.module.css";

export default function Cell({ content, onClick, disabled }) {
    return (
        <button disabled={disabled} onClick={onClick} className={css.cell}>
            {content}
        </button>
    );
}
