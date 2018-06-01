// internal variables
const axios = require("axios");
const path = require("path");
const Express = require("express");
const express = Express();

const READ = "https://whats-th.is/public-cdn-domains.txt", TEST = "1e661d";

var status = {};

// functions
function validateDomain(domain) {
	return !(domain === "" || domain.substring(0, 1) === "#" || domain.includes(":"));
}

async function getDomains(uri, file) {
	var domains;
	
	try {
		domains = await axios.get(uri);
		
		domains = domains.data.split("\n");
	} catch(error) {
		console.log(error);
	}
	
	for(var i = 0; i < domains.length; i++) {
		if(validateDomain(domains[i])) status[domains[i]] = "unknown";
	}
	
	for(var i = 0; i < domains.length; i++) {
		if(validateDomain(domains[i])) {
			try {
				await axios.get("https://" + domains[i].replace("*", "example") + "/" + file);
				
				status[domains[i]] = "good";
			} catch (error) {
				status[domains[i]] = "bad";
			}
		}
	}
	
	setTimeout(getDomains, 1000 * 60 * 5, uri, file);
}

// express webserver
getDomains(READ, TEST);

express.use(Express.static(path.join(__dirname, "public")));

express.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

express.get("/status", (req, res) => {
	res.json(status);
});

express.listen(8999);