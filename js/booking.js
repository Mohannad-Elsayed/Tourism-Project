// Function to display tours
function displayTours() {
    auth.onAuthStateChanged(function(user) {
        var registeredTours = [];
        if (user) {
            // Get user's registered tours
            db.collection('users').doc(user.uid).get()
                .then(function(doc) {
                    if (doc.exists) {
                        registeredTours = doc.data().registeredTours || [];
                    }
                    console.log(doc.data());
                    fetchAndDisplayTours(registeredTours);
                })
                .catch(function(error) {
                    console.error('Error fetching user data:', error);
                    fetchAndDisplayTours(registeredTours);
                });
        } else {
            // User not logged in
            fetchAndDisplayTours(registeredTours);
        }
    });
}

// Function to fetch tours and render them
function fetchAndDisplayTours(registeredTours) {
    var currentTime = new Date();
    db.collection('tours').get()
        .then(function(querySnapshot) {
            var tours = [];
            querySnapshot.forEach(function(doc) {
                var tour = doc.data();
                tour.id = doc.id;

                // Convert Firestore Timestamp to Date
                var startTime = tour.startTime.toDate();
                var maxParticipants = tour.maxParticipants;

                // Filter tours
                if (startTime > currentTime && maxParticipants > 0 && !registeredTours.includes(tour.id)) {
                    tours.push(tour);
                }
            });
            renderTours(tours);
        })
        .catch(function(error) {
            console.error('Error fetching tours:', error);
        });
}

// Function to render tours on the page
function renderTours(tours) {
    var tourCardsDiv = document.getElementById('tourCards');
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

        // Price
        var price = document.createElement('h3');
        price.className = 'mb-3';
        price.innerHTML = '$' + tour.price.toFixed(2);
        cardBody.appendChild(price);

        // Description
        var desc = document.createElement('p');
        desc.textContent = tour.description;
        cardBody.appendChild(desc);

        // "Book Now" button
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'd-flex justify-content-center mb-2';

        var bookButton = document.createElement('a');
        bookButton.className = 'btn btn-sm btn-primary px-3';
        bookButton.style.borderRadius = '30px';
        bookButton.textContent = 'Book Now';
        bookButton.href = '#';
        bookButton.onclick = function(event) {
            event.preventDefault();
            bookTour(tour.id);
        };
        buttonDiv.appendChild(bookButton);
        cardBody.appendChild(buttonDiv);

        cardDiv.appendChild(cardBody);
        colDiv.appendChild(cardDiv);
        rowDiv.appendChild(colDiv);
    });

    tourCardsDiv.appendChild(rowDiv);
}

// Declare a variable to store the selected tour ID
let selectedTourId = null;

// Function to handle booking
function bookTour(tourId) {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Store the selected tour ID
            selectedTourId = tourId;

            // Show the payment form with animation
            var paymentForm = document.getElementById('paymentForm');
            paymentForm.style.display = 'block';
            setTimeout(function() {
                paymentForm.classList.add('show');
            }, 10); // Slight delay to trigger transition
        } else {
            // Prompt the user to log in
            alert('Please log in to book a tour.');
            window.location.href = 'register.html';
        }
    });
}

// Add event listener for the "Cancel" button
document.getElementById('cancelPaymentBtn').addEventListener('click', function() {
    // Hide the payment form with animation
    var paymentForm = document.getElementById('paymentForm');
    paymentForm.classList.remove('show');
    setTimeout(function() {
        paymentForm.style.display = 'none';
    }, 500); // Match the transition duration
});

// Add event listener for the "Proceed" button
document.getElementById('proceedPaymentBtn').addEventListener('click', function(event) {
    event.preventDefault();
    
    event.preventDefault();
    let isValid = true;

    // Get form fields
    const name = document.getElementById('paymentname').value.trim();
    const email = document.getElementById('paymentemail').value.trim();
    const address = document.getElementById('paymentaddress').value.trim();
    const city = document.getElementById('paymentcity').value.trim();
    const state = document.getElementById('paymentstate').value.trim();
    const zip = document.getElementById('paymentzip').value.trim();
    const cardName = document.getElementById('paymentcardName').value.trim();
    const cardNum = document.getElementById('paymentcardNum').value.trim();
    const expMonth = document.getElementById('paymentexpMonth').value;
    const expYear = document.getElementById('paymentexpYear').value;
    const cvv = document.getElementById('paymentcvv').value.trim();

    let errorM = '';

    if (!name) {
        errorM = 'Name is required.';
        isValid = false;
    } else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorM = 'A valid email address is required.';
        isValid = false;
    } else if (!address) {
        errorM = 'Address is required.';
        isValid = false;
    } else if (!city) {
        errorM = 'City is required.';
        isValid = false;
    } else if (!state) {
        errorM = 'State is required.';
        isValid = false;
    } else if (!zip || !/^\d{5}$/.test(zip)) {
        errorM = 'A valid 5-digit ZIP code is required.';
        isValid = false;
    } else if (!cardName) {
        errorM = 'Cardholder name is required.';
        isValid = false;
    } else if (!cardNum || !/^\d{16}$/.test(cardNum)) {
        errorM = 'A valid 16-digit card number is required.';
        isValid = false;
    } else if (!expMonth) {
        errorM = 'A valid expiration month is required.';
        isValid = false;
    } else if (!expYear) {
        errorM = 'A valid expiration year is required.';
        isValid = false;
    } else if (!cvv || !/^\d{3}$/.test(cvv)) {
        errorM = 'A valid 3-digit CVV code is required.';
        isValid = false;
    }

    if (!isValid) {
        alert(errorM);
        return;
    }

    var user = auth.currentUser;
    if (user) {
        var userRef = db.collection('users').doc(user.uid);
        var tourRef = db.collection('tours').doc(selectedTourId);

        // Perform updates atomically using a transaction
        db.runTransaction(function(transaction) {
            return transaction.get(userRef).then(function(userDoc) {
                if (!userDoc.exists) {
                    throw "User does not exist!";
                }

                // Append the tour ID to registeredTours
                transaction.update(userRef, {
                    registeredTours: firebase.firestore.FieldValue.arrayUnion(selectedTourId)
                });

                // Decrement maxParticipants
                transaction.update(tourRef, {
                    maxParticipants: firebase.firestore.FieldValue.increment(-1)
                });
            });
        }).then(function() {
            // Redirect to dashboard.html after successful updates
            window.location.href = 'dashboard.html';
        }).catch(function(error) {
            console.error("Transaction failed: ", error);
            alert('Failed to proceed with booking. Please try again.');
        });
    } else {
        alert('User not authenticated.');
        window.location.href = 'register.html';
    }
});

// Call the function to display tours
displayTours();
