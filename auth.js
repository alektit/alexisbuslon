document.addEventListener('DOMContentLoaded', function() {
    // Add dark mode toggle functionality
    const darkModeBtn = document.querySelector('.dark-mode-toggle');
    const body = document.body;

    if (darkModeBtn) {
        // Check for saved dark mode preference on load
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            body.classList.add('dark-mode');
            darkModeBtn.innerHTML = '☀️';
        }

        darkModeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkModeBtn.innerHTML = isDark ? '☀️' : '🌙';
        });
    }

    // Add at the beginning of the existing event listener
    const trialBtn = document.getElementById('trialBtn');
    let trialTimer;

    if (trialBtn) {
        trialBtn.addEventListener('click', function() {
            // Set trial expiration time (5 minutes from now)
            const expirationTime = Date.now() + (5 * 60 * 1000);
            localStorage.setItem('trialExpiration', expirationTime);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', 'trial');
            
            // Initialize empty data for trial account
            initializeNewUserData('trial');
            
            // Redirect to main page
            window.location.href = 'index.html';
        });
    }

    const showAdminBtn = document.getElementById('showAdminBtn');
    const adminContent = document.querySelector('.admin-content');
    
    if (showAdminBtn) {
        showAdminBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            adminContent.classList.toggle('active');
        });
    }

    // Default registered users - making sure they exist on any device
    function ensureDefaultUsers() {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const defaultAdmin = {
            username: 'alexis02',
            password: 'alektit02'
        };

        // Add admin if not exists
        if (!users.some(u => u.username === defaultAdmin.username)) {
            users.push(defaultAdmin);
        }

        // Get activation codes
        const codes = JSON.parse(localStorage.getItem('activationCodes') || '[]');
        
        // Add all users who have used activation codes
        codes.forEach(code => {
            if (code.used && code.usedBy) {
                // Only add if user doesn't already exist
                if (!users.some(u => u.username === code.usedBy)) {
                    // Find the original registration data
                    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                    const userData = existingUsers.find(u => u.username === code.usedBy);
                    
                    if (userData) {
                        users.push({
                            username: userData.username,
                            password: userData.password
                        });
                    }
                }
            }
        });

        localStorage.setItem('users', JSON.stringify(users));
    }

    // Store registration data separately
    function storeRegistrationData(username, password) {
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        registeredUsers.push({ username, password });
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    // Check if user is already logged in
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const currentUser = localStorage.getItem('currentUser');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const trialExpiration = localStorage.getItem('trialExpiration');
        
        // Check if trial has expired
        if (currentUser === 'trial' && trialExpiration) {
            if (Date.now() > parseInt(trialExpiration)) {
                // Trial expired
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('trialExpiration');
                alert('Trial period has expired!');
                window.location.href = 'login.html';
                return;
            }
            
            // Update countdown if on main page
            if (currentPage === 'index.html') {
                const countdownElement = document.getElementById('trialCountdown');
                if (countdownElement) {
                    updateTrialCountdown(countdownElement, parseInt(trialExpiration));
                }
            }
        }

        if (isLoggedIn) {
            // If on login/register page but already logged in, redirect appropriately
            if (currentPage === 'login.html' || currentPage === 'register.html') {
                if (currentUser === 'alexis02') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html'; // Customer warranty records page
                }
            }
            // If trying to access admin page without being admin, redirect to index
            else if (currentPage === 'admin.html' && currentUser !== 'alexis02') {
                window.location.href = 'index.html';
            }
            // If on index page but is admin, redirect to admin panel
            else if (currentPage === 'index.html' && currentUser === 'alexis02') {
                window.location.href = 'admin.html';
            }
        } else {
            // If not logged in and not on login/register page, redirect to login
            if (currentPage !== 'login.html' && currentPage !== 'register.html') {
                window.location.href = 'login.html';
            }
        }
    }

    function updateTrialCountdown(element, expirationTime) {
        function updateTimer() {
            const now = Date.now();
            const timeLeft = expirationTime - now;
            
            if (timeLeft <= 0) {
                clearInterval(trialTimer);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('trialExpiration');
                window.location.href = 'login.html';
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            element.textContent = `Trial expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        updateTimer();
        trialTimer = setInterval(updateTimer, 1000);
    }

    // Enhanced logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear all session-related data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('trialExpiration');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }

    // Add maximize/minimize functionality for admin panel
    const adminMaximizeBtn = document.getElementById('adminMaximizeBtn');
    const adminPanel = document.querySelector('.admin-info');
    let isAdminMaximized = false;

    if (adminMaximizeBtn) {
        adminMaximizeBtn.addEventListener('click', function() {
            if (isAdminMaximized) {
                adminPanel.style.width = '400px';
                adminPanel.style.height = 'auto';
                adminMaximizeBtn.textContent = '□';
            } else {
                adminPanel.style.width = '100vw';
                adminPanel.style.height = '100vh';
                adminMaximizeBtn.textContent = '−';
            }
            isAdminMaximized = !isAdminMaximized;
        });
    }

    // Enhanced login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Check if it's admin login first
            if (username === 'alexis02' && password === 'alektit02') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', 'alexis02');
                window.location.href = 'admin.html';
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            
            const messageDiv = document.getElementById('loginMessage');
            if (messageDiv) {
                messageDiv.style.display = 'block';
                
                if (user) {
                    messageDiv.textContent = 'Login successful! Redirecting...';
                    messageDiv.className = 'auth-message success';
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('currentUser', username);
                    
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Customer warranty records page
                    }, 1000);
                } else {
                    messageDiv.textContent = 'Invalid username or password!';
                    messageDiv.className = 'auth-message error';
                }
            }
        });
    }

    // Remove the separate admin login form handler since we're handling it in the main login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const adminUsername = document.getElementById('adminUsername').value;
            const adminPassword = document.getElementById('adminPassword').value;
            
            if (adminUsername === 'alexis02' && adminPassword === 'alektit02') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', 'alexis02');
                window.location.href = 'admin.html';
            } else {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'auth-message error';
                messageDiv.textContent = 'Invalid admin credentials!';
                messageDiv.style.display = 'block';
                
                // Find the admin form and insert the message after it
                const adminForm = document.getElementById('adminLoginForm');
                if (adminForm.nextElementSibling) {
                    adminForm.parentNode.insertBefore(messageDiv, adminForm.nextElementSibling);
                } else {
                    adminForm.parentNode.appendChild(messageDiv);
                }
                
                // Remove the message after 3 seconds
                setTimeout(() => {
                    messageDiv.remove();
                }, 3000);
            }
        });
    }

    // Function to initialize empty customer data for new user
    function initializeNewUserData(username) {
        const userKey = `customers_${username}`;
        localStorage.setItem(userKey, JSON.stringify([]));
        localStorage.setItem(`totalPartsCost_${username}`, '0.00');
        localStorage.setItem(`totalServiceFee_${username}`, '0.00');
        localStorage.setItem(`totalEarnings_${username}`, '0.00');
        localStorage.setItem(`monthlyHistory_${username}`, JSON.stringify([]));
    }

    // Enhanced registration form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const activationCode = document.getElementById('activationCode').value;
            
            const messageDiv = document.getElementById('registerMessage');
            messageDiv.style.display = 'block';

            // Verify activation code
            const codes = JSON.parse(localStorage.getItem('activationCodes') || '[]');
            const validCode = codes.find(code => code.code === activationCode && !code.used);
            
            if (!validCode) {
                messageDiv.textContent = 'Invalid or used activation code!';
                messageDiv.className = 'auth-message error';
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (users.some(u => u.username === username)) {
                messageDiv.textContent = 'Username already exists!';
                messageDiv.className = 'auth-message error';
                return;
            }

            // Mark activation code as used
            validCode.used = true;
            validCode.usedBy = username;
            localStorage.setItem('activationCodes', JSON.stringify(codes));

            // Store registration data
            storeRegistrationData(username, password);

            // Create new user and initialize their data
            users.push({ username, password });
            localStorage.setItem('users', JSON.stringify(users));
            initializeNewUserData(username);
            
            messageDiv.textContent = 'Registration successful! Redirecting...';
            messageDiv.className = 'auth-message success';
            
            // Set login state and redirect
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', username);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }

    // Call ensureDefaultUsers on page load
    ensureDefaultUsers();
    checkAuth();
});