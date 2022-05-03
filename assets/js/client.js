let pth = location.href.split(location.origin)[1]
let dloc = pth.substr(pth.indexOf("/", pth.indexOf("/") + 1)+1,pth.length)

const PREFIX = pth.substr(0,pth.indexOf("/", pth.indexOf("/") + 1)+1)
try {
	var URLMAP = new URL(dloc)
} catch {
	var URLMAP = new URL('https://'+dloc)
}

class Rewriting {
  constructor(url) {
		try {
			this.url = new URL(url)
		} catch {
			this.url = new URL('https://'+url)
		}
		this.prefix = PREFIX+'/'
  }
	
	rewriteUrl(url){
		let rewritten;

		if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//')){
			rewritten = url
		} else {
			if (url == "/"){
				rewritten = this.url.host
			} else{
				if (url.startsWith('/')){
					rewritten = this.url.host + url
				} else {
					rewritten = this.url.host + "/" + url
				}
			}
	 	}

		if (!url.startsWith('data:')){
			return this.prefix + rewritten
		} else {
			return url
		}
	}
	
	rewriteDoc(){
		//Main Rewriting
		let tags = document.querySelectorAll('*')
		
		for (var i = 0; i < tags.length; i++){
			var tag = tags[i]
			
			//Dict of possible attributes
			let attrs = {
				"href": tag.getAttribute('href'),
				"src": tag.getAttribute('src'),
				"action": tag.getAttribute('action'),
			}
			let checked = tag.getAttribute("checked")

			//Rewriting & Setting Of Attributes
			if (checked == "false"){
				if (attrs.href){
					if (!attrs.href.startsWith(this.prefix)){
						let rewrite = this.rewriteUrl(attrs.href)
						tag.setAttribute('href',rewrite)
					}
				}
				if (attrs.src){
					if (!attrs.src.startsWith(this.prefix)){
						let rewrite = this.rewriteUrl(attrs.src)
						tag.setAttribute('src',rewrite)
					}
				}
				if (attrs.action){
					if (!attrs.action.startsWith(this.prefix)){
						let rewrite = this.rewriteUrl(attrs.action)
						tag.setAttribute('action',rewrite)
					}
				}
				tag.setAttribute('checked','true')
			}
		}
	}
}

function update(){
	let rewriter = new Rewriting(dloc)
	rewriter.rewriteDoc()
}

window.setInterval(function(){
	update()
},1000)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/assets/js/sw.js',{
		scope: PREFIX
	})
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}