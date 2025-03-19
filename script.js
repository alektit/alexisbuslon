document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const customerForm = document.getElementById('new-customer-form');
    const customerTableBody = document.querySelector('#customer-table tbody');
    const totalPartsCostElement = document.getElementById('totalPartsCost');
    const totalServiceFeeElement = document.getElementById('totalServiceFee');
    const totalEarningsElement = document.getElementById('totalEarnings');
    const saveButton = document.getElementById('saveButton');

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
            customers.forEach((customer, index) => addCustomerToTable(customer, index));
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
            } else if (customer.paymentStatus === 'downpayment') {
                // Add downpayment amount to totals
                const downpaymentAmount = parseFloat(customer.downpaymentAmount) || 0;
                totalPartsCost += downpaymentAmount;
            }
        });

        totalPartsCostElement.textContent = totalPartsCost.toFixed(2);
        totalServiceFeeElement.textContent = totalServiceFee.toFixed(2);
        totalEarningsElement.textContent = (totalPartsCost + totalServiceFee).toFixed(2);
    }

    // Add customer to table
    function addCustomerToTable(customer, index) {
        const row = customerTableBody.insertRow();
        
        // Add customer number to row
        row.insertCell().textContent = index + 1;
        
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

        // Add payment status dropdown with downpayment amount field
        const paymentStatusCell = row.insertCell();
        const paymentStatusDropdown = createPaymentStatusDropdown(customer, function() {
            updateIncomeSummary();
            saveData();
        });
        paymentStatusCell.appendChild(paymentStatusDropdown);

        // Add action cell with print, edit and delete buttons
        const actionCell = row.insertCell();
        
        // Add edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-button';
        editButton.onclick = function() {
            createEditForm(customer, index, customers, function() {
                updateIncomeSummary();
                saveData();
                // Clear and rebuild the table
                customerTableBody.innerHTML = '';
                customers.forEach((customer, idx) => addCustomerToTable(customer, idx));
            });
        };
        actionCell.appendChild(editButton);
        
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
        // Create print container
        const printContainer = document.createElement('div');
        printContainer.className = 'print-container';
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const repairMonth = customer.purchaseDate ? new Date(customer.purchaseDate).getMonth() : -1;
        
        // Include downpayment amount in print
        let paymentStatusText = customer.paymentStatus === 'paid' ? 'Paid' : 
                               (customer.paymentStatus === 'downpayment' ? 
                               `Downpayment (₱${customer.downpaymentAmount || '0.00'})` : 'Unpaid');
        
        // Set HTML content with more compact styling
        printContainer.innerHTML = `
            <div class="print-header" style="margin-bottom: 10px;">
                <h2 style="margin: 5px 0;">Customer Service Record</h2>
            </div>
            <div class="print-info" style="margin-bottom: 15px;">
                <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${customer.customerName || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Phone Number:</strong> ${customer.phoneNumber || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Technician:</strong> ${customer.email || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Device Type:</strong> ${customer.deviceType || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Model:</strong> ${customer.serialNumber || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Repair Date:</strong> ${customer.purchaseDate || 'N/A'} (${repairMonth >= 0 ? monthNames[repairMonth] : 'N/A'})</p>
                <p style="margin: 4px 0;"><strong>Warranty Expiration:</strong> ${customer.warrantyExpiration || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Issue:</strong> ${customer.issue || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Parts Cost:</strong> ₱${customer.partsCost || '0.00'}</p>
                <p style="margin: 4px 0;"><strong>Service Fee:</strong> ₱${customer.serviceFee || '0.00'}</p>
                <p style="margin: 4px 0;"><strong>Total:</strong> ₱${
                    (parseFloat(customer.partsCost || 0) + parseFloat(customer.serviceFee || 0)).toFixed(2)
                }</p>
                <p style="margin: 4px 0;"><strong>Payment Status:</strong> ${paymentStatusText}</p>
            </div>
            <div class="signature-section" style="display: flex; justify-content: space-between; margin-top: 10px;">
                <div class="signature-box" style="width: 30%; text-align: center;">
                    <p style="margin: 2px 0; font-size: 12px;">${customer.email || 'Technician'}</p>
                    <div class="signature-line" style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 5px;"></div>
                    <p style="margin: 2px 0; font-size: 12px;">Technician Signature</p>
                </div>
                <div class="signature-box" style="width: 30%; text-align: center;">
                    <p style="margin: 2px 0; font-size: 12px;">${customer.customerName || 'Customer'}</p>
                    <div class="signature-line" style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 5px;"></div>
                    <p style="margin: 2px 0; font-size: 12px;">Customer Signature</p>
                </div>
            </div>
            <div class="print-action-buttons">
                <button onclick="window.print()">Print Now</button>
                <button onclick="document.body.removeChild(this.closest('.print-container'))">Close</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(printContainer);
        
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
            
            // If same month, put unpaid customers at the top, then downpayment, then paid
            if (a.paymentStatus !== b.paymentStatus) {
                if (a.paymentStatus === 'unpaid') return -1;
                if (b.paymentStatus === 'unpaid') return 1;
                if (a.paymentStatus === 'downpayment') return -1;
                if (b.paymentStatus === 'downpayment') return 1;
            }
            
            // If both paid or both unpaid, sort alphabetically by name
            return a.customerName.localeCompare(b.customerName);
        });
    }

    // Handle form submission
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get payment status and downpayment amount if applicable
            const paymentStatus = document.getElementById('paymentStatus').value;
            let downpaymentAmount = '0';
            
            if (paymentStatus === 'downpayment') {
                downpaymentAmount = document.getElementById('downpaymentAmount')?.value || '0';
            }

            // Create new customer object
            const newCustomer = {
                customerName: document.getElementById('customerName')?.value || '',
                phoneNumber: document.getElementById('phoneNumber')?.value || '',
                email: document.getElementById('technician')?.value || '',
                deviceType: document.getElementById('deviceType')?.value || 'computer',
                serialNumber: document.getElementById('Model')?.value || '',
                purchaseDate: document.getElementById('purchaseDate')?.value || '',
                warrantyExpiration: document.getElementById('warrantyExpiration')?.value || '',
                issue: document.getElementById('issue')?.value || '',
                partsCost: document.getElementById('partsCost')?.value || '0',
                serviceFee: document.getElementById('serviceFee')?.value || '0',
                paymentStatus: paymentStatus,
                downpaymentAmount: downpaymentAmount
            };

            // Add customer to array and table
            customers.push(newCustomer);
            
            // Sort customers after adding a new one
            sortCustomersByMonthAndPayment();
            
            // Clear and rebuild the table with sorted data
            customerTableBody.innerHTML = '';
            customers.forEach((customer, index) => addCustomerToTable(customer, index));
            
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

    // Save customer list to text file
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            // Create text content
            let textContent = "CUSTOMER AND WARRANTY RECORDS\n\n";
            textContent += "Date Exported: " + new Date().toLocaleDateString() + "\n\n";
            textContent += "CUSTOMER LIST:\n";
            textContent += "-".repeat(80) + "\n";
            
            customers.forEach((customer, index) => {
                textContent += `#${index + 1} | Name: ${customer.customerName || 'N/A'}\n`;
                textContent += `Phone: ${customer.phoneNumber || 'N/A'} | Technician: ${customer.email || 'N/A'}\n`;
                textContent += `Device: ${customer.deviceType || 'N/A'} | Model: ${customer.serialNumber || 'N/A'}\n`;
                textContent += `Starting Date: ${customer.purchaseDate || 'N/A'} | Warranty Expiration: ${customer.warrantyExpiration || 'N/A'}\n`;
                textContent += `Issue: ${customer.issue || 'N/A'}\n`;
                textContent += `Parts Cost: ₱${customer.partsCost || '0.00'} | Service Fee: ₱${customer.serviceFee || '0.00'}\n`;
                textContent += `Payment Status: ${
                    customer.paymentStatus === 'paid' ? 'Paid' : 
                    customer.paymentStatus === 'downpayment' ? 'Downpayment' : 'Unpaid'
                }\n`;
                textContent += "-".repeat(80) + "\n";
            });
            
            // Add income summary
            textContent += "\nINCOME SUMMARY:\n";
            textContent += `Total Parts Cost: ₱${totalPartsCostElement.textContent}\n`;
            textContent += `Total Service Fee: ₱${totalServiceFeeElement.textContent}\n`;
            textContent += `Total Earnings: ₱${totalEarningsElement.textContent}\n`;
            
            // Create download link
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const currentUser = localStorage.getItem('currentUser');
            const filename = `customer_list_${currentUser}_${new Date().toISOString().split('T')[0]}.txt`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
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

