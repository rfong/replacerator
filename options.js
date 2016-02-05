(function() {

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

        rules[from] = to;  // allow to overwrite existing keys
        updateRules(rules);

        // reset inputs
        _.each($('#add-rule input'), function(input) { $(input).val(''); });
        $('#add-rule .from').focus();
      });

    };

    // handlers
    $('#add-rule input').keypress( function(e){ if (e.which==13) addRule() });
  });


  // If never defined, prepopulate with some rules.
  // chrome.runtime.onInstalled event does not seem to be firing.
  storage.get('rules', function(response) {
    if (response.rules === undefined) {
      chrome.storage.local.set({
        rules: {
          'the cloud': 'my butt',
          'political correctness': 'treating people with respect',
          'politically correct': 'respectful',
        }
      });
    }
  });

})();
