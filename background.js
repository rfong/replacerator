chrome.runtime.onInstalled.addListener(function (object) {
  // If never defined, prepopulate with some rules.
  chrome.storage.local.get('rules', function(response) {
    if (response.rules === undefined) {
      chrome.storage.local.set({
        rules: {
          'the cloud': 'my butt',
          'political correctness': 'treating people with respect',
          'politically correct': 'respectful',
          'Donald (\w[\.]?) Trump': "function(from, matches) {\n  return 'Dick ' + matches[0] + ' McChuckles';\n}",
        }
      });
    }
    // Open options page on initial install.
    chrome.runtime.openOptionsPage(function() {});
  });
});
