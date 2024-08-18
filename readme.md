Go to app's dashboard on https://developers.facebook.com/apps

Get the app id (APP_ID) and the app secret (APP_SECRET)

Use the app id and the app secret to get an access token by using this url:

https://graph.facebook.com/oauth/access_token?client_id=APP_ID &client_secret=APP_SECRET&grant_type=client_credentials

This returns something like

{"access_token":"123412342134|f34f34f32fc3rc4rc324r-X","token_type":"bearer"}

I then use this access token to access the events

https://graph.facebook.com/v2.12/{11239244970}/events/?fields={id,name}&access_token={123412342134|f34f34f32fc3rc4rc324r-X}

However, this returns the error mentioned above, "Invalid OAuth access token signature.".


To get the Client Access Token for an app, do the following:

Sign into your developer account. On the Apps page, select an app to open the dashboard for that app. On the Dashboard, navigate to Settings > Advanced > Security > Client token.

https://developers.facebook.com/docs/facebook-login/guides/access-tokens#errors