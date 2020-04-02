const Octokit = require('@octokit/rest');
const fetch = require('node-fetch');

// GitHub Gists env variables
const {
	GIST_ID,
	GITHUB_TOKEN
} = process.env;

// 'download' || 'upload'
const CHOICE = process.argv[2];


const download = async octokit => {
	const gist = await octokit.gists.get({ gist_id: GIST_ID }); // get the gist
	
}

const upload = async octokit => {

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
})()
