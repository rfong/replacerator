// These don't pollute the global namespace


// Switch underscore to use Mustache style templating
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};


// Check that the JS string represents a valid function, and when
// run on expected input, returns a string.
function isStringValidFunction(fnStr, from) {
  try {
    return typeof evalStringReplaceFunction(fnStr, [from || '']) === 'string';
  } catch (e) {
    return false;
  }
}

function evalStringReplaceFunction(fnStr, matches) {
  var expr = _.template('({{fn}})("{{from}}", [{{matches}}])')({
    fn: fnStr,
    from: matches[0],
    matches: (_.map(matches, function(m) { return '"' + m + '"'; })
              .slice(1).join(',')), // todo handle m=undefined case (produces ["undefined"])
  });
  //console.log(expr);
  return eval(expr);
}

function isValidJson(str) {
  try { JSON.parse(str); }
  catch (e) { return false; }
  return true;
}

// toggle between two classes
function toggleBetweenClasses(jq, class1, class2) {
  if (jq.hasClass(class1)) {
    jq.removeClass(class1).addClass(class2);
  } else {
    jq.removeClass(class2).addClass(class1);
  }
}

// toggle one class on/off
function toggleClass(jq, className) {
  jq.toggleClass(className, !jq.hasClass(className));
}
