const path = require('path');
const {writeFileSync, readFileSync} = require('fs');

const {Octokit} = require('@octokit/rest');
const fetch = require('node-fetch');

// GitHub Gists env variables
const {
	GIST_ID,
	GITHUB_TOKEN
} = process.env;

// 'download' || 'upload'
const CHOICE = process.argv[2];

const LOCAL_FILE_PATH = path.join(__dirname, 'data.json');
const REMOTE_FILE_NAME = 'lastfm-top-artists.json';

const download = async octokit => {
	const gist = await octokit.gists.get({ gist_id: GIST_ID }); // get the gist
	const {content} = gist.data.files.REMOTE_FILE_NAME;
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
