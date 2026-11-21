// breezreader.com/go/<code>/ : count the tap, then go to the App Store.
// Made by breez-marketing/tools/make-go-pages.mjs; edit there, not here.
(function () {
  var APP_ID = "6804911917";
  var PT = "";
  var LIVE = false;
  var KEY = "A-US-8308121023";
  var HOST = "https://us.aptabase.com";

  var code = document.documentElement.getAttribute('data-go') || 'site';
  var q = new URLSearchParams(location.search);
  // ?p=<post> names the post or thread: /go/tt/?p=w2-why gives ct "tt-w2-why".
  var post = (q.get('p') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 29 - code.length);
  var ct = post ? code + '-' + post : code;

  var ua = navigator.userAgent;
  var ipad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  var device = /iPhone|iPod/.test(ua) ? 'iphone'
    : (/iPad/.test(ua) || ipad) ? 'ipad'
    : /Macintosh/.test(ua) ? 'mac'
    : /Android/.test(ua) ? 'android'
    : 'other';
  var apple = device === 'iphone' || device === 'ipad' || device === 'mac';

  var store = 'https://apps.apple.com/app/apple-store/id' + APP_ID + '?' +
    (PT ? 'pt=' + PT + '&' : '') + 'ct=' + encodeURIComponent(ct) + '&mt=8';
  var dest = LIVE && apple ? store : '/?ref=' + encodeURIComponent(ct);
  var to = q.get('to') === 'home' ? '/?ref=' + encodeURIComponent(ct) : dest;

  var debug = q.has('debug') || /^(localhost|127\.)/.test(location.hostname);
  var gone = false;
  function go() { if (!gone) { gone = true; location.replace(to); } }

  if (q.has('dry')) {
    var d = document.getElementById('dest'); d.textContent = to; d.hidden = false;
    return;
  }
  try {
    var now = Date.now();
    var body = JSON.stringify([{
      timestamp: new Date(now).toISOString(),
      sessionId: String(Math.floor(now / 1000)) + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'),
      eventName: 'go_tap',
      systemProps: {
        isDebug: debug, locale: (navigator.language || 'en').slice(0, 10),
        osName: device, osVersion: '', appVersion: 'site', appBuildNumber: '', sdkVersion: 'breez-go'
      },
      props: { source: code, post: post || 'bio', device: device, live: LIVE ? 'yes' : 'no' }
    }]);
    fetch(HOST + '/api/v0/events', {
      method: 'POST', keepalive: true, body: body,
      headers: { 'Content-Type': 'application/json', 'App-Key': KEY }
    }).then(go, go);
  } catch (e) { /* counting must never block the link */ }
  setTimeout(go, 600);
})();
