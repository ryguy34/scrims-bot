// embed for display of teams and captains and can also edit it as teams are being made
// buttons under of all people that can be picked

require("dotenv").config();
const {
	Client,
	GatewayIntentBits,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ComponentType,
} = require("discord.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

var state = {
	team1: [],
	team2: [],
	gameType: "",
	teamSize: 0,
	maps: 0,
};

client.once("ready", async () => {
	console.log("Bot is ready");
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName, channelId } = interaction;

	if (channelId === process.env.COMMANDS_CHANNEL_ID) {
		if (commandName === "scrim") {
			console.log("SCRIM");

			// TODO: extract this to another file
			const numberOfPlayers = new StringSelectMenuBuilder()
				.setCustomId("players-per-team")
				.setPlaceholder("Team Size")
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel("2v2")
						.setDescription("2 versus 2")
						.setValue("2"),
					new StringSelectMenuOptionBuilder()
						.setLabel("3v3")
						.setDescription("3 versus 3")
						.setValue("3"),
					new StringSelectMenuOptionBuilder()
						.setLabel("4v4")
						.setDescription("4 versus 4")
						.setValue("4"),
					new StringSelectMenuOptionBuilder()
						.setLabel("5v5")
						.setDescription("5 versus 5")
						.setValue("5")
				);

			const numberOfMaps = new StringSelectMenuBuilder()
				.setCustomId("number-of-maps")
				.setPlaceholder("Number of Maps")
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel("1")
						.setDescription("Best of 1")
						.setValue("1"),
					new StringSelectMenuOptionBuilder()
						.setLabel("3")
						.setDescription("Best of 3")
						.setValue("3"),
					new StringSelectMenuOptionBuilder()
						.setLabel("5")
						.setDescription("BNest of 5")
						.setValue("5")
				);

			const gameMode = new StringSelectMenuBuilder()
				.setCustomId("game-mode")
				.setPlaceholder("Game Mode")
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel("Respawn")
						.setDescription("Control & Hardpoint")
						.setValue("Respawn"),
					new StringSelectMenuOptionBuilder()
						.setLabel("No Respawn")
						.setDescription("SnD")
						.setValue("No Respawn"),
					new StringSelectMenuOptionBuilder()
						.setLabel("Both")
						.setDescription("SnD, Control, & Hardpoint")
						.setValue("Both")
				);

			const numberOfPlayersRow = new ActionRowBuilder().addComponents(
				numberOfPlayers
			);

			const numberOfMapsRow = new ActionRowBuilder().addComponents(
				numberOfMaps
			);

			const gameModeRow = new ActionRowBuilder().addComponents(gameMode);

			const response = await interaction.reply({
				components: [numberOfPlayersRow, numberOfMapsRow, gameModeRow],
			});

			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
				time: 3_600_000,
			});

			collector.on("collect", async (i) => {
				if (i.customId === "players-per-team") {
					state.teamSize = Number(i.values[0]);
					await i.reply({
						ephemeral: true,
						content: `Number of players: ${state.teamSize}!`,
					});
				} else if (i.customId === "number-of-maps") {
					state.maps = Number(i.values[0]);
					await i.reply({
						ephemeral: true,
						content: `Number of maps: ${state.maps}!`,
					});
				} else {
					state.gameType = i.values[0];
					await i.reply({
						ephemeral: true,
						content: `Game mode: ${state.gameType}!`,
					});
				}
			});
		} else if (commandName === "done") {
			console.log("Resetting state");
			state.team1 = [];
			state.team2 = [];
			gameType = "";
			teamSize = 0;
			state.maps = 0;
		}
	} else {
		await interaction.reply(
			"Only use this command in scrims commands channel"
		);
	}
});

client.login(process.env.BOT_TOKEN);
