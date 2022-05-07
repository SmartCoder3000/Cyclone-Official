self.addEventListener('install', event => {
	self.skipWaiting();
	console.log(`Event Installed`);
});

self.addEventListener('activate', event => {
	event.waitUntil(clients.claim());
});

async function GenerateID() {
  return Math.floor((Math.random() * (999999999999999 - 100000000000000) + 100000000000000))
}

async function SendPing(id) {
  if (!id) return false;
  var request = await fetch('/analytics.ping?id='+id)
}

self.addEventListener('message', async (config) => {
  self.config = config;
  await FetchAnalytics()
})

async function FetchAnalytics() {
  self.id = await GenerateID()
  console.log(`Analytics Worker Loaded: ${self.id}`)
  var request = await fetch('/analytics.start?id='+self.id)

  var text = await request.text()

  if (text) {
    setInterval(`SendPing(${self.id})`, 15000)
  } else {
    console.error('Failed to Initiate Analytics')
  }
}

//async function GenerateID(){return Math.floor(899999999999999*Math.random()+1e14)}async function SendPing(e){if(!e)return!1;await fetch("/analytics.ping?id="+e)}async function FetchAnalytics(){self.id=await GenerateID(),console.log(`Analytics Worker Loaded: ${self.id}`);var e=await fetch("/analytics.start?id="+self.id);await e.text()?setInterval(`SendPing(${self.id})`,15e3):console.error("Failed to Initiate Analytics")}self.addEventListener("install",e=>{self.skipWaiting(),console.log("Event Installed")}),self.addEventListener("activate",e=>{e.waitUntil(clients.claim())}),self.addEventListener("message",async e=>{self.config=e,await FetchAnalytics()});