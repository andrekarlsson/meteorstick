
if (Meteor.isClient) {

  Template.start.getStartTemplate = function(){
    Meteor.call('isSetup', function(err, res){
      if(err)
        console.error('error when testing if keys are set');
      else
        var startTemplate = res ? Meteor.render(function(){return Template.main()}) : Meteor.render(function(){return Template.settings()});
        document.body.appendChild(startTemplate);
    });
  };

  Template.settingsForm.events = {
    'click .settings_form .save': function(evt, template){
      evt.preventDefault();
      var consumerKey = $('[name=consumerKey]').val();
      var consumerSecret = $('[name=consumerSecret]').val();
      var token = $('[name=token]').val();
      var tokenSecret = $('[name=tokenSecret]').val();

      Meteor.call('setKeys', consumerKey, consumerSecret, token, tokenSecret);

      $('.settings').remove();

      var mainTemplate = Meteor.render(function(){ return Template.main() });
      document.body.appendChild(mainTemplate);

    }
  }

}

if (Meteor.isServer) {

  Meteor.methods({
    setKeys: function (consumerKey, consumerSecret, token, tokenSecret) {
      Ts.api.setKeys(consumerKey, consumerSecret, token, tokenSecret);
    },
    isSetup: function (){
      return Ts.api.isSetup();
    }
  });
}
