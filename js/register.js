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
    const profilePicture = document.getElementById('profilePictureInput').files[0];
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
            username: name,
            email: email,
            phone: phone,
            profilePictureURL: profilePictureURL,
            coupons: [], // Initialize with an empty array or default coupons
            registeredTours: [], // Initialize with an empty array
            access: 'tourist' 
        };

        // Store user data in Firestore under 'users' collection
        await db.collection('users').doc(user.uid).set(userData);

        // Optionally, send email verification
        await user.sendEmailVerification();

        // Notify the user of successful registration
        alert('Registration successful! Please check your email to verify your account. Then you can login.');

        window.location.href = 'register.html'; // Redirect to login page
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed: ' + error.message);
    }
});


// Auth error messages
const AUTH_ERROR_CODES = {
    ADMIN_ONLY_OPERATION: "auth/admin-restricted-operation",
    ARGUMENT_ERROR: "auth/argument-error",
    APP_NOT_AUTHORIZED: "auth/app-not-authorized",
    APP_NOT_INSTALLED: "auth/app-not-installed",
    CAPTCHA_CHECK_FAILED: "auth/captcha-check-failed",
    CODE_EXPIRED: "auth/code-expired",
    CORDOVA_NOT_READY: "auth/cordova-not-ready",
    CORS_UNSUPPORTED: "auth/cors-unsupported",
    CREDENTIAL_ALREADY_IN_USE: "auth/credential-already-in-use",
    CREDENTIAL_MISMATCH: "auth/custom-token-mismatch",
    CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "auth/requires-recent-login",
    DEPENDENT_SDK_INIT_BEFORE_AUTH: "auth/dependent-sdk-initialized-before-auth",
    DYNAMIC_LINK_NOT_ACTIVATED: "auth/dynamic-link-not-activated",
    EMAIL_CHANGE_NEEDS_VERIFICATION: "auth/email-change-needs-verification",
    EMAIL_EXISTS: "auth/email-already-in-use",
    EMULATOR_CONFIG_FAILED: "auth/emulator-config-failed",
    EXPIRED_OOB_CODE: "auth/expired-action-code",
    EXPIRED_POPUP_REQUEST: "auth/cancelled-popup-request",
    INTERNAL_ERROR: "auth/internal-error",
    INVALID_API_KEY: "auth/invalid-api-key",
    INVALID_APP_CREDENTIAL: "auth/invalid-app-credential",
    INVALID_APP_ID: "auth/invalid-app-id",
    INVALID_AUTH: "auth/invalid-user-token",
    INVALID_AUTH_EVENT: "auth/invalid-auth-event",
    INVALID_CERT_HASH: "auth/invalid-cert-hash",
    INVALID_CODE: "auth/invalid-verification-code",
    INVALID_CONTINUE_URI: "auth/invalid-continue-uri",
    INVALID_CORDOVA_CONFIGURATION: "auth/invalid-cordova-configuration",
    INVALID_CUSTOM_TOKEN: "auth/invalid-custom-token",
    INVALID_DYNAMIC_LINK_DOMAIN: "auth/invalid-dynamic-link-domain",
    INVALID_EMAIL: "auth/invalid-email",
    INVALID_EMULATOR_SCHEME: "auth/invalid-emulator-scheme",
    INVALID_IDP_RESPONSE: "auth/invalid-credential",
    INVALID_LOGIN_CREDENTIALS: "auth/invalid-credential",
    INVALID_MESSAGE_PAYLOAD: "auth/invalid-message-payload",
    INVALID_MFA_SESSION: "auth/invalid-multi-factor-session",
    INVALID_OAUTH_CLIENT_ID: "auth/invalid-oauth-client-id",
    INVALID_OAUTH_PROVIDER: "auth/invalid-oauth-provider",
    INVALID_OOB_CODE: "auth/invalid-action-code",
    INVALID_ORIGIN: "auth/unauthorized-domain",
    INVALID_PASSWORD: "auth/wrong-password",
    INVALID_PERSISTENCE: "auth/invalid-persistence-type",
    INVALID_PHONE_NUMBER: "auth/invalid-phone-number",
    INVALID_PROVIDER_ID: "auth/invalid-provider-id",
    INVALID_RECIPIENT_EMAIL: "auth/invalid-recipient-email",
    INVALID_SENDER: "auth/invalid-sender",
    INVALID_SESSION_INFO: "auth/invalid-verification-id",
    INVALID_TENANT_ID: "auth/invalid-tenant-id",
    MFA_INFO_NOT_FOUND: "auth/multi-factor-info-not-found",
    MFA_REQUIRED: "auth/multi-factor-auth-required",
    MISSING_ANDROID_PACKAGE_NAME: "auth/missing-android-pkg-name",
    MISSING_APP_CREDENTIAL: "auth/missing-app-credential",
    MISSING_AUTH_DOMAIN: "auth/auth-domain-config-required",
    MISSING_CODE: "auth/missing-verification-code",
    MISSING_CONTINUE_URI: "auth/missing-continue-uri",
    MISSING_IFRAME_START: "auth/missing-iframe-start",
    MISSING_IOS_BUNDLE_ID: "auth/missing-ios-bundle-id",
    MISSING_OR_INVALID_NONCE: "auth/missing-or-invalid-nonce",
    MISSING_MFA_INFO: "auth/missing-multi-factor-info",
    MISSING_MFA_SESSION: "auth/missing-multi-factor-session",
    MISSING_PHONE_NUMBER: "auth/missing-phone-number",
    MISSING_SESSION_INFO: "auth/missing-verification-id",
    MODULE_DESTROYED: "auth/app-deleted",
    NEED_CONFIRMATION: "auth/account-exists-with-different-credential",
    NETWORK_REQUEST_FAILED: "auth/network-request-failed",
    NULL_USER: "auth/null-user",
    NO_AUTH_EVENT: "auth/no-auth-event",
    NO_SUCH_PROVIDER: "auth/no-such-provider",
    OPERATION_NOT_ALLOWED: "auth/operation-not-allowed",
    OPERATION_NOT_SUPPORTED: "auth/operation-not-supported-in-this-environment",
    POPUP_BLOCKED: "auth/popup-blocked",
    POPUP_CLOSED_BY_USER: "auth/popup-closed-by-user",
    PROVIDER_ALREADY_LINKED: "auth/provider-already-linked",
    QUOTA_EXCEEDED: "auth/quota-exceeded",
    REDIRECT_CANCELLED_BY_USER: "auth/redirect-cancelled-by-user",
    REDIRECT_OPERATION_PENDING: "auth/redirect-operation-pending",
    REJECTED_CREDENTIAL: "auth/rejected-credential",
    SECOND_FACTOR_ALREADY_ENROLLED: "auth/second-factor-already-in-use",
    SECOND_FACTOR_LIMIT_EXCEEDED: "auth/maximum-second-factor-count-exceeded",
    TENANT_ID_MISMATCH: "auth/tenant-id-mismatch",
    TIMEOUT: "auth/timeout",
    TOKEN_EXPIRED: "auth/user-token-expired",
    TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests",
    UNAUTHORIZED_DOMAIN: "auth/unauthorized-continue-uri",
    UNSUPPORTED_FIRST_FACTOR: "auth/unsupported-first-factor",
    UNSUPPORTED_PERSISTENCE: "auth/unsupported-persistence-type",
    UNSUPPORTED_TENANT_OPERATION: "auth/unsupported-tenant-operation",
    UNVERIFIED_EMAIL: "auth/unverified-email",
    USER_CANCELLED: "auth/user-cancelled",
    USER_DELETED: "auth/user-not-found",
    USER_DISABLED: "auth/user-disabled",
    USER_MISMATCH: "auth/user-mismatch",
    USER_SIGNED_OUT: "auth/user-signed-out",
    WEAK_PASSWORD: "auth/weak-password",
    WEB_STORAGE_UNSUPPORTED: "auth/web-storage-unsupported",
    ALREADY_INITIALIZED: "auth/already-initialized",
    RECAPTCHA_NOT_ENABLED: "auth/recaptcha-not-enabled",
    MISSING_RECAPTCHA_TOKEN: "auth/missing-recaptcha-token",
    INVALID_RECAPTCHA_TOKEN: "auth/invalid-recaptcha-token",
    INVALID_RECAPTCHA_ACTION: "auth/invalid-recaptcha-action",
    MISSING_CLIENT_TYPE: "auth/missing-client-type",
    MISSING_RECAPTCHA_VERSION: "auth/missing-recaptcha-version",
    INVALID_RECAPTCHA_VERSION: "auth/invalid-recaptcha-version",
    INVALID_REQ_TYPE: "auth/invalid-req-type"
};

