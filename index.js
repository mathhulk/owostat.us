/*
 *	VARIABLES
 */
const request = require("request");
const path = require("path");
const fs = require("fs");
const Express = require("express");
const express = Express();

const configuration = {services: JSON.parse(fs.readFileSync(path.join(__dirname, "configuration", "services.json"), "utf8"))};
const template = {index: fs.readFileSync(path.join(__dirname, "templates", "index.html"), "utf8"), status: fs.readFileSync(path.join(__dirname, "templates", "status.html"), "utf8")};

var page = {"/status": {services: { }, domains: { }}};

/*
 *	FUNCTIONS
 */
function generate() {
	var services = "", domains = "";
	for(var service in page["/status"].services) services += template.status.replace("{{ name }}", service).replace("{{ status }}", page["/status"].services[service]);
	for(var domain in page["/status"].domains) domains += template.status.replace("{{ name }}", domain).replace("{{ status }}", page["/status"].domains[domain]);
	page["/"] = template.index.replace("{{ services }}", services).replace("{{ domains }}", domains);
}

function getService(uri, name, method, code) {
	request(uri, method, function(error, response, data) {
		if(error) page["/status"].domains[cleanDomain(domain, true)] = false;
		else page["/status"].services[name] = response && response.statusCode === code;
	});
}
function getServices() {
	for(var service in configuration.services) getService(configuration.services[service].uri, configuration.services[service].name, configuration.services[service].method, configuration.services[service].code);
}

function getDomain(domain) {
	request("https://" + domain + "/1e661d", function(error, response, data) {
		if(error) page["/status"].domains[cleanDomain(domain, true)] = false;
		else page["/status"].domains[cleanDomain(domain, true)] = response && response.statusCode === 200;
	});
}
function getDomains() {
	request("https://whats-th.is/public-cdn-domains.txt", function(error, response, data) {
		if(error) console.log(error);
		data = data.split("\n");
		for(var domain in page["/status"].domains) if(!data.includes(domain)) delete page["/status"].domains[domain];
		data.forEach(function(line, index) {
			if(isDomain(line)) getDomain(cleanDomain(line, false));
		});
	});
}
function isDomain(line) {
	return !(line === "" || line.substring(0, 1) === "#" || line.includes(":"));
}
function cleanDomain(domain, reverse) {
	return reverse ? domain.replace("wildcard.", "*.") : domain.replace("*.", "wildcard.");
}

function initialize() {
	getDomains();
	getServices();
	generate();
}

/*
 *	EXPRESS
 */
express.use(Express.static(path.join(__dirname, "public")));
express.get("/", (req, res) => {
	res.send(page["/"]);
});
express.get("/status", (req, res) => {
	res.json(page["/status"]);
});
express.listen(8999);

/*
 *	LOAD
 */
setInterval(initialize, 5000);