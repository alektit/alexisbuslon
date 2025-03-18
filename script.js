document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const customerForm = document.getElementById('new-customer-form');
    const customerTableBody = document.querySelector('#customer-table tbody');
    const totalPartsCostElement = document.getElementById('totalPartsCost');
    const totalServiceFeeElement = document.getElementById('totalServiceFee');
    const totalEarningsElement = document.getElementById('totalEarnings');

    // Verify required elements exist before proceeding
    if (!customerForm || !customerTableBody || !totalPartsCostElement || 
        !totalServiceFeeElement || !totalEarningsElement) {
        console.error('Required elements not found');
        return;
    }

    // Initialize customers array
    let customers = [];

    // Load existing data
    function loadData() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const storedCustomers = localStorage.getItem(`customers_${currentUser}`);
        if (storedCustomers) {
            customers = JSON.parse(storedCustomers);
            if (!Array.isArray(customers)) {
                customers = [];
            }
            
            // Sort customers by month and payment status
            sortCustomersByMonthAndPayment();
            
            customerTableBody.innerHTML = ''; // Clear existing rows
            customers.forEach(addCustomerToTable);
            updateIncomeSummary();
        }
    }

    // Save data to localStorage
    function saveData() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;
        localStorage.setItem(`customers_${currentUser}`, JSON.stringify(customers));
    }

    // Update income summary
    function updateIncomeSummary() {
        let totalPartsCost = 0;
        let totalServiceFee = 0;

        customers.forEach(customer => {
            if (customer.paymentStatus === 'paid') {
                totalPartsCost += parseFloat(customer.partsCost) || 0;
                totalServiceFee += parseFloat(customer.serviceFee) || 0;
            }
        });

        totalPartsCostElement.textContent = totalPartsCost.toFixed(2);
        totalServiceFeeElement.textContent = totalServiceFee.toFixed(2);
        totalEarningsElement.textContent = (totalPartsCost + totalServiceFee).toFixed(2);
    }

    // Add customer to table
    function addCustomerToTable(customer) {
        const row = customerTableBody.insertRow();
        
        // Add customer data to row
        row.insertCell().textContent = customer.customerName;
        row.insertCell().textContent = customer.phoneNumber;
        row.insertCell().textContent = customer.email;
        row.insertCell().textContent = customer.deviceType;
        row.insertCell().textContent = customer.serialNumber;
        
        // Extract and display month from purchaseDate
        const purchaseDateCell = row.insertCell();
        purchaseDateCell.textContent = customer.purchaseDate;
        
        // Add repair month cell
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const repairMonth = customer.purchaseDate ? new Date(customer.purchaseDate).getMonth() : -1;
        const repairMonthCell = row.insertCell();
        repairMonthCell.textContent = repairMonth >= 0 ? monthNames[repairMonth] : "";
        
        row.insertCell().textContent = customer.warrantyExpiration;
        row.insertCell().textContent = customer.issue;
        row.insertCell().textContent = customer.partsCost;
        row.insertCell().textContent = customer.serviceFee;

        // Add payment status dropdown
        const paymentStatusCell = row.insertCell();
        const paymentSelect = document.createElement('select');
        paymentSelect.innerHTML = `
            <option value="paid" ${customer.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="unpaid" ${customer.paymentStatus === 'unpaid' ? 'selected' : ''}>Unpaid</option>
        `;
        paymentSelect.addEventListener('change', function() {
            customer.paymentStatus = this.value;
            updateIncomeSummary();
            saveData();
        });
        paymentStatusCell.appendChild(paymentSelect);

        // Add action cell with print and delete buttons
        const actionCell = row.insertCell();
        
        // Add print button
        const printButton = document.createElement('button');
        printButton.textContent = 'Print';
        printButton.className = 'print-button';
        printButton.onclick = function() {
            printCustomerDetails(customer);
        };
        actionCell.appendChild(printButton);
        
        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.onclick = function() {
            const index = customers.indexOf(customer);
            if (index > -1) {
                customers.splice(index, 1);
                row.remove();
                updateIncomeSummary();
                saveData();
            }
        };
        actionCell.appendChild(deleteButton);
    }

    // Function to print customer details
    function printCustomerDetails(customer) {
        // Remove any existing print containers first
        const existingContainers = document.querySelectorAll('.print-container');
        existingContainers.forEach(container => {
            document.body.removeChild(container);
        });
        
        // Create print container
        const printContainer = document.createElement('div');
        printContainer.className = 'print-container';
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const repairMonth = customer.purchaseDate ? new Date(customer.purchaseDate).getMonth() : -1;
        
        // Set HTML content
        printContainer.innerHTML = `
            <div class="print-header">
                <h2>Customer Service Record</h2>
            </div>
            <div class="print-info">
                <p><strong>Customer Name:</strong> ${customer.customerName || 'N/A'}</p>
                <p><strong>Phone Number:</strong> ${customer.phoneNumber || 'N/A'}</p>
                <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                <p><strong>Device Type:</strong> ${customer.deviceType || 'N/A'}</p>
                <p><strong>Serial Number:</strong> ${customer.serialNumber || 'N/A'}</p>
                <p><strong>Repair Date:</strong> ${customer.purchaseDate || 'N/A'} (${repairMonth >= 0 ? monthNames[repairMonth] : 'N/A'})</p>
                <p><strong>Warranty Expiration:</strong> ${customer.warrantyExpiration || 'N/A'}</p>
                <p><strong>Issue:</strong> ${customer.issue || 'N/A'}</p>
                <p><strong>Parts Cost:</strong> ₱${customer.partsCost || '0.00'}</p>
                <p><strong>Service Fee:</strong> ₱${customer.serviceFee || '0.00'}</p>
                <p><strong>Total:</strong> ₱${
                    (parseFloat(customer.partsCost || 0) + parseFloat(customer.serviceFee || 0)).toFixed(2)
                }</p>
                <p><strong>Payment Status:</strong> ${customer.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</p>
            </div>
            <div class="print-action-buttons">
                <button onclick="window.print()">Print Now</button>
                <button onclick="document.body.removeChild(this.parentNode.parentNode)">Close</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(printContainer);
        
        // Add close button event listener
        const closeButton = printContainer.querySelector('.print-action-buttons button:last-child');
        closeButton.addEventListener('click', function() {
            document.body.removeChild(printContainer);
        });
        
        // Open print dialog
        setTimeout(() => {
            window.print();
        }, 300);
    }

    // Sort customers by month and payment status
    function sortCustomersByMonthAndPayment() {
        customers.sort((a, b) => {
            // Get month numbers (0-11) from purchase dates
            const aMonth = a.purchaseDate ? new Date(a.purchaseDate).getMonth() : -1;
            const bMonth = b.purchaseDate ? new Date(b.purchaseDate).getMonth() : -1;
            
            // Compare months first
            if (aMonth !== bMonth) return aMonth - bMonth;
            
            // If same month, put unpaid customers at the top
            if (a.paymentStatus !== b.paymentStatus) {
                return a.paymentStatus === 'unpaid' ? -1 : 1;
            }
            
            // If both paid or both unpaid, sort alphabetically by name
            return a.customerName.localeCompare(b.customerName);
        });
    }

    // Handle form submission
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Create new customer object
            const newCustomer = {
                customerName: document.getElementById('customerName')?.value || '',
                phoneNumber: document.getElementById('phoneNumber')?.value || '',
                email: document.getElementById('email')?.value || '',
                deviceType: document.getElementById('deviceType')?.value || 'computer',
                serialNumber: document.getElementById('serialNumber')?.value || '',
                purchaseDate: document.getElementById('purchaseDate')?.value || '',
                warrantyExpiration: document.getElementById('warrantyExpiration')?.value || '',
                issue: document.getElementById('issue')?.value || '',
                partsCost: document.getElementById('partsCost')?.value || '0',
                serviceFee: document.getElementById('serviceFee')?.value || '0',
                paymentStatus: document.getElementById('paymentStatus')?.value || 'unpaid'
            };

            // Add customer to array and table
            customers.push(newCustomer);
            
            // Sort customers after adding a new one
            sortCustomersByMonthAndPayment();
            
            // Clear and rebuild the table with sorted data
            customerTableBody.innerHTML = '';
            customers.forEach(addCustomerToTable);
            
            saveData();
            updateIncomeSummary();

            // Reset form
            customerForm.reset();
        });
    }

    // Initialize search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const rows = customerTableBody.getElementsByTagName('tr');
            
            Array.from(rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchText) ? '' : 'none';
            });
        });
    }

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

    // Add trial countdown functionality
    function checkAndDisplayTrialCountdown() {
        const currentUser = localStorage.getItem('currentUser');
        const trialExpiration = localStorage.getItem('trialExpiration');
        const countdownElement = document.getElementById('trialCountdown');
        
        if (currentUser === 'trial' && trialExpiration && countdownElement) {
            function updateCountdown() {
                const now = Date.now();
                const timeLeft = parseInt(trialExpiration) - now;
                
                if (timeLeft <= 0) {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('trialExpiration');
                    window.location.href = 'login.html';
                    return;
                }
                
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                countdownElement.textContent = `Trial expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                countdownElement.style.display = 'inline';
            }
            
            updateCountdown();
            setInterval(updateCountdown, 1000);
        } else if (countdownElement) {
            countdownElement.style.display = 'none';
        }
    }

    // Load initial data
    loadData();
    checkAndDisplayTrialCountdown();
});