const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const signInBtn = document.getElementById('signIn');
const form = document.querySelector("form"),
    emailField = form.querySelector(".email-field"),
    emailInput = emailField.querySelector(".email"),
    passField = form.querySelector(".create-password"),
    passInput = passField.querySelector(".password"),
    cPassField = form.querySelector(".confirm-password"),
    cPassInput = cPassField.querySelector(".cPassword"),
    emailError = emailField.querySelector(".error"),
    passError = passField.querySelector(".error"),
    cPassError = cPassField.querySelector(".error"), 
    signInEmail = document.querySelector('.email-login'), 
    signInPass = document.querySelector('.pass-login');

//set default local storage items
localStorage.setItem("userEmail", 'ex@ex.com');
localStorage.setItem("userPassword", '123');

localStorage.setItem("x", "false");
signInBtn.addEventListener('click', () => {
    clearErrors();
    
    const email = signInEmail.value;
    const password = signInPass.value;
    
    const storedEmail = localStorage.getItem("userEmail");
    const storedPassword = localStorage.getItem("userPassword");
    
    if (email === storedEmail && password === storedPassword) {
        // Sign in successful
        console.log(localStorage.getItem("userEmail"));
        console.log(localStorage.getItem("userPassword"));
        console.log('Sign-in successful');
        localStorage.setItem("x", "true");
        // go to home
        window.location.href = "../../hager-ahmed/HTML/home.html";
    } else {
        // Sign in failed
        console.log(localStorage.getItem("userEmail"));
        console.log(localStorage.getItem("userPassword"));
        console.log('Sign-in failed');
        // Display error message
        emailError.textContent = 'Invalid email or password';
        alert('Invalid email or password');
    }
});

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Email Validation
function checkEmail() {
    const emaiPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailInput.value.match(emaiPattern)) {
        return emailField.classList.add("invalid"), emailError.textContent = "Please enter a valid email address.";
    }
    emailField.classList.remove("invalid"), emailError.textContent = "";
}

// Password Validation
function createPass() {
    const passPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passInput.value.match(passPattern)) {
        return passField.classList.add("invalid"), passError.textContent = "Invalid, enter a valid password.";
    }
    passField.classList.remove("invalid"), passError.textContent = "";
}

// Confirm Password Validtion
function confirmPass() {
    if (passInput.value !== cPassInput.value || cPassInput.value === "") {
        return cPassField.classList.add("invalid"), cPassError.textContent = "Passwords do not match.";
    }
    cPassField.classList.remove("invalid"), cPassError.textContent = "";
}

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

const signUpButton = document.querySelector('.signup-button');
// Register functionality
signUpButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passInput.value;
    if (!checkEmail() && !createPass() && !confirmPass()){
        // ! Store user credentials in local storage
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);
        alert('User Registered Successfully. Please login.');
        signInEmail.placeholder = email;
        signInPass.placeholder = password;
    }
});

function clearErrors() {
    emailError.textContent = '';
    passError.textContent = '';
    cPassError.textContent = '';
}