const { EmbedBuilder } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient");
const { get } = require("mongoose");
const {
	log,
	getIncidents,
	sendMessage,
	sendIncidents,
	getAPIResponseTimes,
	sendAPITime,
} = require("../../functions");

const listeners = [
	"152407837069279232", // Roni
	"223031292579545088", // Faris
];

module.exports = {
	event: "ready",
	once: true,
	/**
	 *
	 * @param {ExtendedClient} _
	 * @param {import('discord.js').Client<true>} client
	 * @returns
	 */
	run: async (_, /** @type {import('discord.js').Client<true>} */ client) => {
		log("Logged in as: " + client.user.tag, "done");
		let users = await Promise.all(
			listeners.map((id) => client.users.fetch(id))
		);
		let incidentsLengthState = 0;
		let APITimeMessageSent = false;

		setInterval(async () => {
			let incidents = await getIncidents(); // Fetch list of ongoing incidents from the hypixel API
			if (incidentsLengthState != incidents.length) {
				// Only send the incident report ONCE, unless new incidents are added / removed.
				incidentsLengthState = incidents.length;
				sendIncidents(users, incidents);
				console.log("New number of incidents: ", incidents.length);
			}

			let { time, highTimes } = await getAPIResponseTimes();
			console.log(
				`[${new Date(time)}] Highest response times: ${
					highTimes.length > 0
						? highTimes
						: "No responses with delay more than 300ms"
				}`
			);
			if (highTimes.length > 25 && !APITimeMessageSent) {
				// Only send message if there are at least 25 responses with over 500ms delay
				let highestResponseTime = Math.max(...highTimes);
				console.log("Highest time: ", highestResponseTime);
				sendAPITime(users, highestResponseTime);
				APITimeMessageSent = true; // Only send the message if it has not been sent in the past ex: 10 mins (prevents spamming)
			}
		}, 5 * 1000); // 30 seconds

		setInterval(async () => {
			APITimeMessageSent = false;
		}, 5 * 60 * 1000); // 5 minutes => How often the API lag message should get sent if the server is lagging.
	},
};
