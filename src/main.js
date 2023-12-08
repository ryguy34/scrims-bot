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
	undraftedPlayers: [],
	teamSize: 0,
	chosenModeMap: [],
	draftType: "",
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
				state.teamSize = selectedOptions["players-per-team"][0];
				state.draftType = selectedOptions["assemble-teams"][0];

				while (state.chosenModeMap.length != mapSize) {
					const chosenModeIndex = getRandomElement(
						selectedOptions["game-mode"]
					);

					const chosenMode = Object.keys(
						gameModeMapsList[chosenModeIndex]
					)[0];

					const chosenMap = getRandomElement(
						Object.values(gameModeMapsList[chosenModeIndex])[0]
					);

					const mapModeObj = {
						mode: chosenMode,
						map: chosenMap,
					};

					const isInArray = state.chosenModeMap.some(
						(item) => JSON.stringify(item) === JSON.stringify(mapModeObj)
					);

					if (!isInArray) {
						state.chosenModeMap.push(mapModeObj);
					}
				}

				console.log(state);
				const channel = interaction.channel;
				const draftChannel = interaction.guild.channels.cache.get(
					process.env.DRAFT_CHANNEL_ID
				);
				channel.send("Replace with embed");

				if (state.draftType === "random") {
					draftChannel.members.forEach((member) => {
						state.undraftedPlayers.push(member);
						//console.log(`Username: ${member.user.username}`);
					});
					console.log(state.undraftedPlayers);
					assignRandomTeams();
				}
			});
		} else if (commandName === "start") {
			for (let i = 0; i < state.team1.length; i++) {
				const member1 = state.team1[i];
				if (member1 && member1.voice.channel) {
					// Move the member to the target voice channel
					await member1.voice.setChannel(process.env.TEAM_1_CHANNEL_ID);
					console.log(`Moved ${member1.user.tag} to team 1 channel`);
				}

				const member2 = state.team2[i];
				if (member2 && member2.voice.channel) {
					// Move the member to the target voice channel
					await member2.voice.setChannel(process.env.TEAM_1_CHANNEL_ID);
					console.log(`Moved ${member2.user.tag} to team 2 channel`);
				}
			}
		} else if (commandName === "done") {
			//TODO: reset state and return players to draft chat
			// I think some of these should be []
			console.log("Resetting state");
			state.team1 = [];
			state.team2 = [];
			state.undraftedPlayers = [];
			state.teamSize = 0;
			state.chosenModeMap = [];
			selectedOptions = {};
		}
	} else {
		await interaction.reply(
			"Only use this command in scrims commands channel"
		);
	}
});

function assignRandomTeams() {
	const size = parseInt(state.teamSize, 10);
	for (let i = 0; i < 1; i++) {
		const member1 = getAndRemoveRandomElement(state.undraftedPlayers);
		state.team1.push(member1);
		const member2 = getAndRemoveRandomElement(state.undraftedPlayers);
		state.team2.push(member2);
	}
}

function getAndRemoveRandomElement(arr) {
	const randomIndex = Math.floor(Math.random() * arr.length);
	const ele = arr[randomIndex];
	console.log(ele);

	state.undraftedPlayers = arr.filter((item) => item !== ele);
	return ele;
}

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
