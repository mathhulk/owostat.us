//
//	VARIABLES
//
const request = require("request");
const path = require("path");
const Express = require("express");
const express = Express();

const DOMAINS = "https://whats-th.is/public-cdn-domains.txt", FILE = "1e661d";
const SERVICES = {
	api: {
		uri: "https://api.awau.moe/health",
		name: "API",
		method: "GET",
		code: 401
	},
	gitlab: {
		uri: "https://owo.codes/help",
		name: "GitLab",
		method: "HEAD",
		code: 200
	},
	mastadon: {
		uri: "https://uwu.social/about",
		name: "Mastadon",
		method: "HEAD",
		code: 200
	},
	matrix: {
		uri: "https://yuri.im/_matrix/federation/v1",
		name: "Matrix",
		method: "HEAD",
		code: 400
	}
};

var status = {services: {}, domains: {}}, timeout;

//
//	FUNCTIONS
//
function getService(uri, name, method, code) {
	request(uri, method, function(error, response, data) {
		if(error) status.domains[cleanDomain(domain, true)] = false;
		else status.services[name] = response && response.statusCode === code;
	});
}

function getServices(list) {
	for(var service in list) getService(list[service].uri, list[service].name, list[service].method, list[service].code);
}

function getDomain(domain, file) {
	request("https://" + domain + "/" + file, function(error, response, data) {
		if(error) status.domains[cleanDomain(domain, true)] = false;
		else status.domains[cleanDomain(domain, true)] = response && response.statusCode === 200;
	});
}

function getDomains(uri, file) {
	request(uri, function(error, response, data) {
		if(error) console.log(error);
		data = data.split("\n");
		for(var domain in status.domains) if(!data.includes(domain)) delete status.domains[domain];
		data.forEach(function(line, index) {
			if(isDomain(line)) getDomain(cleanDomain(line, false), file);
		});
	});
}

function isDomain(line) {
	return !(line === "" || line.substring(0, 1) === "#" || line.includes(":"));
}

function cleanDomain(domain, reverse) {
	if(reverse) return domain.replace("wildcard.", "*.");
	return domain.replace("*.", "wildcard.");
}

function getStatus(list, uri, file) {
	getDomains(uri, file);
	getServices(list);
	
	timeout = setTimeout(getStatus, 5000, list, uri, file);
}

//
//	REQUEST
//
getStatus(SERVICES, DOMAINS, FILE);

express.use(Express.static(path.join(__dirname, "public")));

express.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

express.get("/status", (req, res) => {
	res.json(status);
});

express.listen(8999);