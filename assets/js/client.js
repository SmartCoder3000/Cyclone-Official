try{
	var _path_ = location.href.split(location.origin)[1]
	var dloc = _path_.substr(_path_.indexOf("/", _path_.indexOf("/") + 1)+1,_path_.length)
	
	const PREFIX = _path_.substr(0,_path_.indexOf("/", _path_.indexOf("/") + 1)+1)
	
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
			this.prefix = this.prefix.replace('//','')
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
				return this.prefix + '/' + rewritten
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
					"srcset": tag.getAttribute('src'),
					"action": tag.getAttribute('action'), 
					"integ": tag.getAttribute('integrity')
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
					if (attrs.srcset){
						if (!attrs.srcset.startsWith(this.prefix)){
							let rewrite = this.rewriteUrl(attrs.srcset)
							tag.setAttribute('srcset',rewrite)
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
				if (attrs.integ){
					tag.removeAttribute('integrity')
				}
			}
		}
	}
	
	function update(){
		let rewriter = new Rewriting(dloc)
		rewriter.rewriteDoc()
	}

	const open = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
	  var rewrite = new Rewriting(dloc)
		url = rewrite.rewriteUrl(url)
	  return open.call(this, method, url, ...rest);
	};
	
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
} catch (e) {
	
}

window.setInterval(function(){
	update()
},100)