const errorMessages = {
    'auth/admin-restricted-operation': 'This operation is restricted to administrators only.',
    'auth/argument-error': 'An invalid argument was provided.',
    'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
    'auth/app-not-installed': 'The requested app is not installed on this device.',
    'auth/captcha-check-failed': 'The CAPTCHA check failed. Please try again.',
    'auth/code-expired': 'The verification code has expired. Please request a new code.',
    'auth/cordova-not-ready': 'Cordova framework is not ready.',
    'auth/cors-unsupported': 'This browser is not supported for CORS requests.',
    'auth/credential-already-in-use': 'This credential is already associated with a different user account.',
    'auth/custom-token-mismatch': 'The custom token does not match the expected format.',
    'auth/requires-recent-login': 'Please log in again to perform this operation.',
    'auth/dependent-sdk-initialized-before-auth': 'A dependent SDK was initialized before Firebase Authentication.',
    'auth/dynamic-link-not-activated': 'Dynamic links are not activated for this project.',
    'auth/email-change-needs-verification': 'Email change needs verification.',
    'auth/email-already-in-use': 'The email address is already in use by another account.',
    'auth/emulator-config-failed': 'Failed to configure the emulator.',
    'auth/expired-action-code': 'The action code has expired. Please try again.',
    'auth/cancelled-popup-request': 'The popup request was cancelled.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/invalid-api-key': 'The API key provided is invalid.',
    'auth/invalid-app-credential': 'The app credential is invalid.',
    'auth/invalid-app-id': 'The app ID is invalid.',
    'auth/invalid-user-token': 'The user token is invalid.',
    'auth/invalid-auth-event': 'The authentication event is invalid.',
    'auth/invalid-cert-hash': 'The certificate hash is invalid.',
    'auth/invalid-verification-code': 'The verification code is invalid.',
    'auth/invalid-continue-uri': 'The continue URL is invalid.',
    'auth/invalid-cordova-configuration': 'The Cordova configuration is invalid.',
    'auth/invalid-custom-token': 'The custom token is invalid.',
    'auth/invalid-dynamic-link-domain': 'The dynamic link domain is invalid.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/invalid-emulator-scheme': 'The emulator scheme is invalid.',
    'auth/invalid-credential': 'The login credentials are invalid.',
    'auth/invalid-message-payload': 'The message payload is invalid.',
    'auth/invalid-multi-factor-session': 'The multi-factor session is invalid.',
    'auth/invalid-oauth-client-id': 'The OAuth client ID is invalid.',
    'auth/invalid-oauth-provider': 'The OAuth provider is invalid.',
    'auth/invalid-action-code': 'The action code is invalid.',
    'auth/unauthorized-domain': 'This domain is not authorized for OAuth operations.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-persistence-type': 'The persistence type is invalid.',
    'auth/invalid-phone-number': 'The phone number is invalid.',
    'auth/invalid-provider-id': 'The provider ID is invalid.',
    'auth/invalid-recipient-email': 'The recipient email is invalid.',
    'auth/invalid-sender': 'The sender email is invalid.',
    'auth/invalid-verification-id': 'The verification ID is invalid.',
    'auth/invalid-tenant-id': 'The tenant ID is invalid.',
    'auth/multi-factor-info-not-found': 'The multi-factor info was not found.',
    'auth/multi-factor-auth-required': 'Multi-factor authentication is required.',
    'auth/missing-android-pkg-name': 'The Android package name is missing.',
    'auth/missing-app-credential': 'The app credential is missing.',
    'auth/auth-domain-config-required': 'The authentication domain configuration is required.',
    'auth/missing-verification-code': 'The verification code is missing.',
    'auth/missing-continue-uri': 'The continue URL is missing.',
    'auth/missing-iframe-start': 'The iframe start is missing.',
    'auth/missing-ios-bundle-id': 'The iOS bundle ID is missing.',
    'auth/missing-or-invalid-nonce': 'The nonce is missing or invalid.',
    'auth/missing-multi-factor-info': 'The multi-factor info is missing.',
    'auth/missing-multi-factor-session': 'The multi-factor session is missing.',
    'auth/missing-phone-number': 'The phone number is missing.',
    'auth/missing-verification-id': 'The verification ID is missing.',
    'auth/app-deleted': 'The app has been deleted.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different credential.',
    'auth/network-request-failed': 'A network error occurred. Please try again.',
    'auth/null-user': 'The user is null.',
    'auth/no-auth-event': 'No authentication event found.',
    'auth/no-such-provider': 'No such provider found.',
    'auth/operation-not-allowed': 'This operation is not allowed.',
    'auth/operation-not-supported-in-this-environment': 'This operation is not supported in this environment.',
    'auth/popup-blocked': 'The popup was blocked by the browser.',
    'auth/popup-closed-by-user': 'The popup was closed by the user.',
    'auth/provider-already-linked': 'This provider is already linked to the user account.',
    'auth/quota-exceeded': 'The quota for this operation has been exceeded.',
    'auth/redirect-cancelled-by-user': 'The redirect was cancelled by the user.',
    'auth/redirect-operation-pending': 'A redirect operation is already pending.',
    'auth/rejected-credential': 'The credential was rejected.',
    'auth/second-factor-already-in-use': 'The second factor is already in use.',
    'auth/maximum-second-factor-count-exceeded': 'The maximum number of second factors has been exceeded.',
    'auth/tenant-id-mismatch': 'The tenant ID does not match.',
    'auth/timeout': 'The operation timed out. Please try again.',
    'auth/user-token-expired': 'The user token has expired.',
    'auth/too-many-requests': 'Too many requests. Please try again later.',
    'auth/unauthorized-continue-uri': 'The continue URL is unauthorized.',
    'auth/unsupported-first-factor': 'The first factor is not supported.',
    'auth/unsupported-persistence-type': 'The persistence type is not supported.',
    'auth/unsupported-tenant-operation': 'This operation is not supported for this tenant.',
    'auth/unverified-email': 'The email address is not verified.',
    'auth/user-cancelled': 'The user cancelled the operation.',
    'auth/user-not-found': 'No user found with this email address.',
    'auth/user-disabled': 'The user account has been disabled.',
    'auth/user-mismatch': 'The user does not match the provided credentials.',
    'auth/user-signed-out': 'The user has been signed out.',
    'auth/weak-password': 'The password is too weak. Please choose a stronger password.',
    'auth/web-storage-unsupported': 'Web storage is not supported by this browser.',
    'auth/already-initialized': 'Firebase has already been initialized.',
    'auth/recaptcha-not-enabled': 'reCAPTCHA is not enabled.',
    'auth/missing-recaptcha-token': 'The reCAPTCHA token is missing.',
    'auth/invalid-recaptcha-token': 'The reCAPTCHA token is invalid.',
    'auth/invalid-recaptcha-action': 'The reCAPTCHA action is invalid.',
    'auth/missing-client-type': 'The client type is missing.',
    'auth/missing-recaptcha-version': 'The reCAPTCHA version is missing.',
    'auth/invalid-recaptcha-version': 'The reCAPTCHA version is invalid.',
    'auth/invalid-req-type': 'The request type is invalid.'
};

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

        // Set login status
        localStorage.setItem('isLoggedIn', 'true');

        // Redirect the user to the homepage or dashboard
        console.log('User logged in successfully.', localStorage.getItem('isLoggedIn'));
        
        window.location.href = 'dashboard.html'; // Redirect to home page
        
    } catch (error) {
        console.error('Error during login:', error);
        console.log(JSON.parse(error.message));
        // Display user-friendly error message
        const errorMessage = 
        errorMessages[
            AUTH_ERROR_CODES[JSON.parse(error.message).error.message]] 
            || 'An unexpected error occurred. Please try again.';
        alert('Login failed: ' + errorMessage);
    }
});

// Forgot Password Functionality
document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
    event.preventDefault();
    const email = prompt('Please enter your email address to reset your password:');
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent. Please check your inbox.');
            })
            .catch((error) => {
                const errorMessage = errorMessages[AUTH_ERROR_CODES[error.code]] || 'An error occurred. Please try again.';
                alert('Error: ' + errorMessage);
            });
        }
});

