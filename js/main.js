(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);

console.log('in:main.js :: isLoggedIn:', localStorage.getItem('isLoggedIn'));
if (localStorage.getItem('isLoggedIn') === null) {
    localStorage.setItem('isLoggedIn', 'false');
}

document.addEventListener('DOMContentLoaded', function () {
    const registerLoginBtn = document.getElementById('registerLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Function to update the button visibility
    function updateNavbar() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        console.log('User is logged in:', isLoggedIn);

        if (isLoggedIn) {
            registerLoginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            registerLoginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }

    // Initial button state
    updateNavbar();

    // Handle Logout
    logoutBtn.addEventListener('click', async function () {
        console.log('Logout button clicked.', localStorage.getItem('isLoggedIn'));
        // Log out from Firebase if used
        if (firebase && firebase.auth) {
            try {
                await firebase.auth().signOut();
                console.log('User signed out.');
            } catch (error) {
                console.error('Sign out error:', error);
                return; // Exit early if sign-out fails
            }
        }

        // Clear login status
        localStorage.setItem('isLoggedIn', 'false');

        // Update UI
        updateNavbar();

        // Redirect user after logout
        window.location.href = 'index.html';
    });
});