// embed for display of teams and captains and can also edit it as teams are being made
// buttons under of all people that can be picked

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

var team1 = [];
var team2 = [];

client.once("ready", async () => {
	console.log("Bot is ready");
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "scrim") {
		console.log("SCRIM");
		await interaction.reply("SCRIM");
	} else if (commandName === "done") {
		console.log("DONE");
		team1 = [];
		team2 = [];
	}
});

client.login(process.env.BOT_TOKEN);
