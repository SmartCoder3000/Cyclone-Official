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
	
			if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//') || url.startsWith('ws:') || url.startsWith('wss:')){
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
			
				let type = tag.tagName.toLowerCase()
				//List of possible attributes
				let href = tag.getAttribute('href')
				let src = tag.getAttribute('src')
				let action = tag.getAttribute('action')
				let srcset = tag.getAttribute('srcset')
				let checked = tag.getAttribute('checked')
				//Rewriting & Setting Of Attributes
	
				tag.removeAttribute("integrity")
				if (!checked == 'true'){
					if (href){
						href = this.rewriteUrl(href)
						tag.setAttribute("href",href)
					}
					if (srcset){
						srcset = this.rewriteUrl(srcset)
						tag.setAttribute("srcset",srcset)
					}
					if (src){
						src = this.rewriteUrl(src)
						tag.setAttribute("src",src)
					}
					if (action){
						href = this.rewriteUrl(action)
						tag.setAttribute("action",action)
					}
					if (type === "script"){
						if (!src){
							let script = tag.text
							script = this.rewriteJS(script)
							tag.text = script
						}
					}
				  // you dont need that
					this.rewriteCSS(tag)
					tag.setAttribute("checked",'true')
				}
			}
			
		}
		
		rewriteiFrame(iframe){
			//Main Rewriting
			var frameDoc = (iframe.contentWindow || iframe.contentDocument);
			let tags = frameDoc.querySelectorAll('*')
			
			for (var i = 0; i < tags.length; i++){
				var tag = tags[i]
			
				let type = tag.tagName.toLowerCase()
				//List of possible attributes
				let href = tag.getAttribute('href')
				let src = tag.getAttribute('src')
				let action = tag.getAttribute('action')
				let srcset = tag.getAttribute('srcset')
				let checked = tag.getAttribute('checked')
				//Rewriting & Setting Of Attributes
	
				tag.removeAttribute("integrity")
				if (!checked == 'true'){
					if (href){
						href = this.rewriteUrl(href)
						tag.setAttribute("href",href)
					}
					if (srcset){
						srcset = this.rewriteUrl(srcset)
						tag.setAttribute("srcset",srcset)
					}
					if (src){
						src = this.rewriteUrl(src)
						tag.setAttribute("src",src)
					}
					if (action){
						href = this.rewriteUrl(action)
						tag.setAttribute("action",action)
					}
					if (type === "script"){
						if (!src){
							let script = tag.text
							script = this.rewriteJS(script)
							tag.text = script
						}
					}
				  // you dont need that
					this.rewriteCSS(tag)
					tag.setAttribute("checked",'true')
				}
			}
		}
	}

	const rewriter = new Rewriting(dloc)
	
	function update(){
		rewriter.rewriteDoc()
	}

	//These Will intercept things
	const open = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (method, url, ...rest) {
		url = rewriter.rewriteUrl(url)
	  return open.call(this, method, url, ...rest);
	};

	const oldFetch = window.fetch;
	window.fetch = async (...args) => {
    let [resource, config ] = args;
		resource = rewriter.rewriteUrl(resource)
    const response = await oldFetch(resource, config);
    return response;
	};
	
  var CWOriginal = Object.getOwnPropertyDescriptor(window.HTMLIFrameElement.prototype, 'contentWindow')

  Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentWindow', {
    get() {
      var iWindow = CWOriginal.get.call(this)
			rewriter.rewriteIframe(iWindow)
			rewriter.rewriteIframe(iWindow)
			
			return iWindow
    },
    set() {
      return false;
    }
  })

  var oPush = window.history.pushState;

  function CycloneStates(obj, title, path){
		console.log(path)
		if (path.startsWith(PREFIX)) {
      return;
		} else {
			url = rewriter.rewriteUrl(path)
			console.log(path)
			oPush.apply(this, [obj,title,url])
		}
	}

  window.history.pushState = CycloneStates
  window.history.replaceState = CycloneStates

	//WebSocket Proxy
	const OriginalWebsocket = window.WebSocket
	const ProxiedWebSocket = function() {
	  console.log("Intercepting web socket creation")
	
	  const ws = new OriginalWebsocket(...arguments)
	
	  const originalAddEventListener = ws.addEventListener
	  const proxiedAddEventListener = function() {
	    if (arguments[0] === "message") {
	      const cb = arguments[1]
	      arguments[1] = function() {
					var origin = arguments[0].origin
					arguments[0].origin = rewriter.rewriteUrl(origin)
					
	        return cb.apply(this, arguments)
	      }
	    }
	    return originalAddEventListener.apply(this, arguments)
	  }
	  ws.addEventListener = proxiedAddEventListener
	
	  Object.defineProperty(ws, "onmessage", {
	    set(func) {
	      return proxiedAddEventListener.apply(this, [
	        "message",
	        func,
	        false
	      ]);
	    }
	  });
	  return ws;
	};
	
	window.WebSocket = ProxiedWebSocket;
	
	//SW Work IN Progress
	if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.register('/sw.js',{
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
	window.alert({e})
}

window.setInterval(function(){
	update()
},100)