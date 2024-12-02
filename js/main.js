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
    
    // Initialize Firebase
    const firebaseConfig = {
      // Your Firebase configuration
    };
    firebase.initializeApp(firebaseConfig);

    // Initialize Firestore
    const db = firebase.firestore();

    // Update Nav-Bar Based on Auth State
    firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
        try {
          const userDoc = await db.collection('users').doc(user.uid).get();
          const userData = userDoc.data();
          const profilePictureURL = userData.profilePictureURL || 'img/default-profile.png';
          updateNavBarForLoggedInUser(profilePictureURL);
        } catch (error) {
          console.error('Error fetching user data:', error);
          updateNavBarForLoggedInUser('img/default-profile.png');
        }
      } else {
        updateNavBarForLoggedOutUser();
      }
    });

    function updateNavBarForLoggedInUser(profilePictureURL) {
      document.getElementById('nav-register-login').style.display = 'none';
      document.getElementById('nav-profile').style.display = 'block';
      document.getElementById('nav-profile-img').src = profilePictureURL;
    }

    function updateNavBarForLoggedOutUser() {
      document.getElementById('nav-register-login').style.display = 'block';
      document.getElementById('nav-profile').style.display = 'none';
    }

    document.getElementById('logout').addEventListener('click', function(e) {
      e.preventDefault();
      firebase.auth().signOut().then(function() {
        window.location.href = 'index.html';
      }).catch(function(error) {
        console.error('Sign Out Error:', error);
      });
    });

})(jQuery);
