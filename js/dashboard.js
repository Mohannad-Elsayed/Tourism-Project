document.addEventListener('DOMContentLoaded', () => {
    // Check user authentication
    auth.onAuthStateChanged(user => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        console.log('User is logged in:', isLoggedIn);
        if (user && isLoggedIn) {
            // User is signed in, retrieve user data
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        displayUserInfo(userData, user.email);
                    } else {
                        console.error('No user data found!');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        } else {
            // No user is signed in, redirect to login page
            window.location.href = 'register.html';
        }
    });
});

function displayUserInfo(userData, email) {
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.innerHTML = `
        <h2>Welcome, ${userData.name}</h2>
        <img src="${userData.profilePictureURL}" alt="Profile Picture" class="img-thumbnail mb-3" style="width: 150px;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${userData.phone}</p>
    `;
}

function fetchBookedTours(userId) {
    db.collection('bookings').where('userId', '==', userId)
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                document.getElementById('tours-container').innerHTML = '<p>You have no booked tours.</p>';
                return;
            }

            querySnapshot.forEach(doc => {
                const booking = doc.data();
                // Fetch tour details
                db.collection('tours').doc(booking.tourId).get()
                    .then(tourDoc => {
                        if (tourDoc.exists) {
                            const tourData = tourDoc.data();
                            displayTourCard(tourData);
                        } else {
                            console.error('Tour not found');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching tour:', error);
                    });
            });
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
        });
}

function displayTourCard(tour) {
    const toursContainer = document.getElementById('tours-container');
    const tourCard = document.createElement('div');
    tourCard.classList.add('col-md-4');

    tourCard.innerHTML = `
    <div class="card mb-4">
        <img src="${tour.photoURL}" class="card-img-top" alt="${tour.name}">
        <div class="card-body">
            <h5 class="card-title">${tour.name}</h5>
            <p class="card-text">${tour.description}</p>
            <p class="card-text"><strong>Price:</strong> $${tour.price}</p>
        </div>
    </div>
`;

    toursContainer.appendChild(tourCard);
}

// Call fetchBookedTours after fetching user info
auth.onAuthStateChanged(user => {
    if (user) {
        fetchBookedTours(user.uid);
    }
});

// Feedback form submission
document.getElementById('feedback-form').addEventListener('submit', event => {
    event.preventDefault();

    // Get form values
    const tourName = document.getElementById('tourName').value.trim();
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const userId = auth.currentUser.uid;

    // Validate form inputs
    if (!tourName || !feedbackText) {
        alert('Please fill in all fields.');
        return;
    }

    // Save feedback to Firestore
    db.collection('feedback').add({
            userId: userId,
            tourName: tourName,
            feedback: feedbackText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert('Thank you for your feedback!');
            document.getElementById('feedback-form').reset();
        })
        .catch(error => {
            console.error('Error submitting feedback:', error);
        });
});

// Apply validation styles to the feedback form
(function() {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
})();