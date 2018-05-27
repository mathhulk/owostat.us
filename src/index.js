const axios = require('axios');
const express = require('express');
const path = require('path');
const constants = require('./constants');

const status = {};

function statusChange(url, newStatus) {
  const oldStatus = status[url] || 'unknown';
  if(oldStatus != newStatus) console.log(`[${newStatus === 'bad' ? 'WARN' : 'INFO'}] ${url} changed from status ${oldStatus} to ${newStatus}`);
  status[url] = newStatus;
}

async function checkDomains() {
  for(let url of Object.keys(status)) {
    try {
      await axios.get(`https://${url}/${constants.testFile}`);

      // It works
      statusChange(url, 'good');
    } catch(err) {
      statusChange(url, 'bad');
    }
  }
}

axios.get(constants.domainListUrl).then(resp => {
  // Parse domain list
  for(let line of resp.data.split('\n')) {
    if(line.startsWith('#')) continue;
    if(line === '') continue;
    if(line.includes(':')) continue;

    let url = line.replace('*', 'wildcard');

    status[url] = 'unknown';
  }

  // Check domains
  checkDomains().then(r => {
    console.log('[INFO] Initial check ran, checking domains every 5 minutes');

    setInterval(() => {
      checkDomains();
    }, 300000);
  })
});

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/status', (req, res) => {
  res.json(status);
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(8999);