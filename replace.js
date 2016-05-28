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
    // Run replacement rules
    for (var from in rules) {
      var to = rules[from],
          pattern = new RegExp('\\b' + from + '\\b'),
          matches = text.match(pattern);
      if (matches && isStringValidFunction(to)) {
        to = evalStringReplaceFunction(to, matches);
      }
      text = text.replace(new RegExp('\\b' + from + '\\b', 'ig'), to);
    }
    return text;
  }
  
  chrome.storage.local.get('rules', function(response) {
    rules = response.rules;
    walk(document.body);
  });

})();
