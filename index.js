const path = require('path');
const {writeFileSync} = require('fs');

const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Update this before running the script!
const CONFIG = {
	username: process.argv[2] || 'plibither8',
	frequency: Number(process.argv[3] || 7),
	prettyPrint: true,
	writeInLoop: true
};

const TOP_ARTISTS_URL = `https://www.last.fm/user/${CONFIG.username}/library/artists`;

// Preparing main data object
let data;
try {
	data = require('./data.json');

	// If we want data of a new user
	if (data.username !== CONFIG.username) throw 'New user';
} catch (err) {
	data = {
		username: CONFIG.username,
		lastUpdated: '',
		irregularLastDate: false,
		list: {}
	}
}

// Quick shorthand function to get raw HTML from URL
const getHtml = async url => await fetch(url).then(res => res.text());

const getFirstDate = async () => {
	const html = await getHtml(TOP_ARTISTS_URL);
	const $ = cheerio.load(html);
	const firstDate = $('#id_from').val();
	return firstDate;
}

const getLastUpdatedDate = firstDate => {
	if (data.lastUpdated === '') {
		return firstDate;
	}

	const dates = Object.keys(data.list).sort();

	// Last entry was not added from outside the while loop
	if (!data.irregularLastDate) return dates.pop();

	// It was...
	const irregularDate = dates.pop();
	delete data.list[irregularDate];

	// If there are still more items in the list
	if (data.list.length > 0) return dates.pop();

	// Else
	return firstDate;
}

const buildDateString = date => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return [year, month, day]
		.map(num => num.toString().padStart(2, 0))
		.join('-');
}

const datePlusOne = date => {
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

const nextDate = date => {
	let x = CONFIG.frequency;
	while (x-- > 0) {
		date = datePlusOne(date);
	}

	return date;
}

const buildUrl = (firstDate, endDate) => {
	return `${TOP_ARTISTS_URL}?from=${firstDate}&to=${endDate}`;
}

const updateList = async (firstDate, currentDate) => {
	const FINAL_URL = buildUrl(firstDate, currentDate);
	const html = await getHtml(FINAL_URL);
	const $ = cheerio.load(html);
	const dayList = {};

	const rows = $('tr.chartlist-row').slice(0, 50);
	rows.each((i, row) => {
		const name = $(row).find('td.chartlist-name').text().trim();
		const scrobbles = Number($(row).find('td.chartlist-bar').text().trim().split(' ')[0].replace(',', ''));

		dayList[name] = scrobbles;
	});

	// Don't store for initial dates where no artists appear
	if (Object.keys(dayList).length > 0) {
		data.list[currentDate] = dayList;
		data.lastUpdated = currentDate;
	}

	// Write to console
	console.info('done:', currentDate);
}

const writeData = () => {
	const dataFile = path.join(__dirname, 'data.json');
	writeFileSync(dataFile, JSON.stringify(data, null, CONFIG.prettyPrint ? '  ' : null));
}

const main = async () => {
	const firstDate = await getFirstDate();
	const lastUpdatedDate = getLastUpdatedDate(firstDate);
	const todayDate = buildDateString(new Date());
	const tomorrowDate = datePlusOne(todayDate);
	let currentDate = nextDate(lastUpdatedDate);

	while (currentDate < tomorrowDate) {
		await updateList(firstDate, currentDate);
		currentDate = nextDate(currentDate);

		if (CONFIG.writeInLoop) writeData();
	}

	if (currentDate < nextDate(todayDate)) {
		await updateList(firstDate, todayDate);
		data.irregularLastDate = true;
	} else {
		data.irregularLastDate = false;
	}

	writeData();
}

(async () => await main())();
