class JSAnalytics {
  constructor(config) {
    if (window.Worker && !sessionStorage['stats-worker-active']) {
      var analyticsWorker = new Worker("/analytics.worker.js");

      analyticsWorker.postMessage(config)
      
      sessionStorage['stats-worker-active'] = analyticsWorker;
    }
  }
}