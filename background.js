chrome.runtime.onInstalled.addListener(function (object) {
  // If never defined, prepopulate with some rules.
  chrome.storage.local.get('rules', function(response) {
    if (response.rules === undefined) {
      chrome.storage.local.set({
        rules: {
          'the cloud': 'my butt',
          'political correctness': 'treating people with respect',
          'politically correct': 'respectful',
          "([0-9\\.]+\\s*[x\\*]\\s*)*[0-9\\.]+\\s*(cm|CM)":"function(from, matches) {\n  // Cm to inch converter; sorry about the hegemony\n  // Matches multiple dimensions of the form \"%d x ... x %d cm\", or just \"%d cm\"\n  var values = from.match(new RegExp('[0-9\\.]+', 'g'));\n  for (var i in values) {\n    values[i] = (parseFloat(values[i]) / 2.54).toFixed(2);\n  }\n  if (values) {\n    return from + ' (' + values.join(' x ') + ' in)';\n  } return from;\n}",
        }
      });
    }
    // Open options page on initial install.
    chrome.runtime.openOptionsPage(function() {});
  });
});
