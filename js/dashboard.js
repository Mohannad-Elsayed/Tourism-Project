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
            let profilePictureURLjs;
            const userId = auth.currentUser.uid;
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                const usrdata = doc.data();
                profilePictureURLjs = usrdata.profilePictureURL;
            }
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
                profilePictureURLjs = uploadData.secure_url;
            }
            const profilePictureURLjsvar = profilePictureURLjs;
            // Update user data in Firestore
            await db.collection('users').doc(userId).update({
                username: username,
                fullname: fullname,
                address: address,
                state: state,
                number: number,
                profilePictureURL: profilePictureURLjsvar
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

    // Admin Dashboard Event Listeners
    const adminDashboard = document.getElementById('admin-dashboard');
    if (adminDashboard) {
        // Add Tour Form Submission
        document.getElementById('add-tour-form').addEventListener('submit', async function(event) {
            event.preventDefault();

            // Clear previous error messages
            ['tourIdError', 'tourNameAdminError', 'descriptionError', 'photoError', 'priceError', 'locationError', 'meetupLocationError', 'startTimeError', 'endTimeError', 'maxParticipantsError', 'ratingError', 'guideError'].forEach(id => {
                document.getElementById(id).textContent = '';
            });

            // Get form values
            const tourId = document.getElementById('tourId').value.trim();
            const tourName = document.getElementById('tourNameAdmin').value.trim();
            const description = document.getElementById('description').value.trim();
            const photoFile = document.getElementById('photo').files[0];
            const priceValue = document.getElementById('price').value.trim();
            const price = parseFloat(priceValue);
            const location = document.getElementById('location').value.trim();
            const meetupLocation = document.getElementById('meetupLocation').value.trim();
            const startTimeInput = document.getElementById('startTime').value;
            const endTimeInput = document.getElementById('endTime').value;
            const startTime = new Date(startTimeInput);
            const endTime = new Date(endTimeInput);
            const maxParticipantsValue = document.getElementById('maxParticipants').value.trim();
            const maxParticipants = parseInt(maxParticipantsValue);
            const ratingValue = document.getElementById('rating').value.trim();
            const guideName = document.getElementById('guide').value.trim();
            const rating = parseFloat(ratingValue);
            const guideId = document.getElementById('guide').value;

            let isValid = true;

            // Input validation and error messages
            if (!tourId) {
                isValid = false;
                document.getElementById('tourIdError').textContent = 'Tour ID is required.';
            }
            if (!tourName) {
                isValid = false;
                document.getElementById('tourNameAdminError').textContent = 'Tour Name is required.';
            }
            if (!guideName) {
                isValid = false;
                document.getElementById('guideError').textContent = 'Guide Name is required.';
            }
            if (!description) {
                isValid = false;
                document.getElementById('descriptionError').textContent = 'Description is required.';
            }
            if (!photoFile) {
                isValid = false;
                document.getElementById('photoError').textContent = 'Photo is required.';
            }
            if (!priceValue || isNaN(price)) {
                isValid = false;
                document.getElementById('priceError').textContent = 'Please enter a valid price.';
            }
            if (!location) {
                isValid = false;
                document.getElementById('locationError').textContent = 'Location is required.';
            }
            if (!meetupLocation) {
                isValid = false;
                document.getElementById('meetupLocationError').textContent = 'Meetup Location is required.';
            }
            if (!startTimeInput || isNaN(startTime.getTime())) {
                isValid = false;
                document.getElementById('startTimeError').textContent = 'Please enter a valid start time.';
            }
            if (!endTimeInput || isNaN(endTime.getTime())) {
                isValid = false;
                document.getElementById('endTimeError').textContent = 'Please enter a valid end time.';
            }
            if (!maxParticipantsValue || isNaN(maxParticipants)) {
                isValid = false;
                document.getElementById('maxParticipantsError').textContent = 'Please enter a valid number of participants.';
            }
            if (!ratingValue || isNaN(rating)) {
                isValid = false;
                document.getElementById('ratingError').textContent = 'Please enter a valid rating.';
            }
            if (!guideId) {
                isValid = false;
                document.getElementById('guideError').textContent = 'Please select a guide.';
            }

            if (!isValid) {
                return;
            }

            try {
                // Check for duplicate ID
                const existingTour = await db.collection('tours').doc(tourId).get();
                if (existingTour.exists) {
                    alert('Tour ID already exists. Please use a unique ID.');
                    return;
                }

                // Upload photo to Cloudinary
                const formData = new FormData();
                formData.append('file', photoFile);
                formData.append('upload_preset', 'saprojectedu');

                const cloudName = 'dprlulqf4';
                const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Image upload failed.');
                }

                const uploadData = await uploadResponse.json();
                const photoURL = uploadData.secure_url;

                // Add tour to 'tours' collection
                await db.collection('tours').doc(tourId).set({
                    name: tourName,
                    description: description,
                    imageURL: photoURL,
                    price: price,
                    location: location,
                    meetupLocation: meetupLocation,
                    startTime: firebase.firestore.Timestamp.fromDate(startTime),
                    endTime: firebase.firestore.Timestamp.fromDate(endTime),
                    maxParticipants: maxParticipants,
                    rating: rating, 
                    guide: guideName, 
                    guideRef: db.collection('users').doc(guideId),
                    guideId: guideId
                });

                alert('Tour added successfully!');
                document.getElementById('add-tour-form').reset();
            } catch (error) {
                console.error('Error adding tour:', error);
                alert('Failed to add tour. Please try again.');
            }
        });

        // Delete Tour Form Submission
        document.getElementById('delete-tour-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            const tourId = document.getElementById('deleteTourId').value.trim();

            if (!tourId) {
                alert('Please enter a tour ID.');
                return;
            }

            try {
                const tourDoc = await db.collection('tours').doc(tourId).get();
                if (tourDoc.exists) {
                    await db.collection('tours').doc(tourId).delete();
                    alert('Tour deleted successfully!');
                    document.getElementById('delete-tour-form').reset();
                } else {
                    alert('Tour not found.');
                }
            } catch (error) {
                console.error('Error deleting tour:', error);
                alert('Failed to delete tour. Please try again.');
            }
        });

        // Update Access Form Submission
        document.getElementById('update-access-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('userEmail').value.trim();
            const newAccessLevel = document.getElementById('newAccessLevel').value;

            if (!email || !newAccessLevel) {
                alert('Please provide both email and access level.');
                return;
            }

            try {
                const userQuerySnapshot = await db.collection('users').where('email', '==', email).get();
                if (!userQuerySnapshot.empty) {
                    if (email == auth.currentUser.email) {
                        throw new Error('Can\'t change your own access level.');
                    }
                    const userDoc = userQuerySnapshot.docs[0];
                    await db.collection('users').doc(userDoc.id).update({
                        access: newAccessLevel
                    });
                    alert('User access level updated successfully!');
                    document.getElementById('update-access-form').reset();
                } else {
                    alert('User not found.');
                }
            } catch (error) {
                console.error('Error updating user access:', error);
                alert('Failed to update user access. Please try again.');
            }
        });

        // Load Feedback
        function loadFeedback() {
            const feedbackContainer = document.getElementById('feedback-container');
            db.collection('feedback').orderBy('timestamp', 'desc').get()
                .then(querySnapshot => {
                    feedbackContainer.innerHTML = '';
                    querySnapshot.forEach(doc => {
                        const feedback = doc.data();
                        const feedbackCard = document.createElement('div');
                        feedbackCard.className = 'card mb-3';

                        const cardBody = document.createElement('div');
                        cardBody.className = 'card-body';

                        const cardTitle = document.createElement('h5');
                        cardTitle.className = 'card-title';
                        cardTitle.textContent = feedback.tourName;

                        const cardText = document.createElement('p');
                        cardText.className = 'card-text';
                        cardText.textContent = feedback.feedback;

                        const timestamp = document.createElement('p');
                        timestamp.className = 'card-text';
                        const feedbackDate = feedback.timestamp.toDate().toLocaleString();
                        timestamp.innerHTML = `<small class="text-muted">Submitted on ${feedbackDate}</small>`;

                        cardBody.appendChild(cardTitle);
                        cardBody.appendChild(cardText);
                        cardBody.appendChild(timestamp);
                        feedbackCard.appendChild(cardBody);

                        feedbackContainer.appendChild(feedbackCard);
                    });
                })
                .catch(error => {
                    console.error('Error fetching feedback:', error);
                });
        }

        // Call loadFeedback
        loadFeedback();

        // Load guides and populate the guide dropdown
        function loadGuides() {
            const guideSelect = document.getElementById('guide');
            db.collection('users').where('access', '==', 'guide').get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        const userData = doc.data();
                        const option = document.createElement('option');
                        option.value = doc.id; // Store guide's user ID
                        option.textContent = userData.name || userData.username || userData.email;
                        guideSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching guides:', error);
                });
        }

        // Call loadGuides to populate the dropdown
        loadGuides();
    }

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
    const adminDashboard = document.getElementById('admin-dashboard');

    if (accessLevel === 'tourist') {
        touristDashboard.style.display = 'block';
        guideDashboard.style.display = 'none';
        adminDashboard.style.display = 'none';
        // Load booked tours and feedback sections
        loadBookedTours();
    } else if (accessLevel === 'guide') {
        touristDashboard.style.display = 'none';
        guideDashboard.style.display = 'block';
        adminDashboard.style.display = 'none';
        // Load active tours section
        loadActiveTours();
    } else if (accessLevel === 'admin') {
        touristDashboard.style.display = 'none';
        guideDashboard.style.display = 'none';
        adminDashboard.style.display = 'block';
    } else {
        // If access level is undefined or unrecognized
        touristDashboard.style.display = 'none';
        guideDashboard.style.display = 'none';
        adminDashboard.style.display = 'none';
        console.warn('Unrecognized access level:', accessLevel);
    }
}


