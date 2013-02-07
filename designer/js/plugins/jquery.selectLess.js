(function ($) {
    $.fn.selectLess = function (option) {
        if (!option || option === true) {
            this.on("selectstart", function () {
                return false;
            });
        } else {
            this.off("selectstart");
        }
    };
})(jQuery);