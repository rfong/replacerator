$(document).ready(function() {

  var storage = chrome.storage.local,
      cachedRules,
      editor,
      editorDefaultValue = 'function(from, matches) {\r  return "to";\r}';

  // Async load rules
  // TODO: chain init to promise
  storage.get('rules', function(response) { cachedRules = response.rules; });

  function updateRules(rules) {
    /* Saves and re-renders updated rules */
    storage.set({rules:rules}, function() { cachedRules = rules; });
    display();
  }

  function display() {
    /* Refresh the view */
    storage.get('rules', function(response) {

      var main = $('#rules'),
          codeMirrors = [];
      main.find('.rule').remove();

      // Render each rule
      _.each(response.rules, function(to, from) {
        // New row
        var el = $('<tr class="rule">\
          <td class="from">' + from + '</td>\
          <td><i class="fa fa-long-arrow-right"></i></td>\
          <td class="to">' + to + '</td>\
          <td><i class="delete-button fa fa-trash-o"></i></td>\
        </tr>');

        // Render JS snippets
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

        // Attach delete handler
        el.find('.delete-button').click(function() {
          if (window.confirm('Are you sure you want to delete this rule?')) {
            storage.get('rules', function(response) {
              rules = response.rules;
              delete rules[from];
              updateRules(rules);
            });
          }
        });

        // Attach edit handler for row onclick (excepting delete)
        el.click(function(e) {
          if($(e.target).is('.delete-button')){
            e.preventDefault();
            return;
          }
          editRule(from, to, isStringValidFunction(to, from));
        });

        main.append(el);
        _.each(codeMirrors, function(codeMirror) { codeMirror.refresh(); });
      });
    });
  }


  /* Export/import */

  // getter/setter for rule json dump textarea
  // todo: these can be outside ready()
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


  // Handler to save a new rule. Requires `editor` to be initialized.
  function addRule() {
    var from = $('#add-rule input#from-text').val(),
        codeMode = $('#code-toggle-button .toggle').hasClass('fa-toggle-on'),
        to = codeMode ? editor.getValue() : $('#add-rule input#to-text').val();

    // Validate
    if (!from) { return; }
    if (codeMode && !isStringValidFunction(to)) {
      alert('Please provide a valid JS function that returns a string.');
      return;
    }

    // Save to storage
    storage.get('rules', function(response) {
      rules = response.rules || {};

      rules[from] = to;  // allow to overwrite existing keys
      updateRules(rules);

      // reset inputs to blank
      _.each($('#add-rule input'), function(input) { $(input).val(''); });
      $('#add-rule .from').focus();
      editor.setValue(editorDefaultValue);
    });
  }


  // Load a rule into the editor. Requires `editor` to be initialized.
  function editRule(from, to, codeMode) {
    $('#add-rule input#from-text').val(from);
    if (codeMode != $('#code-toggle-button .toggle').hasClass('fa-toggle-on')) {
      $('#code-toggle-button .toggle').click();
    }
    if (!codeMode) {
      $('#add-rule input#to-text').val(to);
    } else {
      editor.setValue(to);
    }
  }


  // initialize!
  (function() {
    display();

    // Set up JS editor
    editor = CodeMirror($('#to-js')[0], {
      value: editorDefaultValue,
      mode: "javascript",
    });

    // Attach handlers
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

    updateImportButtons();
  }());

});
