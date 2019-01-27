const request = require("request");
const path = require("path");
const system = require("fs");

const Express = require("express");
const express = Express( );

const services = JSON.parse( system.readFileSync(path.join(__dirname, "resources", "services.json"), "utf8") );

let domains;
let api;
let page;

function isDomain(string) {
	return ! ( string.length === 0 || string.substring(0, 1) === "#" || string.includes(":") );
}

function convertWildcardDomain(domain) {
	return domain.replace("*.", "wildcard.");
}

function fetchDomainList(callback) {
	request("https://whats-th.is/public-cdn-domains.txt", function(error, response, data) {
		if(error) console.log(error);
		
		domains = [ ];
		
		data.split("\n").forEach(function(value) {
			if( isDomain(value) ) domains.push(value);
		});
		
		callback( );
	});
}

function checkServices(index, callback) {
	request({url: services[index].url, method: services[index].method, timeout: 1000}, function(error, response, data) {
		api.services[services[index].name] = {url: services[index].url, name: services[index].name, href: services[index].href, description: services[index].description};
		
		if(error) api.services[services[index].name].online = false;
		else api.services[services[index].name].online = response && response.statusCode === services[index].code;
		
		if(index === services.length - 1) callback( );
		else checkServices(index + 1, callback);
	});
}

function checkDomains(index, callback) {
	request({url: "https://" + convertWildcardDomain(domains[index]), timeout: 1000}, function(error, response, data) {
		api.domains[ domains[index] ] = { };
		
		if(error) api.domains[ domains[index] ].online = false;
		else api.domains[ domains[index] ].online = response && response.statusCode === 200;
		
		if(index === domains.length - 1) callback( );
		else checkDomains(index + 1, callback);
	});
}

function initialize( ) {
	api = { services: { }, domains: { } };
	
	fetchDomainList(function( ) {
		checkServices(0, function( ) {
			checkDomains(0, function( ) {
				page = api;
				
				setTimeout(initialize, 5000);
			});
		});
	});
}

express.use( Express.static( path.join(__dirname, "public") ) );

express.get("/", function(request, response) {
	response.sendFile( path.join(__dirname, "public", "index.html") );
});

express.get("/api", function(request, response) {
	response.json(page);
});

express.listen(8999);
console.log("Listening on port 8999.");
initialize( );
