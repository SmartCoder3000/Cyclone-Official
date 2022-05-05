const r = require("link-checker-malicious");

const BlockedCatagories = ['true','false','false','false','true','false','false']
const BlockedSites = ['netflix.com','accounts.google.com']

function detectCatagory(link) {
	try {
		var url = new URL(link)
	} catch {
		var url = new URL('https://'+link)
	}
	const cam = r.is_cam(link)
	const dating = r.is_dating(link);
	const gambling = r.is_gambling(link);
	const pirated = r.is_pirated(link);
	const ip = r.is_ip_grabber(link);
	const nsfw = r.is_nsfw(link);
	const scam = r.is_scam(link);
	const uncatogorized = r.is_unk(link);

	if (nsfw | dating | cam | BlockedSites.includes(url.hostname)){
		this.blocked = true
	} else {
		this.blocked = false
	}
	if (nsfw){
		this.cat = 'NSFW'
	}
	if (dating){
		this.cat = 'DATING'
	}
	if (cam){
		this.cat = 'CAM SITES'
	}
	if (BlockedSites.includes(url.hostname)){
		this.cat = url.hostname
	}
	return this
}

function filter(req, res, next) {
	var url = req.originalUrl.split('/service')

	res.set('Service-Worker-Allowed','true')
	
	if (url.length === 2) {
		url = url[1]
		url = url.substr(1, url.length)

		if (detectCatagory(url).blocked){
			res.send(`<body style="font-size: 30px; font-family: Sans-Serif; background-color: skyblue;"><center><h1 style="color: blue">Blocked!</h1><p style="color: blue">Looks Like ${url} Is Blocked!</p></center>`)
		} else {
			next()
		}
		
	} else {
		next()
	}
}

module.exports = { filter }