// Function to display tours
async function loadBookedTours() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('No authenticated user found.');
            return;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            console.error('User data not found.');
            return;
        }

        const registeredToursIDs = userDoc.data().registeredTours || [];
        const tourPromises = registeredToursIDs.map(tourID => db.collection('tours').doc(tourID).get());
        const tourDocs = await Promise.all(tourPromises);

        const registeredToursArr = tourDocs
            .filter(doc => doc.exists)
            .map(doc => doc.data());

        console.log(registeredToursArr);
        renderTours(registeredToursArr, 'tours-container');
    } catch (error) {
        console.error('Error fetching booked tours:', error);
    }
}


// Function to load active tours for guides
function loadActiveTours() {
    const activeToursContainer = document.getElementById('active-tours-container');
    const userId = auth.currentUser.uid;
    
    var activetours = [];

    db.collection('tours').where('guideId', '==', userId).get()
        .then(querySnapshot => {
            activeToursContainer.innerHTML = ''; // Clear existing content
            querySnapshot.forEach(doc => {
                const tour = doc.data();
                activetours.push(tour);
            });
            renderTours(activetours, 'active-tours-container');
        })
        .catch(error => {
            console.error('Error fetching active tours:', error);
        });
}

// Function to render tours on the page
function renderTours(tours, divName) {
    var tourCardsDiv = document.getElementById(divName);
    tourCardsDiv.innerHTML = ''; // Clear existing content

    var rowDiv = document.createElement('div');
    rowDiv.className = 'row g-4 justify-content-center';

    tours.forEach(function(tour) {
        var colDiv = document.createElement('div');
        colDiv.className = 'col-lg-4 col-md-6';

        var cardDiv = document.createElement('div');
        cardDiv.className = 'package-item';

        // Image banner
        var imgDiv = document.createElement('div');
        imgDiv.className = 'overflow-hidden';
        var img = document.createElement('img');
        img.className = 'img-fluid';
        img.src = tour.imageURL;
        imgDiv.appendChild(img);
        cardDiv.appendChild(imgDiv);

        // Details
        var detailsDiv = document.createElement('div');
        detailsDiv.className = 'd-flex border-bottom';

        // Location
        var locationSmall = document.createElement('small');
        locationSmall.className = 'flex-fill text-center border-end py-2';
        locationSmall.innerHTML = '<i class="fa fa-map-marker-alt text-primary me-2"></i>' + tour.location;
        detailsDiv.appendChild(locationSmall);

        // Start Time
        var timeSmall = document.createElement('small');
        timeSmall.className = 'flex-fill text-center border-end py-2';
        timeSmall.innerHTML = '<i class="fa fa-calendar-alt text-primary me-2"></i>' + tour.startTime.toDate().toLocaleDateString();
        detailsDiv.appendChild(timeSmall);

        // Participants
        var participantsSmall = document.createElement('small');
        participantsSmall.className = 'flex-fill text-center py-2';
        participantsSmall.innerHTML = '<i class="fa fa-user text-primary me-2"></i>' + tour.maxParticipants + ' Spots';
        detailsDiv.appendChild(participantsSmall);

        cardDiv.appendChild(detailsDiv);

        // Card body
        var cardBody = document.createElement('div');
        cardBody.className = 'text-center p-4';

        // Tour Name
        var title = document.createElement('h3');
        title.className = 'mb-3'; 
        title.textContent = tour.name;
        cardBody.appendChild(title);

        // Description
        var desc = document.createElement('p');
        desc.textContent = tour.description;
        cardBody.appendChild(desc);

        cardDiv.appendChild(cardBody);
        colDiv.appendChild(cardDiv);
        rowDiv.appendChild(colDiv);
    });
    tourCardsDiv.appendChild(rowDiv);
}


// Function to load feedback section for tourists
function loadFeedbackSection() {
    // Implement feedback loading if necessary
    // For example, fetching previous feedback or setting up feedback form handlers
}

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