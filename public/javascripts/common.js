WebFont.load({
  custom: { families: ['Libre Baskerville'],
    urls: ['/fonts/LibreBaskerville.css']
  },
  loading: function(){
    console.log("Loading fonts...");
  },
  active: function(){
    console.log('Fonts are loaded.')
  },
  inactive: function(){
    console.log("Failed to load fonts.");
  }
});

$(function(){
  checkLoginStatus(function(loginStatus){
    if(loginStatus.isLogin){
      $('#user-box')
        .html($('#user-box-logged-in').html())
        .find('.user-name').html(loginStatus.userInfo.name.first);
    }else{
      $('#user-box')
        .html($('#user-box-log-in').html());
    }
  });

  $('.photo-info-symbol').on('mouseover', function(){
    $(this).on('mouseout', function(){
      $('.photo-info').fadeOut(1200);
    });
    $('.photo-info').fadeIn(600).on('mouseenter', function(){
      $(this).stop(true, true).fadeIn(600);
    }).on('mouseout', function(){
      $('.photo-info').fadeOut(1200);
    });
  });

});

var checkLoginStatus = function(callback){
  $.ajax('/user/loginStatus', {
    cache: false,
    success: callback
  });
}