(function() {

  var storage = chrome.storage.local,
      cachedRules;
  storage.get('rules', function(response) { cachedRules = response.rules; });


  function updateRules(rules) {
    storage.set({rules:rules}, function() { cachedRules = rules; });
    display();
  }


  function display() {
    storage.get('rules', function(response) {
      var main = $('#rules');
      main.find('.rule').remove();

      _.each(response.rules, function(to, from) {
        var el = $('<tr class="rule">\
          <td class="from">' + from + '</td>\
          <td><i class="fa fa-long-arrow-right"></i></td>\
          <td class="to">' + to + '</td>\
          <td><i class="delete-button fa fa-trash-o"></i></td>\
        </tr>');
        // delete handler
        el.find('.delete-button').click(function() {
          storage.get('rules', function(response) {
            rules = response.rules;
            delete rules[from];
            updateRules(rules);
          });
        });

        main.append(el);
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

    var addRule = function() {
      var from = $('#add-rule input.from').val(),
          to = $('#add-rule input.to').val();

      if (!from) return;

      storage.get('rules', function(response) {
        rules = response.rules || {};

        rules[from] = to;  // allow to overwrite existing keys
        updateRules(rules);

        // reset inputs
        _.each($('#add-rule input'), function(input) { $(input).val(''); });
        $('#add-rule .from').focus();
      });

    };

    // set up handlers
    $('#add-rule input').keypress( function(e){ if (e.which==13) addRule() });
    $('#add-rule .add-button').click( addRule );

    $('#export-json').click( exportJson );
    $('#add-json').click( addJson );
    $('#replace-json').click( replaceJson );

    $('#rules-json').keyup( updateImportButtons );

    // init
    updateImportButtons();
  });


  function isValidJson(str) {
    try { JSON.parse(str); }
    catch (e) { return false; }
    return true;
  }

})();
