(function(Ts){
	Ts.Settings = _Settings = new Meteor.Collection('settings');

	var urls = {
	  requestToken: 'https://api.telldus.com/oauth/requestToken',
	  authorize: 'https://api.telldus.com/oauth/authorize',
	  accessToken: 'https://api.telldus.com/oauth/accessToken',
	  authenticate: 'https://api.telldus.com/oauth/authorize'
	};

	var _apiSettings = _Settings.findOne({});
	console.log(_apiSettings);
	var _apiBinding = getApiBinding();
	
	Ts.api = {
		setKeys: function(consumerKey, consumerSecret, token, tokenSecret){
			Ts.Settings.insert({
			  keys: {
			    consumerKey: consumerKey,
			    consumerSecret: consumerSecret,
			    token: token,
			    tokenSecret: tokenSecret
			  }
			});
			getApiBinding();
		},
		getBinding: function(){
			return (_apiBinding !== '') ? _apiBinding : getApiBinding();
		},
		isSetup: function(){
			console.log(_apiBinding);
			console.log((_apiBinding !== '') ? true : false);
			return (_apiBinding !== '') ? true : false;
		}
	}

	
	// Ts.api.client = {
	// 	list: function(){
	// 		return _apiBinding ? _apiBinding.get()
	// 	}
	// }

	function getApiBinding(){
		//console.log(_apiSettings.keys.consumerKey);
		return _apiSettings ? new OAuth1Binding(_apiSettings.keys.consumerKey, _apiSettings.keys.consumerSecret, urls) : '';
	}


})(this.Ts || (this.Ts = {}));