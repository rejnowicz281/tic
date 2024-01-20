"use server";

import { pusherServer } from "@/pusher";

export async function sayHi(channel, socketId) {
    try {
        await pusherServer.trigger(
            channel,
            "hi",
            { message: "hi" },
            {
                socket_id: socketId,
            }
        );

        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}
