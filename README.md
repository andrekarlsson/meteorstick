Things needed:
	meteor remove autopublish
	meteor add http
	meteor add bootstrap

	a file in server folder with the object (has to be loaded before api_calls):
	
	var config = {
   		consumerKey: "YOUR KEY",
   		consumerSecret: "YOUR SECRET",
   		accessTokenKey: "YOUR TOKEN",
   		accessTokenSecret: "YOUR TOKENSECRET",
	};
