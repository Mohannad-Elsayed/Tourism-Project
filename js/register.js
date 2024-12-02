// Initialize Firebase (Ensure this is at the top of your register.js)
const firebaseConfig = {
    apiKey: "AIzaSyBB_8JRR7pehfVX2lNy_xJWwkSSlKgYghU",
    authDomain: "sa-project-edu.firebaseapp.com",
    projectId: "sa-project-edu",
    // Remove or comment out storageBucket if not using Firebase Storage
    // storageBucket: "sa-project-edu.appspot.com",
    messagingSenderId: "360441031760",
    appId: "1:360441031760:web:74b6f95d885cef9934b555",
    measurementId: "G-6C2JWVGH4Y"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// JavaScript Validation for Registration Form
document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form submission

    // Clear previous error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('pictureError').textContent = '';
    document.getElementById('termsError').textContent = '';

    // Get form values
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value.trim();
    const profilePicture = document.getElementById('profilePicture').files[0];
    const termsChecked = document.getElementById('termsCheck').checked;

    // Regular expressions for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{1,11}$/;

    let isValid = true;

    // Name Validation
    if (name.length < 4) {
        isValid = false;
        document.getElementById('nameError').textContent = 'Name must be at least 4 characters long.';
    }

    // Email Validation
    if (!emailRegex.test(email)) {
        isValid = false;
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
    }

    // Password Validation
    if (password.length < 8) {
        isValid = false;
        document.getElementById('passwordError').textContent = 'Password must be at least 8 characters long.';
    }

    // Phone Number Validation
    if (!phoneRegex.test(phone)) {
        isValid = false;
        document.getElementById('phoneError').textContent = 'Please enter a valid phone number (up to 11 digits).';
    }

    // Profile Picture Validation
    if (!profilePicture) {
        isValid = false;
        document.getElementById('pictureError').textContent = 'Please upload a profile picture.';
    }

    // Terms and Conditions Validation
    if (!termsChecked) {
        isValid = false;
        document.getElementById('termsError').textContent = 'You must agree to the Privacy Terms.';
    }

    if (!isValid) {
        // Scroll to the top of the form to show errors
        this.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    try {
        // Show a loading indicator or disable the register button if desired

        // Create user with Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Upload profile picture to Cloudinary
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
        const profilePictureURL = uploadData.secure_url;

        // Create user data object
        const userData = {
            name: name,
            email: email,
            phone: phone,
            profilePictureURL: profilePictureURL,
            coupons: [], // Initialize with an empty array or default coupons
            registeredTours: [] // Initialize with an empty array
        };

        // Store user data in Firestore under 'users' collection
        await db.collection('users').doc(user.uid).set(userData);

        // Optionally, send email verification
        await user.sendEmailVerification();

        // Notify the user of successful registration
        alert('Registration successful! Please check your email to verify your account.');

        // !Redirect the user or reset the form
        window.location.href = 'index.html'; // Redirect to login page
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed: ' + error.message);
    }
});

// JavaScript Validation for Login Form
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission

    // Clear previous error messages
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';

    // Get form values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    // Email Validation
    if (!emailRegex.test(email)) {
        isValid = false;
        document.getElementById('loginEmailError').textContent = 'Please enter a valid email address.';
    }

    // Password Validation
    if (password.length === 0) {
        isValid = false;
        document.getElementById('loginPasswordError').textContent = 'Please enter your password.';
    }

    if (!isValid) {
        // Scroll to the top of the form to show errors
        this.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    try {
        // Show a loading indicator or disable the login button if desired

        // Sign in with Firebase Authentication
        await auth.signInWithEmailAndPassword(email, password);

        // Optionally, check if email is verified
        const user = auth.currentUser;
        if (user && !user.emailVerified) {
            alert('Please verify your email before logging in.');
            return;
        }

        // Redirect the user to the dashboard or home page
        window.location.href = 'dashboard.html'; // Replace with your desired route
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed: ' + error.message);
    }
});