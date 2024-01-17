import css from "./index.module.css";

export default function Cell({ content, onClick }) {
    return (
        <div onClick={onClick} className={css.cell}>
            {content}
        </div>
    );
}
