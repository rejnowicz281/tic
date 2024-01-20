"use client";

import { sayHi } from "@/actions/online";
import { pusherClient } from "@/pusher";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import uniqid from "uniqid";

export default function OnlinePage() {
    const router = useRouter();
    const queryParams = useSearchParams();

    const queryInvite = queryParams.get("invite");

    const [invite, setInvite] = useState(null);
    const [inviteState, setInviteState] = useState("");
    const channelName = invite ? `presence-${invite}` : queryInvite ? `presence-${queryInvite}` : null;

    useEffect(() => {
        if (!channelName) return generateInvite();

        const channel = pusherClient.subscribe(channelName);

        channel.bind("hi", (data) => {
            console.log(data);
        });

        channel.bind("pusher:subscription_succeeded", (data) => {
            console.log("subscription succeeded", data);

            if (data.count > 2) {
                console.log("Too many players connected to this channel");
                generateInvite();
            } else if (data.count === 2) {
                console.log("Two players ready");
                setInviteState(`Users connected - ${channel.members.count}. Ready to start`);
                // router.push(`/play?game=${invite || queryInvite}`);
            } else {
                console.log("Waiting for another player");
                setInviteState(`Users connected - ${channel.members.count}. Waiting for another player`);
            }
        });

        channel.bind("pusher:member_added", (member) => {
            console.log("member added", member);

            if (channel.members.count === 2) {
                console.log("Two players ready");
                setInviteState(`Users connected - ${channel.members.count}. Ready to start`);
                // router.push(`/play?game=${invite || queryInvite}`);
            }
        });

        channel.bind("pusher:member_removed", (member) => {
            console.log("member removed", member);
            setInviteState(`Users connected - ${channel.members.count}. Waiting for another player`);
        });

        channel.bind("pusher:subscription_error", (data) => {
            console.log("subscription error", data);
        });

        return () => {
            channel.unbind("pusher:subscription_succeeded");
            channel.unbind("pusher:subscription_error");
            channel.unbind("pusher:member_added");
            channel.unbind("pusher:member_removed");
            pusherClient.unsubscribe(channelName);
        };
    }, [channelName]);

    function generateInvite() {
        setInvite(uniqid());
    }

    if (!invite && !queryInvite) return <p>Initializing...</p>;

    return (
        <>
            <h1>online</h1>
            {invite ? (
                <>
                    <p>your invite code: {invite}</p>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(invite);
                        }}
                    >
                        copy invite code
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${location.origin}/online?invite=${invite}`);
                        }}
                    >
                        get invite link
                    </button>
                    <p>share this invite with your friend</p>
                    <p>or paste invite code here</p>
                    <form
                        action={(formData) => {
                            const invite = formData.get("invite");

                            if (!invite) return;

                            redirect(`/online?invite=${invite}`);
                        }}
                    >
                        <input type="text" name="invite" placeholder="invite code" />
                        <button>connect</button>
                    </form>
                </>
            ) : queryInvite ? (
                <>
                    <p>you are joining game {queryInvite}...</p>
                    <p>paste new invite code here</p>
                    <form
                        action={(formData) => {
                            const invite = formData.get("invite");

                            if (!invite) return;

                            redirect(`/online?invite=${invite}`);
                        }}
                    >
                        <input type="text" name="invite" placeholder="invite code" />
                        <button>connect</button>
                    </form>
                    <p>or generate your own invite</p>
                    <button onClick={generateInvite}>generate invite (stop joining game {queryInvite})</button>
                </>
            ) : null}
            <p>{inviteState}</p>

            <button onClick={() => sayHi(channelName, pusherClient.connection.socket_id)}>say hi</button>
        </>
    );
}
