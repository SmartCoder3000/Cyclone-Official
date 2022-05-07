import qs from 'querystring';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

var __dirname = path.dirname(url.fileURLToPath(import.meta.url))

try {
  fs.readFileSync(__dirname+'/stats.json');
} catch(e) {
  console.log('Installing Analytics API');
  fs.writeFileSync(__dirname+'/stats.json', JSON.stringify({"users":0,"top":0,"visits":0,"id":[]}));
}

var initiateStat = JSON.parse(fs.readFileSync(__dirname+'/stats.json'));

initiateStat.id.map((user, key) => {
  var stats = initiateStat;

  if (!stats.id[key]) return clearInterval(int);
  if((new Date().getTime() - stats.id[key].pinged)>29999) {
    stats.id.splice(key, 1);
    stats.users = stats.id.length
  }
  fs.writeFileSync(__dirname+'/stats.json', JSON.stringify(stats));

  var int = setInterval(function() {
    if (!stats.id[key]) return clearInterval(int);
    if((new Date().getTime() - stats.id[key].pinged)>29999) {
      stats.id.splice(key, 1);
      stats.users = stats.id.length
    }
    fs.writeFileSync(__dirname+'/stats.json', JSON.stringify(stats))
  }, 30000)
})

export default function(req, res) {
  if (!req.url.startsWith('/analytics.')) return true;

  var stats = JSON.parse(fs.readFileSync(__dirname+'/stats.json'));

  req.query = qs.parse(url.parse(req.url).query)
  var id = req.query.id
  
  if (req.url.startsWith('/analytics.start')) {
    if (stats.id.find(e => e.id==id)) return res.end('Exists')
    var key = stats.id.push({pinged: new Date().getTime(), id: id})-1;

    stats.visits++

    stats.users = stats.id.length

    if (stats.top<stats.users) stats.top = stats.users;
    
    res.end('Done')

    var int = setInterval(function() {
      if (!stats.id[key]) return clearInterval(int);
      if((new Date().getTime() - stats.id[key].pinged)>29999) {
        stats.id.splice(key, 1);
        stats.users = stats.id.length
      }
      fs.writeFileSync(__dirname+'/stats.json', JSON.stringify(stats))
    }, 30000)
  }

  if (req.url.startsWith('/analytics.ping')) {
    if (!stats.id.find(e => e.id==id)) return res.end('Failed')
    if (!id) return res.end('Failed')

    if (stats.top<stats.users) stats.top = stats.users;
    var user = stats.id.find(e => e.id==id)
    var origin = user;
    user.pinged = new Date().getTime()
    stats.id[stats.id.indexOf(origin)] = user

    res.end('Success')
  }

  if (req.url.startsWith('/analytics.users')) {
    if (stats.top<stats.users) stats.top = stats.users;
    return res.end(JSON.stringify(stats))
  }

  if (req.url.startsWith('/analytics.client.js')) {
    return res.end(fs.readFileSync(__dirname+'/client.js'))
  }

  if (req.url.startsWith('/analytics.worker.js')) {
    return res.end(fs.readFileSync(__dirname+'/worker.js'))
  }

  return fs.writeFileSync(__dirname+'/stats.json', JSON.stringify(stats))
}

setInterval(() => {
  var date = new Date()
  var hours = date.getUTCHours();
  var param = hours === 0 && date.getMinutes() === 0
  if (param) {
    var stats = JSON.parse(fs.readFileSync(__dirname+'/stats.json'));

    stats.visits = 0;
    
    fs.writeFileSync(__dirname+'/stats.json', JSON.stringify(stats))
  }
}, 60000)

//import url from"url";import qs from"querystring";import*as fs from"fs";try{fs.readFileSync("./stats.json")}catch(i){console.log("Installing Analytics API"),fs.writeFileSync("./stats.json",JSON.stringify({users:0,top:0,visits:0,id:[]}))}var initiateStat=JSON.parse(fs.readFileSync("./stats.json"));initiateStat.id.map((i,t)=>{var e=initiateStat;if(!e.id[t])return clearInterval(s);(new Date).getTime()-e.id[t].pinged>29999&&(e.id.splice(t,1),e.users=e.id.length),fs.writeFileSync("./stats.json",JSON.stringify(e));var s=setInterval(function(){if(!e.id[t])return clearInterval(s);(new Date).getTime()-e.id[t].pinged>29999&&(e.id.splice(t,1),e.users=e.id.length),fs.writeFileSync("./stats.json",JSON.stringify(e))},3e4)});export default function(i,t){if(!i.url.startsWith("/analytics."))return!0;var e=JSON.parse(fs.readFileSync("./stats.json"));i.query=qs.parse(url.parse(i.url).query);var s=i.query.id;if(i.url.startsWith("/analytics.start")){if(e.id.find(i=>i.id==s))return t.end("Exists");var r=e.id.push({pinged:(new Date).getTime(),id:s})-1;e.visits++,e.users=e.id.length,e.top<e.users&&(e.top=e.users),t.end("Done");var n=setInterval(function(){if(!e.id[r])return clearInterval(n);(new Date).getTime()-e.id[r].pinged>29999&&(e.id.splice(r,1),e.users=e.id.length),fs.writeFileSync("./stats.json",JSON.stringify(e))},3e4)}if(i.url.startsWith("/analytics.ping")){if(!e.id.find(i=>i.id==s))return t.end("Failed");if(!s)return t.end("Failed");e.top<e.users&&(e.top=e.users);var a=e.id.find(i=>i.id==s),d=a;a.pinged=(new Date).getTime(),e.id[e.id.indexOf(d)]=a,t.end("Success")}return i.url.startsWith("/analytics.users")?(e.top<e.users&&(e.top=e.users),t.end(JSON.stringify(e))):i.url.startsWith("/analytics.client.js")?t.end(fs.readFileSync("./client.js")):i.url.startsWith("/analytics.worker.js")?t.end(fs.readFileSync("./worker.js")):fs.writeFileSync("./stats.json",JSON.stringify(e))}