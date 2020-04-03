const {writeFileSync} = require('fs');
const path = require('path');
const fetch = require('node-fetch')

const rawData = require('../data.json').list;
const artistsData = require('../artists.json');

const {
	LASTFM_KEY,
	SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET
} = process.env;

let SPOTIFY_ACCESS_TOKEN;

const getSpotifyAccessToken = async () => {
	const authorization = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
	const accessToken =
		await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + authorization
			},
			body: 'grant_type=client_credentials'
		})
		.then(res => res.json())
		.then(res => res.access_token);

	console.log('done: spotify access token');
	return accessToken;
}

async function getArtistGenre(artistName) {
	const API_ENDPOINT =
		'http://ws.audioscrobbler.com/2.0/?format=json&method=artist.getinfo' +
		'&artist=' + encodeURIComponent(artistName) +
		'&api_key=' + LASTFM_KEY;

	const data = await fetch(API_ENDPOINT).then(res => res.json());

	if (
		!data.artist ||
		data.artist.tags.tag.length == 0
	) return '';

	return data.artist.tags.tag[0].name;
}

async function getArtistImage(artistName) {
	const searchUrl =
		'https://api.spotify.com/v1/search?type=artist&q=' +
		encodeURIComponent(artistName);
	const searchResults = await fetch(searchUrl, {
		headers: {
			'Authorization': 'Bearer ' + SPOTIFY_ACCESS_TOKEN
		}
	}).then(res => res.json());
	const artist = searchResults.artists.items[0];

	// Default to that Last.fm star
	if (!artist) return 'https://lastfm.freetls.fastly.net/i/u/174s/2a96cbd8b46e442fc41c2b86b821562f.png';

	const artistImage = artist.images[2].url // 64x64
	return artistImage;
}

const main = async () => {
	SPOTIFY_ACCESS_TOKEN = await getSpotifyAccessToken();
	const filePath = path.join(__dirname, '../artists.json');

	// Fancy way to get all unique artists from the data
	const allArtists = [...new Set(Object.values(rawData).map(list => Object.keys(list)).flat())];
	const newArtists = allArtists.filter(artist => !(artist in artistsData));

	for (const artist of newArtists) {
		artistsData[artist] = {
			genre: await getArtistGenre(artist),
			image: await getArtistImage(artist)
		};

		console.log('done:', artist);
	}

	writeFileSync(filePath, JSON.stringify(artistsData, null, '  '));
}

(async () => await main())();
