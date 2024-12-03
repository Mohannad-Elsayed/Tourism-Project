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
            alert('Please login to view this page.');
            window.location.href = 'register.html';
        }
    });

    // Handle Update Profile Form Submission
    document.getElementById('user-info-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        // Clear previous error messages
        ['usernameError', 'fullnameError', 'addressError', 'stateError', 'numberError', 'pictureError'].forEach(id => {
            document.getElementById(id).textContent = '';
        });

        // Get form values
        const username = document.getElementById('username').value.trim();
        const fullname = document.getElementById('fullname').value.trim();
        const address = document.getElementById('address').value.trim();
        const state = document.getElementById('state').value.trim();
        const number = document.getElementById('number').value.trim();
        const email = document.getElementById('email').value.trim();
        const profilePicture = document.getElementById('profilePictureInput').files[0];

        let isValid = true;

        // Validation
        if (username.length < 4) {
            isValid = false;
            document.getElementById('usernameError').textContent = 'Username must be at least 4 characters long.';
        }
        if (fullname.length < 4) {
            isValid = false;
            document.getElementById('fullnameError').textContent = 'Full name must be at least 4 characters long.';
        }
        if (address.length === 0) {
            isValid = false;
            document.getElementById('addressError').textContent = 'Please enter your address.';
        }
        if (state.length === 0) {
            isValid = false;
            document.getElementById('stateError').textContent = 'Please enter your state.';
        }
        const phoneRegex = /^[0-9]{1,11}$/;
        if (!phoneRegex.test(number)) {
            isValid = false;
            document.getElementById('numberError').textContent = 'Please enter a valid phone number (1-11 digits).';
        }

        if (!isValid) {
            return;
        }

        try {
            var profilePictureURL;
            db.collection('users').doc(userId).get()
                .then(doc => {
                    if (doc.exists) {
                        const usrdata = doc.data();
                        profilePictureURL = usrdata.profilePictureURL;
                    }
                });
            // Upload pfp
            console.log(profilePictureURL);
            if (profilePicture){
                const formData = new FormData();
                formData.append('file', profilePicture);
                formData.append('upload_preset', 'saprojectedu'); // Replace with your upload preset
    
                const cloudName = 'dprlulqf4'; // Replace with your Cloudinary cloud name
                const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData
                });
    
                if (!uploadResponse.ok) {
                    throw new Error('Image upload failed.');
                }
    
                const uploadData = await uploadResponse.json();
                profilePictureURL = uploadData.secure_url;
            }

            // Update user data in Firestore
            const userId = auth.currentUser.uid;
            await db.collection('users').doc(userId).update({
                username: username,
                fullname: fullname,
                address: address,
                state: state,
                number: number,
                profilePictureURL: profilePictureURL
            });

            alert('Profile updated successfully!');
            
            db.collection('users').doc(userId).get()
                .then(doc => {
                    if (doc.exists) {
                        const updatedData = doc.data();
                        displayUserInfo(updatedData, email);
                    }
                });
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });
});

function displayUserInfo(userData, email) {
    const userInfoDiv = document.getElementById('user-info');
    userInfoDiv.querySelector('#profilePicture').src = userData.profilePictureURL || 'default-profile.png';
    userInfoDiv.querySelector('#username').value = userData.username || '';
    userInfoDiv.querySelector('#fullname').value = userData.fullname || '';
    userInfoDiv.querySelector('#address').value = userData.address || '';
    userInfoDiv.querySelector('#state').value = userData.state || '';
    userInfoDiv.querySelector('#number').value = userData.number || '';
    userInfoDiv.querySelector('#email').value = email || '';
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