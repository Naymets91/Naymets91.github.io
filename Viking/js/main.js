$(function () {

    $('.heroes__slide-img').slick({
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.heroes__slider-text',
        prevArrow: ' <button class="click-btn slick-prev"> <img src="images/arrof-left.png" alt="prev"></button>',
        nextArrow: ' <button class="click-btn slick-next"> <img src="images/arrof-right.png" alt="next"></button>'
    });


    $('.heroes__slider-text').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.heroes__slide-img',
        fade: true,
        arrows: false, /* убрать кноки  */
    });

});