function createPaymentStatusDropdown(customer, callback) {
    // Create dropdown for payment status
    const select = document.createElement('select');
    select.innerHTML = `
        <option value="paid" ${customer.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
        <option value="downpayment" ${customer.paymentStatus === 'downpayment' ? 'selected' : ''}>Downpayment</option>
        <option value="unpaid" ${customer.paymentStatus === 'unpaid' ? 'selected' : ''}>Unpaid</option>
    `;
    
    // Add downpayment amount input if downpayment selected
    const downpaymentAmountInput = document.createElement('input');
    downpaymentAmountInput.type = 'number';
    downpaymentAmountInput.value = customer.downpaymentAmount || '0';
    downpaymentAmountInput.style.display = customer.paymentStatus === 'downpayment' ? 'inline' : 'none';
    
    // Update payment status on change
    select.addEventListener('change', function() {
        customer.paymentStatus = this.value;
        downpaymentAmountInput.style.display = this.value === 'downpayment' ? 'inline' : 'none';
        downpaymentAmountInput.value = customer.downpaymentAmount || '0';
        callback();
    });
    
    // Update downpayment amount on input
    downpaymentAmountInput.addEventListener('input', function() {
        customer.downpaymentAmount = this.value;
        callback();
    });
    
    // Create container for dropdown and downpayment amount input
    const container = document.createElement('div');
    container.appendChild(select);
    container.appendChild(downpaymentAmountInput);
    
    return container;
}