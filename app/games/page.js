import RefreshButton from "@/components/Refresh";
import { pusherServer } from "@/pusher";
import formatChannels from "@/utils/formatChannels";
import Link from "next/link";

export default async function GamesPage() {
    const res = await pusherServer.get({
        path: "/channels",
        params: { filter_by_prefix: "presence-", info: "user_count" },
    });

    const body = res.status === 200 && (await res.json());

    const channels = formatChannels(body);

    return (
        <>
            <RefreshButton />
            <ul>
                {channels && channels.length === 0 && <p>No available games found</p>}
                {channels.map((channel) => (
                    <li key={channel}>
                        <Link href={`/play?online=true&game=${channel.id}`}>
                            {channel.id} ({channel.userCount} / 2)
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
