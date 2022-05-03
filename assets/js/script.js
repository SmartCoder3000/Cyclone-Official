try {
	function isURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
	}
  function createIframe(url){
		if (!isURL(url)) {
			var src = 'https://google.com/search?q='+encodeURI(url)
		} else {
			var src = url
		}
      let headstyle = `html 
                {
                 overflow: auto;
                }

                html, body, div, iframe 
                {
                 margin: 0px; 
                 padding: 0px; 
                 height: 100%; 
                 border: none;
                }
                iframe 
                {
                 display: block; 
                 width: 100%; 
                 border: none; 
                 overflow-y: auto; 
                 overflow-x: hidden;
                }
								.loader {
								 	background-image: url('/assets/image/loading.png');
								}`

    let frame = `<div class="loader"><iframe src="/service/${src}" frameborder="0" 
    marginheight="0" 
    marginwidth="0" 
    width="100%" 
    height="100%" 
    scrolling="auto"><iframe></div>`

    document.body.innerHTML = frame
  }
  document.body.style.overflow = "hidden";
  window.onscroll = () => { window.scroll(0, 0); };
  
  let appearance;

  function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");

    // Loop through the array elements
    for (var i = 0; i < cookieArr.length; i++) {
      var cookiePair = cookieArr[i].split("=");

      /* Removing whitespace at the beginning of the cookie name
            and compare it with the given string */
      if (name == cookiePair[0].trim()) {
        // Decode the cookie value and return
        return decodeURIComponent(cookiePair[1]);
      }
    }

    // Return null if not found
    return null;
  }

  if (getCookie("appearance")) {
    appearance = getCookie("appearance");
  } else {
    document.cookie = "appearance=space";
    appearance = "space";
  }
  
  var bg = document.querySelectorAll("body")[0];
  var input = document.querySelectorAll('input')[0];
  var text = document.querySelectorAll('*')
  var nav = document.querySelectorAll('.navitem')
  var link = document.querySelector("link[rel*='icon']")
  var h1 = document.querySelector('h1')
  var options = document.querySelectorAll('option')
  
  bg.style.overflow = "hidden"
  
  let background;
  let inputColor;
  let fontColor = "white";
  let font = "'Open Sans', sans-serif";
  let favicon
  let optionColor;
  
  if (appearance == "dark") {
    background = "black";
    inputColor = "white";
    favicon = "https://cdn.glitch.global/92262e25-2894-4225-9550-00ba8ee723de/logo.PNG?v=1651259696878"
    
  } else if (appearance == "resilience") {
    background = "#0A1832";
    inputColor = "orange";
    fontColor = "orange";
    
  } else if (appearance === "hackerman") {
    background = "#2a2829"
    fontColor = "#39ff14";
    font = "Ubuntu, monospace"
    favicon = "https://cdn.glitch.global/92262e25-2894-4225-9550-00ba8ee723de/logo.PNG?v=1651259696878"
  } else if (appearance === "ph"){
    background = "black";
    inputColor = "orange"
    fontColor = "orange"
  } else if (appearance === "space"){
    background = "black";
    inputColor = "#1E90FF"
    fontColor = "#1E90FF"
  } else if (appearance === "beast"){
    background = "#4d1c7c";
    inputColor = "#a8f002"
    fontColor = "#a8f002"
  } else if (appearance === "incognito"){
    background = "#161923"
    inputColor, fontColor = "#3cb371"
  } else if (appearance === "sleepy") {
    background = "#051622"
    inputColor = "#1BA098"
    fontColor = "#DEB992"
  }
  
  if (input){
    input.style.border = inputColor + " 2px solid"
    input.style.position = "fixed";
    input.style.top = "50%"
    input.style.right = "50%"
    input.style.left = "50%"
    input.width = "50px"
    
  }
  
  for (var i = 0; i < text.length; i++){
    var txt = text[i]
    txt.style.color = fontColor;

    if (appearance === "ph"){
      txt.style.borderColor = "orange"
    }
    if (appearance === "hackerman"){
      txt.style.font = "Inconsolata, monospace"
    } else {
      txt.style.fontFamily = font
    }
  }
  

  optionColor = "black";
  for (var i = 0; i<options.length;i++){
    options[i].style.color = optionColor
  }
  
  if (!appearance == "default"){
    link.href = favicon
  }
  bg.style.backgroundColor = background;

	if (location.pathname == '/unblock'){
		var urlinput = document.querySelector('#url')
		urlinput.onkeypress = function(e){
	    if (!e) e = window.event;
	    var keyCode = e.code || e.key;
	    if (keyCode == 'Enter'){
				var url = urlinput.value
				createIframe(url)
	      return false;
	    }
	  }
	}
} catch (e) {
  window.alert(e);
}

