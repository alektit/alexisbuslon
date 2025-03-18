document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser !== 'alexis02') {
        window.location.href = 'login.html';
    }

    const generateBtn = document.getElementById('generateCode');
    const codesTableBody = document.getElementById('activationCodesTable').querySelector('tbody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Enhanced code generation function
    function generateActivationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 12; i++) { // Increased to 12 characters for better security
            code += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i === 3 || i === 7) code += '-'; // Add hyphens for better readability
        }
        
        const existingCodes = JSON.parse(localStorage.getItem('activationCodes') || '[]');
        if (existingCodes.some(c => c.code === code)) {
            return generateActivationCode();
        }
        
        return code;
    }

    function displayCodes() {
        const codes = JSON.parse(localStorage.getItem('activationCodes') || '[]');
        codesTableBody.innerHTML = '';
        
        codes.forEach((codeObj, index) => {
            const row = codesTableBody.insertRow();
            const date = new Date(codeObj.generatedDate).toLocaleString();
            row.innerHTML = `
                <td><strong>${codeObj.code}</strong></td>
                <td>${codeObj.used ? 
                    '<span style="color: #dc3545;">Used by ' + codeObj.usedBy + '</span>' : 
                    '<span style="color: #28a745;">Available</span>'}
                </td>
                <td>${date}</td>
                <td>
                    <button class="delete-button" onclick="deleteCode(${index})">
                        Delete
                    </button>
                </td>
            `;
        });
    }

    generateBtn.addEventListener('click', function() {
        const newCode = generateActivationCode();
        const codes = JSON.parse(localStorage.getItem('activationCodes') || '[]');
        
        codes.push({
            code: newCode,
            used: false,
            generatedDate: new Date().toISOString()
        });
        
        localStorage.setItem('activationCodes', JSON.stringify(codes));
        displayCodes();
    });

    window.deleteCode = function(index) {
        if (confirm('Are you sure you want to delete this activation code? This will permanently delete the associated user account.')) {
            const codes = JSON.parse(localStorage.getItem('activationCodes') || '[]');
            const codeToDelete = codes[index];

            if (codeToDelete.used) {
                // Delete the associated user
                const usernameToDelete = codeToDelete.usedBy;
                let users = JSON.parse(localStorage.getItem('users') || '[]');
                users = users.filter(user => user.username !== usernameToDelete);
                localStorage.setItem('users', JSON.stringify(users));

                // Also clear the user's data from local storage
                localStorage.removeItem(`customers_${usernameToDelete}`);
                localStorage.removeItem(`totalPartsCost_${usernameToDelete}`);
                localStorage.removeItem(`totalServiceFee_${usernameToDelete}`);
                localStorage.removeItem(`totalEarnings_${usernameToDelete}`);
                localStorage.removeItem(`monthlyHistory_${usernameToDelete}`);
                localStorage.removeItem(`historyCollapsed_${usernameToDelete}`);

            }

            codes.splice(index, 1);
            localStorage.setItem('activationCodes', JSON.stringify(codes));
            displayCodes();
        }
    };

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

    // Enhanced logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear all session-related data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('trialExpiration');
            
            // Force redirect to login page
            window.location.replace('login.html');
        });
    }

    // Initial display of codes
    displayCodes();
});