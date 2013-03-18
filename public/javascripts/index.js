$(document).ready(function () {
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