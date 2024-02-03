import Link from "next/link";
import { CiGlobe } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import { LuBrain, LuDice1 } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";

export default function Home() {
    return (
        <div className="p-10 flex flex-1 items-center justify-center">
            <div className="max-w-[500px] w-full">
                <h1 className="text-4xl font-bold text-center text-gray-200">Welcome to Tic Tac Toe</h1>
                <p className="mt-4 text-lg text-gray-400 text-center">Choose Your Game Mode</p>
                <div className="flex flex-col mt-8 gap-7">
                    <Link
                        href="/play?smart=true"
                        className="rounded flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                    >
                        <LuBrain className="text-3xl" />
                        Play with Smart AI
                    </Link>
                    <Link
                        href="/play?random=true"
                        className="rounded flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                    >
                        <LuDice1 className="text-3xl" />
                        Play with Random AI
                    </Link>
                    <Link
                        href="/play"
                        className="rounded flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                    >
                        <GoPeople className="text-3xl" />
                        Play with a Friend
                    </Link>
                    <Link
                        href="/play?online=true"
                        className="rounded flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                    >
                        <CiGlobe className="text-3xl" />
                        Play Online
                    </Link>
                    <Link
                        href="/games"
                        className="rounded flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
                    >
                        <MdOutlineRemoveRedEye className="text-3xl" />
                        See Available Online Games
                    </Link>
                </div>
            </div>
        </div>
    );
}
