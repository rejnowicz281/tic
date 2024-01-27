import { redirect } from "next/navigation";

export default function WaitingRoom({ gameID }) {
    return (
        <div>
            <p>Connecting to Game {gameID} . . .</p>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(gameID);
                }}
            >
                copy game id
            </button>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(`${location.origin}/play?online=true&game=${gameID}`);
                }}
            >
                get invite link
            </button>
            <p>or paste game code here</p>
            <form
                action={(formData) => {
                    const game = formData.get("game");

                    if (!game) return;

                    redirect(`/play?online=true&game=${game}`);
                }}
            >
                <input type="text" name="game" placeholder="game code" />
                <button>connect</button>
            </form>
        </div>
    );
}
