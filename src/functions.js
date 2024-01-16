const chalk = require("chalk");
const { EmbedBuilder } = require("discord.js");

async function getAPIMeanResponseTime() {
	const url =
		"https://status.hypixel.net/metrics-display/qtxd0x1427g5/day.json";
	return await fetch(url)
		.then((res) => res.json())
		.then((data) => data.summary.mean);
}

function sendAPITime(users, mean) {
	let message = {
		embeds: [
			new EmbedBuilder()
				.setColor("Red")
				.setTitle(
					"The Hypixel API Is Lagging\nAverage Response Time: " +
						mean.toString()
				),
		],
	};
	sendMessage(users, message);
}

function sendIncidents(users, incidents) {
	let message = {
		embeds: incidents.map((incident) => {
			return new EmbedBuilder()
				.setColor("Orange")
				.setTitle("New Hypixel Incident, Potential Server Lag").setDescription(`
				Name: ${incident.name}
				Impact: ${incident.impact}
				Status: ${incident.status}
			 `);
		}),
	};
	sendMessage(users, message);
}

async function getIncidents() {
	let url = "https://status.hypixel.net/api/v2/incidents/unresolved.json";
	return await fetch(url)
		.then((res) => res.json())
		.then((data) => {
			let incidents = [];
			data.incidents.forEach((element) => {
				let inc = { name: element.name, impact: element.impact };
				if (element.components && element.components.length > 0) {
					inc.status = element.components[0].status;
				}
				incidents.push(inc);
			});
			return incidents;
		});
}

async function sendMessage(users, message) {
	users.forEach(async (user) => {
		try {
			await user.send(message);
		} catch (error) {
			if (error.code === 50007) {
				console.log(`Unable to send message to ${user.username}`);
			} else {
				console.error(error);
			}
		}
	});
}
/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
const log = (string, style) => {
	const styles = {
		info: { prefix: chalk.blue("[INFO]"), logFunction: console.log },
		err: { prefix: chalk.red("[ERROR]"), logFunction: console.error },
		warn: { prefix: chalk.yellow("[WARNING]"), logFunction: console.warn },
		done: { prefix: chalk.green("[SUCCESS]"), logFunction: console.log },
	};

	const selectedStyle = styles[style] || { logFunction: console.log };
	selectedStyle.logFunction(`${selectedStyle.prefix || ""} ${string}`);
};

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (time, style) => {
	return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ""}>`;
};

/**
 * Whenever a string is a valid snowflake (for Discord).

 * @param {string} id 
 * @returns {boolean}
 */
const isSnowflake = (id) => {
	return /^\d+$/.test(id);
};

module.exports = {
	log,
	time,
	isSnowflake,
	getIncidents,
	sendMessage,
	sendIncidents,
	getAPIMeanResponseTime,
	sendAPITime,
};
