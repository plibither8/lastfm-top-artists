const path = require('path');
const {writeFileSync, readFileSync} = require('fs');

const fetch = require('node-fetch');

// GitHub Gists env variables
const {
	GIST_ID,
	GITHUB_TOKEN
} = process.env;

// 'download' || 'upload'
const CHOICE = process.argv[2];

const GH_API_URL = 'https://api.github.com/gists/' + GIST_ID;

// stupid config for keeping things simple
const localFileNames = {
	'lastfm-top-artists.json': 'data.json',
	'unique-artists.json': 'artists.json'
};

const getFetchOptions = (method, authString, body) => {
	const base64AuthString = Buffer.from(authString).toString('base64');
	return {
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + base64AuthString
		},
		...(body ? {body: JSON.stringify(body)} : {})
	}
}

const download = async () => {
	const gist = await fetch(
		GH_API_URL,
		getFetchOptions('GET', GITHUB_TOKEN)
	).then(res => res.json());

	for (const [fileName, file] of Object.entries(gist.files)) {
		const filePath = path.join(__dirname, '../', localFileNames[fileName]);
		writeFileSync(filePath, file.content);
	}
}

const upload = async () => {
	const files = {};
	for (const [remote, local] of Object.entries(localFileNames)) {
		const filePath = path.join(__dirname, '../', local);
		const content = readFileSync(filePath, 'utf-8');
		files[remote] = {
			filename: remote,
			content
		};
	}

	await fetch(
		GH_API_URL,
		getFetchOptions('PATCH', GITHUB_TOKEN, {files})
	);
}

(async () => {
	switch (CHOICE) {
		case 'download':
			await download();
			break;
		case 'upload':
			await upload();
			break;
	}
})();
