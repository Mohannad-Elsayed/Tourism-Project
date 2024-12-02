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



//! delete if not working properly
// localStorage.setItem('isLoggedIn', 'false');

// // Firebase initialization (if not already initialized)
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "sa-project-edu.firebaseapp.com",
//     projectId: "sa-project-edu",
//     storageBucket: "sa-project-edu.appspot.com",
//     messagingSenderId: "360441031760",
//     appId: "1:360441031760:web:74b6f95d885cef9934b555",
//     measurementId: "G-6C2JWVGH4Y"
// };
// firebase.initializeApp(firebaseConfig);




// Check login status and update navbar buttons
document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const registerLoginBtn = document.getElementById('registerLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // if (isLoggedIn) {
    //     registerLoginBtn.style.display = 'none';
    //     logoutBtn.style.display = 'inline-block';
    // } else {
    //     registerLoginBtn.style.display = 'inline-block';
    //     logoutBtn.style.display = 'none';
    // }

    // Logout button click handler
    logoutBtn.addEventListener('click', function () {
        // Clear login status
        localStorage.setItem('isLoggedIn', 'false');
        // Optionally sign out from Firebase Auth if used
        if (firebase && firebase.auth) {
            firebase.auth().signOut().then(function () {
                console.log('User signed out.');
                window.location.href = 'index.html'; // Redirect to homepage
            }).catch(function (error) {
                console.error('Sign out error:', error);
            });
        } else {
            // If not using Firebase Auth, simply redirect
            window.location.href = 'index.html'; // Redirect to homepage
        }

        // Update button visibility
        // registerLoginBtn.style.display = 'inline-block';
        // logoutBtn.style.display = 'none';
    });
});
