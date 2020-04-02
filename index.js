const path = require('path');
const {writeFileSync} = require('fs');

const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Update this before running the script!
const CONFIG = {
	username: process.argv[2],
	prettyPrint: true,
	writeInLoop: false
};

const TOP_ARTISTS_URL = `https://www.last.fm/user/${CONFIG.username}/library/artists`;

// Preparing main data object
let data;
try {
	data = require('./data.json');
} catch (err) {
	data = {
		lastUpdated: "",
		list: {}
	}
}

const getFirstDate = async () => {
	const html = await fetch(TOP_ARTISTS_URL).then(res => res.text());
	const $ = cheerio.load(html);
	const firstDate = $('#id_from').val();
	return firstDate;
}

const getLastUpdatedDate = firstDate => {
	if (data.lastUpdated === "") {
		return firstDate;
	}

	const dates = Object.keys(data.list);
	return dates.sort().pop();
}

const buildDateString = date => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return [year, month, day]
		.map(num => num.toString().padStart(2, 0))
		.join('-');
}

function nextDate(date) {
	const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	let [year, month, day] = date.split('-').map(Number);
	const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

	if (day < daysInMonth[month - 1] || month === 2 && isLeap && day === 28) {
		day++;
	} else if (month < 12) {
		day = 1;
		month++;
	} else {
		day = month = 1;
		year++;
	}

	return buildDateString(new Date(year, month - 1, day));
}

const buildUrl = (firstDate, endDate) => {
	return `${TOP_ARTISTS_URL}?from=${firstDate}&to=${endDate}`;
}

const getList = $ => {
	const dayList = {};

	const rows = $('tr.chartlist-row').slice(0, 50);
	rows.each((i, row) => {
		const name = $(row).find('td.chartlist-name').text().trim();
		const scrobbles = Number($(row).find('td.chartlist-bar').text().trim().split(' ')[0].replace(',', ''));

		dayList[name] = scrobbles;
	});

	return dayList;
}

const main = async () => {
	const dataFile = path.join(__dirname, 'data.json');

	const firstDate = await getFirstDate();
	const lastUpdatedDate = getLastUpdatedDate(firstDate);
	const todayDate = data.lastUpdated = buildDateString(new Date());

	let currentDate = nextDate(lastUpdatedDate);
	let previousDate = lastUpdatedDate;

	while (currentDate !== nextDate(todayDate)) {
		const FINAL_URL = buildUrl(firstDate, currentDate);
		const html = await fetch(FINAL_URL).then(res => res.text());
		data.list[currentDate] = getList(cheerio.load(html));

		console.info('done:', currentDate);
		writeFileSync(dataFile, JSON.stringify(data, null, CONFIG.prettyPrint ? '  ' : null));

		previousDate = currentDate;
		currentDate = nextDate(currentDate);
	}
}

(async () => await main())();
