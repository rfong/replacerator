(function() {

  var rules;

  function walk(node) {   
    // I stole this function from here:
    // http://is.gd/mwZp7E
    var child, next;
    switch ( node.nodeType )
    {
      case 1:  // Element
      case 9:  // Document
      case 11: // Document fragment
        child = node.firstChild;
        while (child)
        {
          next = child.nextSibling;
          walk(child);
          child = next;
        }
        break;
      case 3: // Text node
        node.nodeValue = handleText(node.nodeValue);
        break;
    }
  }
  
  function handleText(text) {
    for (var from in rules) {
      text = text.replace(
        new RegExp('\\b' + from + '\\b', 'ig'),  // case insensitive
        rules[from]);
    }
    return text;
  }
  
  chrome.storage.local.get('rules', function(response) {
    rules = response.rules;
    walk(document.body);
  });

})();


// If new version is installed, prepopulate with some rules.
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason in ["install", "update"]) {
    chrome.storage.local.set({
      rules: {
        'the cloud': 'my butt',
        'political correctness': 'treating people with respect',
        'politically correct': 'respectful',
      }
    });
  }
});
