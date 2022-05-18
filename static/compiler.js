var fs = require('fs')

const root = '/home/runner/Cyclone-Official/'

function GamesDict(){
	let gsdir = root+'assets/games'
	let gfiles = fs.readdirSync(gsdir)
	var GAMES = {}
	
	gfiles.forEach(gameDirctory => {
		var logo = '/assets/games/'+gameDirctory+'/favicon.ico'

		var dict = {
			"Name": gameDirctory,
			"Logo_Src": logo
		}
		GAMES[gameDirctory] = dict
	})
	
	return GAMES
}

function compile(){
	var games = GamesDict()
	var basefile = fs.readFileSync(root+'views/games.html').toString()
	var html = ""

	for (var i = 0; i < Object.entries(games).length; i++){
		var dict = Object.entries(games)
		console.log(dict)
		var name = dict.Name
		var src = dict["Logo_Src"]

		var htm = `<div class="Game">
	<a>${name}<img src="${src}" width="75px" /></a>
</div>`
		html += htm
	}

	basefile = basefile.replace('<!--Games-->',html)
	console.log(html)
	//fs.writeFileSync(root+'views/games.html',basefile)
}

