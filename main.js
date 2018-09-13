// VARIABLES
const request = require("request");
const fs = require("fs");
const Express = require("express");
const express = Express( );

const configuration = JSON.parse(fs.readFileSync("storage/configuration.json"), "utf8");
var templates = { }, status = { };

// FUNCTIONS
function getDomains( ) {
	request("https://whats-th.is/public-cdn-domains.txt", function(error, response, data) {
		if(error) console.log(error);
		
		status.domains = { };
		
		data.split("\n").forEach(function(value, index) {
			if(isDomain(value)) getDomain(parseDomain(value, false));
		});
	});	
}

function getDomain(domain) {
	request("https://" + domain, function(error, response, data) {
		status.domains[parseDomain(domain, true)] = { };
		
		if(error) status.domains[parseDomain(domain, true)].online = false;
		else status.domains[parseDomain(domain, true)].online = response && response.statusCode === 200;
	});
}

function isDomain(string) {
	return !(string === "" || string.substring(0, 1) === "#" || string.includes(":"));
}

function parseDomain(domain, reverse) {
	return reverse ? domain.replace("wildcard.", "*.") : domain.replace("*.", "wildcard.");
}

function getService(service) {
	request(configuration.services[service].uri, configuration.services[service].method, function(error, response, data) {
		status.services[service] = {href: configuration.services[service].href, description: configuration.services[service].description};
		
		if(error) status.services[service].online = false;
		else status.services[service].online = response && response.statusCode === configuration.services[service].code;
	});
}

function getServices( ) {
	status.services = { };
	
	for(let service in configuration.services) {
		getService(service, configuration.services[service].uri, configuration.services[service].method, configuration.services[service].code);
	}
}

function loadStatus( ) {
	getDomains( );
	getServices( );
}

// LOAD
loadStatus( );
setInterval(function( ) {
	fs.writeFile("public/status.json", JSON.stringify(status), function(error) {
		if(error) console.log(error);
	});
	
	loadStatus( );
}, 60 * 1000 * 10);

// EXPRESS
express.use(Express.static(__dirname + "/public"));

express.get("/", (request, response) => {
	response.sendFile(__dirname + "/public/index.html");
});

express.get("/status", (request, response) => {
	response.sendFile(__dirname + "/public/status.json");
});

express.listen(8999);
