// New utility functions for extended customer management
function createEditForm(customer, index, customers, updateCallback) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <span class="close-modal">&times;</span>
            <h3>Edit Customer</h3>
            <form id="edit-customer-form" class="compact-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-customerName">Customer Name:</label>
                        <input type="text" id="edit-customerName" value="${customer.customerName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-phoneNumber">Phone Number:</label>
                        <input type="tel" id="edit-phoneNumber" value="${customer.phoneNumber || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-technician">Technician:</label>
                        <input type="text" id="edit-technician" value="${customer.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-deviceType">Device Type:</label>
                        <select id="edit-deviceType">
                            <option value="computer" ${customer.deviceType === 'computer' ? 'selected' : ''}>Computer</option>
                            <option value="laptop" ${customer.deviceType === 'laptop' ? 'selected' : ''}>Laptop</option>
                            <option value="phone" ${customer.deviceType === 'phone' ? 'selected' : ''}>Phone</option>
                            <option value="printer" ${customer.deviceType === 'printer' ? 'selected' : ''}>Printer</option>
                            <option value="other" ${customer.deviceType === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-Model">Model:</label>
                        <input type="text" id="edit-Model" value="${customer.serialNumber || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-purchaseDate">Starting:</label>
                        <input type="date" id="edit-purchaseDate" value="${customer.purchaseDate || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-warrantyExpiration">Warranty Expiration:</label>
                        <input type="date" id="edit-warrantyExpiration" value="${customer.warrantyExpiration || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-issue">Issue:</label>
                        <input type="text" id="edit-issue" value="${customer.issue || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-partsCost">Parts Cost:</label>
                        <input type="number" id="edit-partsCost" step="0.01" value="${customer.partsCost || '0'}">
                    </div>
                    <div class="form-group">
                        <label for="edit-serviceFee">Service Fee:</label>
                        <input type="number" id="edit-serviceFee" step="0.01" value="${customer.serviceFee || '0'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-paymentStatus">Payment Status:</label>
                        <select id="edit-paymentStatus">
                            <option value="paid" ${customer.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="downpayment" ${customer.paymentStatus === 'downpayment' ? 'selected' : ''}>Downpayment</option>
                            <option value="unpaid" ${customer.paymentStatus === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                        </select>
                    </div>
                    <div class="form-group" id="edit-downpayment-container" style="${customer.paymentStatus === 'downpayment' ? 'display:block' : 'display:none'}">
                        <label for="edit-downpaymentAmount">Downpayment Amount:</label>
                        <input type="number" id="edit-downpaymentAmount" step="0.01" value="${customer.downpaymentAmount || '0'}">
                    </div>
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Show/hide downpayment amount field based on payment status
    const paymentStatusSelect = document.getElementById('edit-paymentStatus');
    const downpaymentContainer = document.getElementById('edit-downpayment-container');
    
    paymentStatusSelect.addEventListener('change', function() {
        downpaymentContainer.style.display = this.value === 'downpayment' ? 'block' : 'none';
    });
    
    // Handle form submission
    const form = document.getElementById('edit-customer-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update customer object
        customer.customerName = document.getElementById('edit-customerName').value;
        customer.phoneNumber = document.getElementById('edit-phoneNumber').value;
        customer.email = document.getElementById('edit-technician').value;
        customer.deviceType = document.getElementById('edit-deviceType').value;
        customer.serialNumber = document.getElementById('edit-Model').value;
        customer.purchaseDate = document.getElementById('edit-purchaseDate').value;
        customer.warrantyExpiration = document.getElementById('edit-warrantyExpiration').value;
        customer.issue = document.getElementById('edit-issue').value;
        customer.partsCost = document.getElementById('edit-partsCost').value;
        customer.serviceFee = document.getElementById('edit-serviceFee').value;
        customer.paymentStatus = document.getElementById('edit-paymentStatus').value;
        
        // If payment status is downpayment, save the amount
        if (customer.paymentStatus === 'downpayment') {
            customer.downpaymentAmount = document.getElementById('edit-downpaymentAmount').value;
        }
        
        // Call update callback
        if (typeof updateCallback === 'function') {
            updateCallback();
        }
        
        // Close modal
        document.body.removeChild(modal);
    });
    
    return modal;
}

// Create payment status dropdown with downpayment amount field
function createPaymentStatusDropdown(customer, updateCallback) {
    const container = document.createElement('div');
    container.className = 'payment-status-container';
    
    // Create select element
    const paymentSelect = document.createElement('select');
    paymentSelect.innerHTML = `
        <option value="paid" ${customer.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
        <option value="downpayment" ${customer.paymentStatus === 'downpayment' ? 'selected' : ''}>Downpayment</option>
        <option value="unpaid" ${customer.paymentStatus === 'unpaid' ? 'selected' : ''}>Unpaid</option>
    `;
    
    // Create downpayment amount input (initially hidden)
    const downpaymentInput = document.createElement('input');
    downpaymentInput.type = 'number';
    downpaymentInput.step = '0.01';
    downpaymentInput.placeholder = 'Amount';
    downpaymentInput.className = 'downpayment-amount';
    downpaymentInput.value = customer.downpaymentAmount || '0';
    downpaymentInput.style.display = customer.paymentStatus === 'downpayment' ? 'block' : 'none';
    downpaymentInput.style.width = '80px';
    
    // Add event listeners
    paymentSelect.addEventListener('change', function() {
        customer.paymentStatus = this.value;
        downpaymentInput.style.display = this.value === 'downpayment' ? 'block' : 'none';
        updateCallback();
    });
    
    downpaymentInput.addEventListener('change', function() {
        customer.downpaymentAmount = this.value;
        updateCallback();
    });
    
    // Append elements to container
    container.appendChild(paymentSelect);
    container.appendChild(downpaymentInput);
    
    return container;
}