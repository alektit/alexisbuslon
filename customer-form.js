// Additional JavaScript for the customer form
document.addEventListener('DOMContentLoaded', function() {
    // Show/hide downpayment amount field based on payment status
    const paymentStatusSelect = document.getElementById('paymentStatus');
    const downpaymentContainer = document.getElementById('downpayment-container');
    
    if (paymentStatusSelect && downpaymentContainer) {
        paymentStatusSelect.addEventListener('change', function() {
            downpaymentContainer.style.display = this.value === 'downpayment' ? 'block' : 'none';
        });
    }
});