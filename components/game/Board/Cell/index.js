import { PiCircle, PiX } from "react-icons/pi";

export default function Cell({ content, onClick, disabled }) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="rounded text- bg-gray-700 flex items-center justify-center border-2 border-gray-600 hover:bg-gray-600"
        >
            {content === "X" ? <PiX className="text-7xl" /> : content === "O" ? <PiCircle className="text-7xl" /> : ""}
        </button>
    );
}
