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

// Function to handle booking
function bookTour(tourId) {
    // Add booking logic here
    alert('Booking tour with ID: ' + tourId);
}

// Call the function to display tours
displayTours();
