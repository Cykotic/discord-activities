const {
    Client,
    GatewayIntentBits,
    Partials
} = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const {
    formatActivities
} = require('./utils');

const client = new Client({
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Object.keys(Partials)]
})


client.once('ready', async () => {
    console.log(`Logged in as ${client.user.username}`);
    const guild = client.guilds.cache.first();

    await guild.members.fetch();
    await fetchMemberData(guild);

    // fetch member data every 20 seconds
    setInterval(() => fetchMemberData(guild), 20000);
});

const fetchMemberData = async (guild) => {
    let membersData = {};

    const members = guild.members.cache.filter(member => !member.user.bot && member.id === '253986575682109441'); // Exclude bots and only filter myself
    await Promise.all(members.map(async (member) => {
        membersData = {
            id: member.user.id,
            username: member.user.username,
            avatarUrl: member.user.displayAvatarURL(),
            flags: member.user.flags,
            status: member.presence?.status || 'offline',
            activities: member.presence?.activities ? await formatActivities(member.presence.activities) : []
        };
    }));

    fs.writeFileSync('membersData.json', JSON.stringify(membersData, null, 2), 'utf8');
    console.log('Member activity data saved to membersData.json');
};

client.login(process.env.token);