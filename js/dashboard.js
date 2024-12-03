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
                        const accessLevel = userData.access; // Fetch the 'access' field
                        displayUserInfo(userData, user.email);
                        displayDashboardBasedOnAccess(accessLevel);
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
        const profilePictureFile = document.getElementById('profilePictureInput').files[0];

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
            const userId = auth.currentUser.uid;
            let profilePictureURL;

            // Fetch current profile picture URL
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                const usrdata = doc.data();
                profilePictureURL = usrdata.profilePictureURL;
            }

            // Upload new profile picture if provided
            if (profilePicture) {
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
            await db.collection('users').doc(userId).update({
                username: username,
                fullname: fullname,
                address: address,
                state: state,
                number: number,
                profilePictureURL: profilePictureURL
            });

            alert('Profile updated successfully!');

            // Fetch updated user data and display it
            const updatedDoc = await db.collection('users').doc(userId).get();
            if (updatedDoc.exists) {
                const updatedData = updatedDoc.data();
                displayUserInfo(updatedData, email);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });

    // Additional functions can be added here, such as handling booked tours and feedback
});

// Function to display user info
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

// Function to display dashboard based on access level
function displayDashboardBasedOnAccess(accessLevel) {
    const touristDashboard = document.getElementById('tourist-dashboard');
    const guideDashboard = document.getElementById('guide-dashboard');

    if (accessLevel === 'tourist') {
        touristDashboard.style.display = 'block';
        guideDashboard.style.display = 'none';
        // Load booked tours and feedback sections
        loadBookedTours();
        loadFeedbackSection();
    } else if (accessLevel === 'guide') {
        touristDashboard.style.display = 'none';
        guideDashboard.style.display = 'block';
        // Load active tours section
        loadActiveTours();
    } else {
        // If access level is undefined or unrecognized
        touristDashboard.style.display = 'none';
        guideDashboard.style.display = 'none';
        console.warn('Unrecognized access level:', accessLevel);
    }
}

// Function to load booked tours for tourists
function loadBookedTours() {
    const toursContainer = document.getElementById('tours-container');
    const userId = auth.currentUser.uid;

    db.collection('bookings').where('userId', '==', userId).get()
        .then(querySnapshot => {
            toursContainer.innerHTML = ''; // Clear existing content
            querySnapshot.forEach(doc => {
                const tour = doc.data();
                const tourCard = createTourCard(tour);
                toursContainer.appendChild(tourCard);
            });
        })
        .catch(error => {
            console.error('Error fetching booked tours:', error);
        });
}

// Function to load active tours for guides
function loadActiveTours() {
    const activeToursContainer = document.getElementById('active-tours-container');
    const userId = auth.currentUser.uid;

    db.collection('tours').where('guideId', '==', userId).where('status', '==', 'active').get()
        .then(querySnapshot => {
            activeToursContainer.innerHTML = ''; // Clear existing content
            querySnapshot.forEach(doc => {
                const tour = doc.data();
                const tourCard = createTourCard(tour);
                activeToursContainer.appendChild(tourCard);
            });
        })
        .catch(error => {
            console.error('Error fetching active tours:', error);
        });
}

// Function to create a tour card (used for both booked and active tours)
function createTourCard(tour) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';

    const card = document.createElement('div');
    card.className = 'card h-100';

    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = tour.imageURL || 'default-tour.jpg';
    img.alt = tour.name;
    card.appendChild(img);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = tour.name;
    cardBody.appendChild(cardTitle);

    const cardText = document.createElement('p');
    cardText.className = 'card-text';
    cardText.textContent = tour.description || 'No description available.';
    cardBody.appendChild(cardText);

    card.appendChild(cardBody);

    return col.appendChild(card);
}

// Function to load feedback section for tourists
function loadFeedbackSection() {
    // Implement feedback loading if necessary
    // For example, fetching previous feedback or setting up feedback form handlers
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