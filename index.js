var fs = require('fs')
var express = require('express')
var app = express()
var cyclone = require('./static/CYCLONE/index.js')

//Proxy
app.use(cyclone.request)

app.get('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html')
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

app.get('/service/*',function(req,res){
	
})

app.get('*',function(req,res){
	res.sendFile(__dirname+'/views/404.html')
})

app.listen(8080, '0.0.0.0',function(){
	console.log("App Listening On 8080")
})