const { getAPIMeanResponseTime, log } = require("./functions");

getAPIMeanResponseTime().then((mean) => log(mean, "info"));
