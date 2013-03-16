function get_offset_left (id) {
  var $gallery = $('#gallery');
  return $gallery.find('.list_item_' + id).offset().left
    + $gallery.find('.list_item_' + id).width() / 2
    - $gallery.find('.image-list').offset().left;
}

function get_url (design_id) {
  return '/designs/' + design_id + '.png';
}

function get_total_width () {
  var width = 0;
  for (var i in design_list) {
    width += $('#gallery').find('.list_item_' + i).width() + 2;
  }
  width -= 2;
  return width;
}

function load_image (id) {
  window.current_design = id;
  var $gallery = $('#gallery');

  $gallery.find('.list_item').removeClass('current');
  $gallery.find('.list_item_' + id).addClass('current');

  var left_margin = 450 - get_offset_left(id);
  if (left_margin > 0) {
    left_margin = 0;
  } else if (left_margin < - get_total_width() + 900) {
    left_margin = - get_total_width() + 900;
  }

  $gallery.find('.image-list').css({'margin-left': left_margin});

  $gallery.find('.title').html(design_list[id].title);
  $gallery.find('.author').html(design_list[id].author);

  var preload_image = new Image();
  preload_image.onload = function () {
    $gallery.find('.image-wrapper.preload').remove();
    $gallery.find('.frame').append('<div class="image-wrapper preload"><img src="' + get_url(design_list[id].id) + '" /></div>');
    $gallery.find('.image-wrapper.preload').fadeIn(700);
    if (window.loading !== 1) {
      window.loading = 1;
      setTimeout(function () {
        $gallery.find('.image-wrapper.loaded').remove();
        $gallery.find('.image-wrapper.preload').removeClass('preload').addClass('loaded');
        window.loading = 0;
      }, 700);
    }
  };
  preload_image.src = get_url(design_list[id].id);
}

function load_list (id) {
  var $gallery = $('#gallery');
  var $design_item = $('<img src="/designs/' + design_list[id].id + '_small.png" class="list_item list_item_' + id + '" />');
  $design_item.on('click', function(){
    load_image(id);
  });
  $gallery.find('.image-list').append($design_item);
}

function previous () {
  if (window.current_design === (design_list.length - 1)) {
    load_image(0);
  } else {
    load_image(window.current_design + 1);
  }
}

function next () {
  if (window.current_design === 0) {
    load_image(design_list.length - 1);
  } else {
    load_image(window.current_design - 1);
  }
}

$(document).ready(function () {
  window.loading = 0;
  window.current_design = 0;
  var $gallery = $('#gallery');
  for (var i in design_list) {
    load_list(i);
  }
  $gallery.find('.to-left').on('click', next);
  $gallery.find('.to-right').on('click', previous);
  $gallery.find('.view-design').on('click', function () {
    window.open('/designer/' + design_list[window.current_design].id);
  });
  $(document).on('keydown', function (e) {
    if (e.keyCode === 39) {
      previous();
    } else if (e.keyCode === 37) {
      next();
    }
  });

  load_image(0);
});