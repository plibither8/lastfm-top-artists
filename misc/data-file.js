const path = require('path');
const {writeFileSync, readFileSync} = require('fs');

const {Octokit} = require('@octokit/rest');
const fetch = require('node-fetch');

// GitHub Gists env variables
const {
	GIST_ID,
	GITHUB_TOKEN
} = process.env;

// stupid config for keeping things simple
const localFileNames = {
	'lastfm-top-artists.json': 'data.json',
	'unique-artists.json': 'artists.json'
};

// 'download' || 'upload'
const CHOICE = process.argv[2];

// 'lastfm-top-artists.json' || 'unique-artists.json'
const REMOTE_FILE_NAME = process.argv[3];
const LOCAL_FILE_NAME = localFileNames[REMOTE_FILE_NAME];
const LOCAL_FILE_PATH = path.join(__dirname, '../', LOCAL_FILE_NAME);

const download = async octokit => {
	const gist = await octokit.gists.get({ gist_id: GIST_ID }); // get the gist
	const {content} = gist.data.files[REMOTE_FILE_NAME];
	writeFileSync(LOCAL_FILE_PATH, content);
}

const upload = async octokit => {
	const content = readFileSync(LOCAL_FILE_PATH, 'utf-8');
	await octokit.gists.update({
		gist_id: GIST_ID,
		files: {
			[REMOTE_FILE_NAME]: {
				filename: REMOTE_FILE_NAME,
				content
			}
		}
	});
}

(async () => {
	const octokit = new Octokit({ auth: `token ${GITHUB_TOKEN}` }) // Instantiate Octokit

	switch (CHOICE) {
		case 'download':
			await download(octokit);
			break;
		case 'upload':
			await upload(octokit);
			break;
	}
})();
