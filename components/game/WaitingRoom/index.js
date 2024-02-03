import Link from "next/link";
import { redirect } from "next/navigation";
import { CiPlay1 } from "react-icons/ci";
import { MdOutlineContentCopy } from "react-icons/md";
import { RiHome2Line } from "react-icons/ri";

export default function WaitingRoom({ gameID }) {
    return (
        <div className="flex-1 flex flex-col gap-5 justify-center items-center p-4">
            <p className="text-3xl text-center">Connecting to Game {gameID} . . .</p>

            <Link
                href="/"
                className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
            >
                <RiHome2Line className="text-3xl" />
                Back To Menu
            </Link>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(gameID);
                }}
                className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
            >
                <MdOutlineContentCopy className="text-3xl" />
                Copy Game ID
            </button>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(`${location.origin}/play?online=true&game=${gameID}`);
                }}
                className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
            >
                <MdOutlineContentCopy className="text-3xl" />
                Get Invite Link
            </button>
            <p className="text-xl">Or paste game code here</p>
            <form
                action={(formData) => {
                    const game = formData.get("game");

                    if (!game) return;

                    redirect(`/play?online=true&game=${game}`);
                }}
                className="flex flex-col gap-5"
            >
                <input
                    className="bg-inherit border-b py-2 px-1"
                    type="text"
                    name="game"
                    placeholder="Game code here..."
                />
                <button className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600">
                    <CiPlay1 className="text-3xl" />
                    Connect
                </button>
            </form>
        </div>
    );
}
