export default function formatChannels(body) {
    const channels = [];

    Object.keys(body.channels).map((channel) => {
        const channelObj = {
            id: channel.slice(channel.indexOf("-") + 1),
            userCount: body.channels[channel].user_count,
        };
        channels.push(channelObj);
    });

    return channels;
}
