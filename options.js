var storage = chrome.storage.local,
    cachedRules,
    editor,
    editorDefaultValue = 'function(from) {\r  return "to";\r}';

storage.get('rules', function(response) { cachedRules = response.rules; });


function updateRules(rules) {
  storage.set({rules:rules}, function() { cachedRules = rules; });
  display();
}


function display() {
  storage.get('rules', function(response) {
    var main = $('#rules'),
        codeMirrors = [];
    main.find('.rule').remove();

    _.each(response.rules, function(to, from) {
      // new row
      var el = $('<tr class="rule">\
        <td class="from">' + from + '</td>\
        <td><i class="fa fa-long-arrow-right"></i></td>\
        <td class="to">' + to + '</td>\
        <td><i class="delete-button fa fa-trash-o"></i></td>\
      </tr>');

      // I guess we're gonna be terrible and lexically case these
      if (isStringValidFunction(to, from)) {
        var toEl = el.find('td.to');
        toEl.html('');
        codeMirrors.push(
          CodeMirror(toEl[0], {
            value: to,
            readOnly: true,
            cursorBlinkRate: -1,
          })
        );
      }

      // delete handler
      el.find('.delete-button').click(function() {
        storage.get('rules', function(response) {
          rules = response.rules;
          delete rules[from];
          updateRules(rules);
        });
      });

      main.append(el);
      _.each(codeMirrors, function(codeMirror) { codeMirror.refresh(); });
    });
  });
}


// getter/setter for rule json dump textarea
function setRulesDump(rules) {
  var val = (rules === undefined) ? '' : JSON.stringify(rules);
  $('#rules-json').val(val);
  updateImportButtons();
}
function getRulesDump() {
  var val = $('#rules-json').val();
  return val ? JSON.parse(val) : {};
}
function isRulesDumpValid() {
  if (!isValidJson($('#rules-json').val())) { return false; }
  var rules = getRulesDump();
  return _.all(_.keys(rules).concat(_.values(rules)), function(x) {
    return typeof x === "string";
  });
}


// dump out ruleset to textarea
function exportJson() {
  setRulesDump(cachedRules);
}
// replace existing ruleset with contents of textarea
function replaceJson() {
  if (!isRulesDumpValid()) return;
  if (!confirm('Are you sure? This will discard and replace your existing rules.')) { return; }
  updateRules(getRulesDump());
  setRulesDump();
}
// add contents of textarea to existing ruleset
function addJson() {
  if (!isRulesDumpValid()) return;
  updateRules($.extend({}, cachedRules, getRulesDump()));
  setRulesDump();
}
// enable/disable import buttons based on rule dump validity
function updateImportButtons() {
  var disable = !isRulesDumpValid();
  $('#add-json').attr('disabled', disable);
  $('#replace-json').attr('disabled', disable);
}


// main
$(document).ready(function() {
  display();

  editor = CodeMirror($('#to-js')[0], {
    value: editorDefaultValue,
    mode: "javascript",
  });

  var addRule = function() {
    var from = $('#add-rule input#from-text').val(),
        codeMode = $('#code-toggle-button .toggle').hasClass('fa-toggle-on'),
        to = codeMode ? editor.getValue() : $('#add-rule input#to-text').val();

    if (!from) {
      return;
    }

    if (codeMode && !isStringValidFunction(to)) {
      alert('Please provide a valid JS function that returns a string.');
      return;
    }

    storage.get('rules', function(response) {
      rules = response.rules || {};

      rules[from] = to;  // allow to overwrite existing keys
      updateRules(rules);

      // reset inputs
      _.each($('#add-rule input'), function(input) { $(input).val(''); });
      $('#add-rule .from').focus();
      editor.setValue(editorDefaultValue);
    });

  };

  // set up handlers
  $('#add-rule input').keypress( function(e){ if (e.which==13) addRule() });
  $('#add-rule .add-button').click( addRule );

  $('#export-json').click( exportJson );
  $('#add-json').click( addJson );
  $('#replace-json').click( replaceJson );

  $('#rules-json').keyup( updateImportButtons );

  $('#code-toggle-button').click(function() {
    toggleClass($(this).find('.fa-font'), 'grey');
    toggleClass($(this).find('.fa-code'), 'grey');
    toggleBetweenClasses($(this).find('.toggle'),
                         'fa-toggle-on', 'fa-toggle-off');
    toggleClass($('#to-js'), 'hidden');
    toggleClass($('#to-text'), 'hidden');
    toggleClass($('.code-warning'), 'hidden');
    editor.refresh();
  });

  // init
  updateImportButtons();
});
