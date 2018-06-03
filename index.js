//
//	VARIABLES
//
const request = require("request");
const path = require("path");
const fs = require("fs");
const Express = require("express");
const express = Express();

const SERVICES = require("./configuration/services.js");

var website = {"/status": {services: {}, domains: {}}}, timeout;

//
//	FUNCTIONS
//
function generatePage() {
	fs.readFile(path.join(__dirname, "templates", "index.html"), "utf8", function(error, index) {
		if(error) console.log(error);
		fs.readFile(path.join(__dirname, "templates", "status.html"), "utf8", function(error, status) {
			if(error) console.log(error);
			var services = "", domains = "";
			for(var service in website["/status"].services) services += status.replace("{{ name }}", service).replace("{{ status }}", website["/status"].services[service]);
			for(var domain in website["/status"].domains) domains += status.replace("{{ name }}", domain).replace("{{ status }}", website["/status"].domains[domain]);
			website["/"] = index.replace("{{ services }}", services).replace("{{ domains }}", domains);
		});
	});
}

function getService(uri, name, method, code) {
	request(uri, method, function(error, response, data) {
		if(error) website["/status"].domains[cleanDomain(domain, true)] = false;
		else website["/status"].services[name] = response && response.statusCode === code;
	});
}

function getServices() {
	for(var service in SERVICES) getService(SERVICES[service].uri, SERVICES[service].name, SERVICES[service].method, SERVICES[service].code);
}

function getDomain(domain) {
	request("https://" + domain + "/1e661d", function(error, response, data) {
		if(error) website["/status"].domains[cleanDomain(domain, true)] = false;
		else website["/status"].domains[cleanDomain(domain, true)] = response && response.statusCode === 200;
	});
}

function getDomains() {
	request("https://whats-th.is/public-cdn-domains.txt", function(error, response, data) {
		if(error) console.log(error);
		data = data.split("\n");
		for(var domain in website["/status"].domains) if(!data.includes(domain)) delete website["/status"].domains[domain];
		data.forEach(function(line, index) {
			if(isDomain(line)) getDomain(cleanDomain(line, false));
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

function initialize() {
	getDomains();
	getServices();
	generatePage();
	
	timeout = setTimeout(initialize, 5000)
}

//
//	EXPRESS
//
initialize();

express.use(Express.static(path.join(__dirname, "public")));

express.get("/", (req, res) => {
	res.send(website["/"]);
});

express.get("/status", (req, res) => {
	res.json(website["/status"]);
});

express.listen(8999);