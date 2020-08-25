import Animate from 'animate.js';
import paroller from './vanilla.paroller';

// -------------------------- //
//   Navbar scroll triggers   //
// -------------------------- //

// Threshold for triggering the transparent navbar
const SCROLL_TOP_TRIGGER_THRESHOLD = 10;

// Threshold for triggering the white navbar
const SCROLL_TOP_UNTRIGGER_THRESHOLD = 20;

let lastScrollPos = 0;
function checkScrollPosition() {

    if (lastScrollPos <= SCROLL_TOP_UNTRIGGER_THRESHOLD && window.pageYOffset > SCROLL_TOP_UNTRIGGER_THRESHOLD) {
        window.requestAnimationFrame(function () {

            document.body.classList.add("opaque");
            document.body.classList.remove("scroll-top");

        });
    }
    else if (lastScrollPos > SCROLL_TOP_TRIGGER_THRESHOLD && window.pageYOffset <= SCROLL_TOP_TRIGGER_THRESHOLD) {
        window.requestAnimationFrame(function () {

            document.body.classList.remove("opaque");
            document.body.classList.add("scroll-top");

        });
    }

    lastScrollPos = window.pageYOffset;

}

window.addEventListener("scroll", checkScrollPosition);
window.addEventListener("resize", checkScrollPosition);
window.addEventListener("DOMContentLoaded", checkScrollPosition);

// ----------------------------- //
//   Navbar menu click handler   //
// ----------------------------- //

$(document).on('click', '[data-toggle=navbar-content]', function () {
    const toggler = $(this);
    const target = toggler.parent().parent();
    toggler.attr("aria-expanded", toggler.attr("aria-expanded") == "true" ? "false" : "true");
    target.toggleClass("open");
});

// ---------------------------------- //
//   Scroll animations and parallax   //
// ---------------------------------- //

document.addEventListener('DOMContentLoaded', () => {

    // Setup scroll-in animations
    // See https://www.npmjs.com/package/animate.js#element-overrides
    new Animate({ remove: false }).init();

    // Setup parallax animations
    // See https://www.npmjs.com/package/paroller.js#use
    paroller('.paroller');

});

// Some other random things
// Idk what they do
jQuery(function ($) {
    $('#ipl_search').on('click', 'a', function (e) {
        e.preventDefault();
        $('#search-layer').show().addClass('open');
        $('.searchbox input').focus();
    });
    $('#search-layer').on('click', '.closer', function (e) {
        e.preventDefault();
        $('#search-layer').hide().removeClass('open');
    });
    var windowWidth = $(window).width() || 0;
    if (windowWidth >= 992) {
        $('.messages-grid .sermondetail').each(function () {
            var parentContainer = $(this).closest('.sermons-container');
            $(this).appendTo(parentContainer);
        });
    }
    function scrollToAnchor(aid : string){
        var aTag = $("a[name='"+ aid +"']");
        $('html,body').animate({scrollTop: aTag.offset()!.top},'slow');
    }
    $('.series-link').on('click touchstart', function (e) {
        e.preventDefault();
        window.console.log(e);
        $('.sermondetail').hide();
        var seriesblock = $(this).data('openid');
        var container = $(this).closest('.sermon');
        if ($("#" + seriesblock).hasClass('open')) {
            $('.sermon').removeClass('open');
            $('.sermondetail').removeClass('open');
        } else {
            $('.sermon').removeClass('open');
            $('.sermondetail').removeClass('open');
            $(container).addClass('open');
            $("#" + seriesblock).addClass('open').slideDown();
            scrollToAnchor("#" + seriesblock);
        }
    });
    $('.sermondetail .closer').on('click touchstart', function (e) {
        e.preventDefault();
        var container = $(this).closest('.sermondetail');
        $('.sermon').removeClass('open');
        $(container).removeClass('open').hide();
    });
});
