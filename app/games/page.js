import RefreshButton from "@/components/general/Refresh";
import { pusherServer } from "@/pusher";
import formatChannels from "@/utils/formatChannels";
import Link from "next/link";
import { IoIosAddCircleOutline } from "react-icons/io";
import { RiHome2Line } from "react-icons/ri";

export default async function GamesPage() {
    const res = await pusherServer.get({
        path: "/channels",
        params: { filter_by_prefix: "presence-", info: "user_count" },
    });

    const body = res.status === 200 && (await res.json());

    const channels = formatChannels(body);

    return (
        <div className="p-5 flex flex-col items-center gap-6 text-xl">
            <Link
                href="/"
                className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
            >
                <RiHome2Line className="text-3xl" />
                Back To Menu
            </Link>
            <Link
                href="/play?online=true"
                className="rounded max-w-[400px] w-full flex items-center justify-center gap-3 bg-gray-700 p-3 font-bold text-gray-300 shadow-sm hover:bg-gray-600"
            >
                <IoIosAddCircleOutline className="text-3xl" />
                Create Lobby
            </Link>
            <RefreshButton />
            {channels && channels.length === 0 && <p>No Games Found</p>}
            <ul>
                {channels.map((channel) => (
                    <li className="list-disc" key={channel}>
                        <Link className="hover:text-gray-300" href={`/play?online=true&game=${channel.id}`}>
                            {channel.id} ({channel.userCount} / 2)
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
