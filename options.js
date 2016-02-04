var storage = chrome.storage.local;


function updateRules(rules) {
  storage.set({rules:rules});
  display();
}


// update
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


$(document).ready(function() {
  display();

  var addRule = function() {
    var from = $('#add-rule input.from').val(),
        to = $('#add-rule input.to').val();

    storage.get('rules', function(response) {
      rules = response.rules || {};

      // already exists
      if (_.some(rules,
                 function(rule_from, rule_to) { return rule_to == to; })) {
        return;
      }
      // todo prevent mirrored

      rules[from] = to;
      updateRules(rules);

      // clear old
      _.each($('#add-rule input'), function(input) { $(input).val(''); });
    });

  };

  // handlers
  $('#add-rule input').keypress( function(e){ if (e.which==13) addRule() });
});
