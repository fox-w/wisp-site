// First paint in the reader's own theme.
//
// A classic, blocking script in <head>, so it runs before the page is ever
// painted: without it a Paper Night evening would open on a flash of Paper
// (or the other way round) until the app mounted. It is a file, not an inline
// script, because extension pages refuse inline scripts.
//
// It MIRRORS resolveTheme in packages/design-tokens/src/auto.ts and the v6
// migration in apps/web/src/store.ts. The app re-resolves on mount, so a
// mismatch can only ever cost one frame, and tests/auto-theme.spec.ts checks
// this file against the app for every case it handles. Keep them in step.
(function () {
  var theme = 'paper';
  try {
    var blob = JSON.parse(localStorage.getItem('wisp-settings') || 'null');
    var state = (blob && blob.state) || {};
    var d = state.display || {};
    var version = (blob && blob.version) || 0;
    var auto = d.themeAuto;
    if (typeof auto !== 'boolean') {
      // Before v6 there was no Auto. Keep what an existing reader had, except
      // an install that never chose (no theme, or Dusk before first run).
      auto = version >= 6 || !d.theme || (state.onboarded !== true && d.theme === 'dusk');
    }
    if (auto) {
      var night;
      if (d.autoSource === 'time') {
        var now = new Date();
        var m = now.getHours() * 60 + now.getMinutes();
        var day = typeof d.dayStartsAt === 'number' ? d.dayStartsAt : 420;
        var eve = typeof d.nightStartsAt === 'number' ? d.nightStartsAt : 1140;
        night = day === eve ? false : day < eve ? m < day || m >= eve : m >= eve && m < day;
      } else {
        night = !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
      }
      theme = night ? 'paper-night' : 'paper';
    } else if (typeof d.theme === 'string') {
      theme = d.theme;
    }
  } catch {
    /* storage blocked or unreadable: Paper, the calm default */
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
