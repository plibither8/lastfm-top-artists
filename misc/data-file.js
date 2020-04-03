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

const download = async octokit => {
	const gist = await octokit.gists.get({ gist_id: GIST_ID });
	for (const [fileName, file] of Object.entries(gist.data.files)) {
		const filePath = path.join(__dirname, '../', localFileNames[fileName]);
		writeFileSync(filePath, file.content);
	}
}

const upload = async octokit => {
	const files = {};
	for (const [remote, local] of Object.entries(localFileNames)) {
		const filePath = path.join(__dirname, '../', local);
		const content = readFileSync(filePath, 'utf-8');
		files[remote] = {
			filename: remote,
			content
		};
	}

	await octokit.gists.update({
		gist_id: GIST_ID,
		files
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
