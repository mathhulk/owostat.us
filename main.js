const request = require("request");
const system = require("fs");

const Express = require("express");
const express = Express( );

const configuration = JSON.parse(system.readFileSync("storage/configuration.json"), "utf8");

let material = { };

function getDomains( ) {
	request("https://whats-th.is/public-cdn-domains.txt", function(error, response, data) {
		if(error) console.log(error);
		
		material.domains = { };
		
		data.split("\n").forEach(function(value, index) {
			if(isDomain(value)) getDomain(parseDomain(value, false));
		});
	});	
}

function getDomain(domain) {
	request("https://" + domain, function(error, response, data) {
		material.domains[parseDomain(domain, true)] = { };
		
		if(error) material.domains[parseDomain(domain, true)].online = false;
		else material.domains[parseDomain(domain, true)].online = response && response.statusCode === 200;
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
		material.services[service] = {href: configuration.services[service].href, description: configuration.services[service].description};
		
		if(error) material.services[service].online = false;
		else material.services[service].online = response && response.statusCode === configuration.services[service].code;
	});
}

function getServices( ) {
	material.services = { };
	
	for(let service in configuration.services) getService(service, configuration.services[service].uri, configuration.services[service].method, configuration.services[service].code);
}

function getMaterial( ) {
	getDomains( );
	getServices( );
	
	setTimeout(getMaterial, 60 * 1000 * 10);
}

getMaterial( );

express.use(Express.static(__dirname + "/public"));

express.get("/", (request, response) => {
	response.sendFile(__dirname + "/public/index.html");
});

express.get("/status", (request, response) => {
	response.json(material);
});

express.listen(8999);

console.log("Listening on port 8999.");
