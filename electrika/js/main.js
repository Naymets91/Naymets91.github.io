$(function () {

    $('.galery__slider').slick({
        dots: false,  /* убрать точки  */
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear',
        arrows: false, /* убрать кноки  */
        prevArrow: ' <button class="click-btn slick-prev"> <img src="images/arrof-left.png" alt="prev"></button>',
        nextArrow: ' <button class="click-btn slick-next"> <img src="images/arrof-right.png" alt="next"></button>',
    });


});