var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(["setDomains", ["*.ksi.fi.muni.cz"]]);
_paq.push(["setDoNotTrack", true]);
_paq.push(["disableCookies"]);

_paq.push(['trackPageView']);

_paq.push(['enableLinkTracking']);
(function() {
  var u="https://fadmin.fi.muni.cz/piwik/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '46']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();

//window.onpopstate = function(event) { // this didn't work reliably
function trackNewPage(){
  _paq.push(['setReferrerUrl', location.href]);
  _paq.push(['setCustomUrl', window.location.pathname]);
  _paq.push(['setDocumentTitle', document.title]);

  // remove all previously assigned custom variables, requires Matomo (formerly Piwik) 3.0.2
  _paq.push(['deleteCustomVariables', 'page']);
  _paq.push(['trackPageView']);

  // make Matomo aware of newly added content
  // var content = document.getElementById('content');
  // _paq.push(['MediaAnalytics::scanForMedia', content]);
  // _paq.push(['FormAnalytics::scanForForms', content]);
  // _paq.push(['trackContentImpressionsWithinNode', content]);
  _paq.push(['enableLinkTracking']);
}

// modified https://stackoverflow.com/a/4585031
// this works, but document.title is not yet updated at this point

// modified https://stackoverflow.com/a/29540461
new MutationObserver(function(mutations) {
  // console.log(document.title);
  trackNewPage();
}).observe(
  document.querySelector('title'),
  { subtree: true, characterData: true, childList: true }
);
