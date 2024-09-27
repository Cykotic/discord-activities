const axios = require('axios');

async function fetchApplicationDetails(applicationId) {
    try {
        const {
            data
        } = await axios.get(`https://discord.com/api/v10/applications/${applicationId}/rpc`, {
            headers: {
                'Authorization': `Bot ${process.env.token}`,
            },
        });
        return data;
    } catch (error) {
        return null; // throws errors if it's not null idk why
    }
}

const activityTypes = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening to',
    3: 'Watching',
    4: 'Competing',
};

const getActivityDetails = (activity) => {
    const detailsMap = {
        0: `Playing: ${activity.name}`,
        1: `Streaming: ${activity.name} (${activity.url || 'No URL'})`,
        2: `Listening to: ${activity.details || 'Unknown'}, Artist: ${activity.state || 'Unknown'}`,
        3: `Watching: ${activity.name}`,
        4: `Competing in: ${activity.name}`,
    };
    return detailsMap[activity.type] || 'No additional info';
};

const formatActivities = async (activities = []) => {
    const activityPromises = activities.map(async (activity) => {
        let ImageUrl, AppUrl;

        if (activity.name === 'Spotify' && activity.assets?.largeImage) {
            // Fetch Spotify-specific image URL
            ImageUrl = `https://i.scdn.co/image/${activity.assets.largeImage.replace('spotify:', '')}`;
        } else {
            // Fetch application details for activities
            const appDetails = await fetchApplicationDetails(activity.applicationId);
            AppUrl = appDetails?.icon
                ? `https://cdn.discordapp.com/app-icons/${activity.applicationId}/${appDetails.icon}.webp?size=256&keep_aspect_ratio=false`
                : null;
            ImageUrl = activity.assets?.largeImage
                ? `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.largeImage}.png?size=256`
                : null;
        }

        return {
            name: activity.name,
            type: activityTypes[activity.type] || 'Unknown',
            url: activity.url || 'N/A',
            created_at: activity.createdTimestamp,
            timestamps: activity.timestamps,
            details: getActivityDetails(activity),
            state: activity.state || 'N/A',
            emoji: activity.emoji,
            party: activity.party || {},
            assets: activity.assets,
            secrets: activity.secrets,
            instance: activity.instance,
            flags: activity.flags,
            buttons: activity.buttons,
            AppUrl,
            ImageUrl,
        };
    });

    return Promise.all(activityPromises);
};



module.exports = {
    fetchApplicationDetails,
    formatActivities
}