const path = require('path');
const {writeFileSync} = require('fs');

const CONFIG = require('./config.json');

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const TOP_ARTISTS_URL = `https://www.last.fm/user/${CONFIG.username}/library/artists`;

const getStartDate = async () => {
	if (CONFIG.lastUpdated !== "") {
		return CONFIG.lastUpdated;
	}

	const html = await fetch(TOP_ARTISTS_URL).then(res => res.text());
	const $ = cheerio.load(html);
	const startDate = $('#id_from').val();
	return startDate;
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

const buildUrl = (startDate, endDate) => {
	return `${TOP_ARTISTS_URL}?from=${startDate}&to=${endDate}`;
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
	const list = require('./data.json');
	const filePath = path.join(__dirname, 'data.json');

	const startDate = await getStartDate();
	const todayDate = buildDateString(new Date());

	let currentDate = nextDate(startDate);
	while (currentDate !== nextDate(todayDate)) {
		const FINAL_URL = buildUrl(startDate, currentDate);
		const html = await fetch(FINAL_URL).then(res => res.text());
		list[currentDate] = getList(cheerio.load(html));

		console.info('done:', currentDate);
		writeFileSync(filePath, JSON.stringify(list, null, CONFIG.prettyPrint ? '  ' : null));

		currentDate = nextDate(currentDate);
	}
}

(async () => await main())();
