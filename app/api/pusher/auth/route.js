import { pusherServer } from "@/pusher";

export async function POST(req) {
    const data = await req.text();

    const [socketId, channel] = data.split("&").map((str) => str.split("=")[1]);

    try {
        const auth = pusherServer.authorizeChannel(socketId, channel, {
            user_id: socketId,
        });

        return Response.json(auth);
    } catch (e) {
        console.log(e.message);
        return Response.json({ success: false, error: e.message });
    }
}
