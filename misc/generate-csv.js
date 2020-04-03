const path = require('path');
const {writeFileSync} = require('fs');

const data = require('../data.json').list;

const csvFile = path.join(__dirname, '../data.csv');
const entries = ['date,name,category,value'];

for (const [date, list] of Object.entries(data)) {
	for (const [artist, scrobbles] of Object.entries(list)) {
		const entry = [date, artist,, scrobbles].join(',');
		entries.push(entry);
	}
}

writeFileSync(csvFile, entries.join('\n'));
