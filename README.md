# 📈 Last.fm Top Artists

> Collect user's top artists through time.

![Build Status](https://github.com/plibither8/lastfm-top-artists/workflows/Last.fm%20Top%20Artists%20Updater/badge.svg)

## What?

Collect a Last.fm user's [_all time_ top artists](https://last.fm/user/plibither8/library/artists) through all the dates from the time they started scrobbling till now (depending on the set frequency, default is set to `7`: a week).

[See mine](https://gist.github.com/plibither8/19e1bf4e5306fe95a8ca62400b07b6fe) (plibither8) for an example.

## Instructions

You must have Node.js and npm installed.

1. Install dependencies: `npm install`
1. Run the file with your username and desired frequency (optional): `node index <USERNAME> <FREQUENCY>`

To generate a CSV file of the data collected: `node misc/generate-csv`. Make sure the `data.json` file is there.

### GitHub Actions

To automate this and run it every day and store the data as GitHub Gist, I have enabled [GitHub Actions](.github/workflows/main.yml). It makes use of the [`misc/data-file.js`](misc/data-file.js) file. You can fork the repository and setup your own. Remember to set `GH_TOKEN` and `GIST_ID` environment secrets.

## License

[MIT](LICENSE)
