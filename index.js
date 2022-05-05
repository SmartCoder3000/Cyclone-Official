var fs = require('fs')
var express = require('express')
var app = express()
var cyclone = require('./static/CYCLONE/index.js')
var filter = require('./static/CYCLONE/filter.js')
var { Worker, isMainThread} = require('worker_threads')
var ws = require('ws')
var ExpressSocket = require('express-ws')

ExpressSocket(app)

//Worker
app.get(function(req,res,next){
	res.set('Service-Worker-Allowed','true')
	if (req.originalUrl.startsWith('/service')){
		next()
	} else {
		next()
	}
})

//Proxy And Filter
app.use(filter.filter)
app.use(cyclone.request)

app.get('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html')
})

app.get('/sw.js',function(req,res){
	res.sendFile(__dirname+'/assets/js/sw.js')
})

app.get('/appearance',function(req,res){
	res.sendFile(__dirname+'/views/appearance.html')
})

app.get('/games',function(req,res){
	res.sendFile(__dirname+'/views/games.html')
})

app.get('/unblock',function(req,res){
	res.sendFile(__dirname+'/views/unblock.html')
})

app.get('/assets/:type/:file',function(req,res){
	res.sendFile(__dirname+'/assets/'+req.params.type+'/'+req.params.file)
})

app.get('*',function(req,res){
	res.sendFile(__dirname+'/views/404.html')
})

if (isMainThread){
	app.listen(8080, '0.0.0.0',function(){
		console.log("App Listening On 8080")
	})
	new Worker(__filename)
} else {
	app.listen(80, '0.0.0.0',function(){
		console.log("Worker Listening On 80")
	})
}