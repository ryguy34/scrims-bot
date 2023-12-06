require("dotenv").config();
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [
	new SlashCommandBuilder().setName("scrim").setDescription("Starts scrims"),
	new SlashCommandBuilder()
		.setName("start")
		.setDescription("Move to team channel"),
	new SlashCommandBuilder().setName("done").setDescription("Ends scrims"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

rest
	.put(
		Routes.applicationGuildCommands(
			process.env.CLIENT_ID,
			process.env.SERVER_ID
		),
		{ body: commands }
	)
	.then(() => console.log("Successfully registered application commands."))
	.catch(console.error);
