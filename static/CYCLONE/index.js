const { Worker, isMainThread } = require('worker_threads')
const fetch = require('node-fetch')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const WebSocket = require('ws')

const PREFIX = "/service"

class Rewriting {
	constructor(url) {
		try {
			this.url = new URL(url)
		} catch {
			this.url = new URL('https://' + url)
		}
		this.prefix = PREFIX + '/'
	}

	rewriteUrl(url) {
		let rewritten;
		if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//')) {
			rewritten = url
		} else {
			if (url == "/") {
				rewritten = this.url.host
			} else {
				if (url.startsWith('/')) {
					rewritten = this.url.host + url
				} else {
					rewritten = this.url.host + "/" + url
				}
			}
		}

		return this.prefix + rewritten
	}

	//This is for rewriting CSS
	rewriteCSS(tag) {
		let styles = this.window.getComputedStyle(tag)
		let _values = styles['_values']

		/*
		let i = 0;
		Object.keys(_values).forEach(x => {
			let prop = _values[x]
			let key = Object.keys(_values)[i]
	
			if (prop.includes("url(")){
				let start = prop.indexOf('url(')
				let end = prop.lastIndexOf(')')

				let url = prop.substr(start,end)
				console.log(url)
			}
			i++
		});
		*/

		let prop = styles.getPropertyValue('background-image')
		let name = "background-image"

		if (prop == "") {
			if (!styles.getPropertyValue('background') == "") {
				prop = styles.getPropertyValue('background')
				name = "background"
			}
		}
		if (prop.includes("url(")) {
			let start = prop.indexOf('url(') + 4
			let end = prop.indexOf(')') - 4

			let url = prop.substr(start, end)
			url = this.rewriteUrl(url)
			tag.style[name] = url
		}
	}
	
	rewriteSrcset(sample) {
		return sample.split(',').map(e => {
			return (e.split(' ').map(a => {
				if (a.startsWith('http') || (a.startsWith('/') && !a.startsWith(this.prefix))) {
					var url = this.rewriteUrl(a)
				}
				return a.replace(a, (url || a))
			}).join(' '))
		}).join(',')
	}
	
	rewriteDoc(html) {
		this.dom = new JSDOM(html)
		this.document = this.dom.window.document
		this.window = this.dom.window

		//Main Rewriting
		let tags = this.document.querySelectorAll('*')

		for (var i = 0; i < tags.length; i++) {
			var tag = tags[i]

			var type = tag.tagName.toLowerCase()
			//List of possible attributes
			var href = tag.getAttribute('href')
			var src = tag.getAttribute('src')
			var action = tag.getAttribute('action')
			var srcset = tag.getAttribute('srcset')
			//Rewriting & Setting Of Attributes

			tag.removeAttribute("integrity")

			if (href) {
				href = this.rewriteUrl(href)
				tag.setAttribute("href", href)
			}
			if (srcset) {
				srcset = this.rewriteSrcset(srcset)
				tag.setAttribute("srcset", srcset)
			}
			if (src) {
				src = this.rewriteUrl(src)
				tag.setAttribute("src", src)
			}
			if (action) {
				action = this.rewriteUrl(action)
				tag.setAttribute("action", action)
			}

			if (type === "script") {
				if (!src) {
					let script = tag.text
					script = this.rewriteJS(script)
					tag.text = script
				}
			}

			if (type === "iframe") {
				if (!src) {
					var content = (tag.contentWindow || tag.contentDocument);
					if (content.document) content = content.document;
					content.write(this.rewriteDoc(content))
					content.close()
				}
			}

			this.rewriteCSS(tag)
			tag.setAttribute("checked", 'false')
		}
		//Adding The Client Script
		this.document.head.innerHTML = "<script src='/assets/js/client.js' checked='true'></script>" + this.document.head.innerHTML

		return this.dom.serialize()
	}
	rewriteJS(script) {
		let js = script.replace('document.location', 'URLMAP')
		js = script.replace('window.location', 'URLMAP')
		js = script.replace('location', 'URLMAP')
		return js
	}
}

async function request(req, res, next) {
	if (req.originalUrl.startsWith(PREFIX)) {
		//The following script will force absolute url
		let start = PREFIX.length + 1
		let end = req.originalUrl.length
		let uri = req.originalUrl.substr(start, end)

		if (! (uri.startsWith('ws:/') | uri.startsWith('wss:/'))){
			uri = uri.replace('https://', '')
			uri = uri.replace('http://', '')
			uri = uri.replace('http://', '')
			uri = uri.replace('https:/', '')
			uri = uri.replace('http:/', '')
			uri = uri.replace('//', '')
			uri = 'https://' + uri
	
			//Make A Fetch Request
	
			//Set Headers
			let headers = {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36"
			}
			let options = {
				headers: headers
			}
			try {
				let resp = await fetch(uri, options)
	
				let rewriter = new Rewriting(uri)
				let content = resp.headers.get('content-type') || 'application/javascript'
	
				if (!content.includes('image')) {
					var doc = await resp.text()
				} else {
					var buf = await resp.buffer()
				}
	
				let html = "An Error Occured"
				if (content.includes('html')) {
					html = rewriter.rewriteDoc(doc)
				} else if (content.includes('javascript')) {
					html = rewriter.rewriteJS(doc)
				} else if (content.includes('image')) {
					html = buf
				} else {
					html = doc
				}
	
				res.set('Content-Type', content)
	
				res.send(html)
			} catch (e) {
				var name = e.name
				var message = e.message
	
				console.log({ e })
	
				res.send(`<body style="background:white;"><h1>${name}</h1><a>${message}</a></body>`)
			}
		} else if (uri.startsWith('ws:/') | uri.startsWith('wss:/')){
			var wss = new WebSocket(uri)
		
		  wss.onopen = (event) => {
		    wss.send();
		  };
		
		  wss.onmessage = function (event) {
		    res.send(event.data);
		  }
		
		  wss.onclose = function (event) {
		    wss.terminate();
		  };
		}
	} else {
		next()
	}
}

module.exports = {
	request
}