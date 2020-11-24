$(function () {
    $('.sl').slick({
        autoplay: true,
        autoplaySpeed: 3000,
        dots: true,
        prevArrow: ' <button class="click-btn slick-prev"> <img src="images/arrof-left.png" alt="prev"></button>',
        nextArrow: ' <button class="click-btn slick-next"> <img src="images/arrof-right.png" alt="next"></button>',
        fade: true,
        responsive: [
            {
                breakpoint: 769,
                settings: {
                    arrows: false
                }
            }
        ]
    })



});


