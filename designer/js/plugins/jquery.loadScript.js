/*
 * This is different from jQuery's getScript where it support debugging by debugger.
 * Ideas from http://stackoverflow.com/questions/690781/debugging-scripts-added-via-jquery-getscript-function.
 */
jQuery.extend({
  loadScript: function(url, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = url;

    // Handle Script loading
    {
      var done = false;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function(){
        if ( !done && (!this.readyState ||
          this.readyState == "loaded" || this.readyState == "complete") ) {
          done = true;
          if (callback)
            callback();

          // Handle memory leak in IE
          script.onload = script.onreadystatechange = null;
        }
      };
    }

    head.appendChild(script);

    // We handle everything using the script element injection
    return undefined;
  }
});