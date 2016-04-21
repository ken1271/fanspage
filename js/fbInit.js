function fbinit(){
  window.fbAsyncInit = function() {
    FB.init({
      appId: '993401974051375',
      xfbml: true,
      version: 'v2.5'
    });
    getInfo()
  };
  (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
          return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v2.5";
      fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}
