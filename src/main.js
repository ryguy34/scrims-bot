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

const gameModeMapsList = [
	{ Hardpoint: ["Invasion", "Karachi", "Skidrow", "Sub Base", "Terminal"] },
	{ SnD: ["Highrise", "Invasion", "Karachi", "Terminal", "Skidrow"] },
	{ Control: ["Highrise", "Invasion", "Karachi"] },
];

var state = {
	team1: [],
	team2: [],
	gameType: [],
	teamSize: 0,
	maps: 0,
	chosenModeMap: [],
};

var selectedOptions = {};

client.once("ready", async () => {
	console.log("Bot is ready");
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName, channelId } = interaction;

	if (channelId === process.env.COMMANDS_CHANNEL_ID) {
		if (commandName === "scrim") {
			console.log("SCRIM");

			const response = await interaction.reply({
				content: "Match Settings",
				components: buildMenuComponent(),
			});

			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
				time: 60000,
			});

			collector.on("collect", (interaction) => {
				const customId = interaction.customId;
				const selectedValues = interaction.values;

				// Process the selected values based on the custom ID
				selectedOptions[customId] = selectedValues;
				interaction.deferUpdate();

				// Check if all menus have received selections
				if (Object.keys(selectedOptions).length === 4) {
					// If all menus have selections, end the collector
					collector.stop();
				}
			});

			collector.on("end", () => {
				// Process the collected options later or as part of a larger interaction
				console.log("Collected Options:", selectedOptions);
				const mapSize = selectedOptions["number-of-maps"][0];

				for (let i = 0; i < mapSize; i++) {
					const chosenModeIndex = getRandomElement(
						selectedOptions["game-mode"]
					);

					const chosenMode = Object.keys(
						gameModeMapsList[chosenModeIndex]
					)[0];

					const chosenMap = getRandomElement(
						Object.values(gameModeMapsList[chosenModeIndex])[0]
					);
					console.log(`Index: ${i} Mode: ${chosenMode} Map: ${chosenMap}`);
				}
			});
		} else if (commandName === "start") {
			//TODO: move each team to respective chat
		} else if (commandName === "done") {
			//TODO: reset state and return players to draft chat
			console.log("Resetting state");
			state.team1 = [];
			state.team2 = [];
			state.gameType = "";
			state.teamSize = 0;
			state.maps = 0;
			state.chosenModeMap = [];
		}
	} else {
		await interaction.reply(
			"Only use this command in scrims commands channel"
		);
	}
});

function getRandomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function buildMenuComponent() {
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
				.setDescription("Best of 5")
				.setValue("5")
		);

	const gameMode = new StringSelectMenuBuilder()
		.setCustomId("game-mode")
		.setPlaceholder("Game Mode")
		.setMinValues(1)
		.setMaxValues(3)
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel("Hardpoint")
				.setValue("0"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Search and Destroy")
				.setValue("1"),
			new StringSelectMenuOptionBuilder().setLabel("Control").setValue("2")
		);

	const assembleTeams = new StringSelectMenuBuilder()
		.setCustomId("assemble-teams")
		.setPlaceholder("Draft Type")
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel("Captains")
				.setValue("captains"),
			new StringSelectMenuOptionBuilder()
				.setLabel("Random")
				.setValue("random")
		);

	const numberOfPlayersRow = new ActionRowBuilder().addComponents(
		numberOfPlayers
	);

	const numberOfMapsRow = new ActionRowBuilder().addComponents(numberOfMaps);

	const gameModeRow = new ActionRowBuilder().addComponents(gameMode);

	const assembleTeamsRow = new ActionRowBuilder().addComponents(assembleTeams);

	return [numberOfPlayersRow, numberOfMapsRow, gameModeRow, assembleTeamsRow];
}

client.login(process.env.BOT_TOKEN);
