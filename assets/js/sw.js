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
}

self.addEventListener('fetch', event => {
  var url = event.request.url
	
});