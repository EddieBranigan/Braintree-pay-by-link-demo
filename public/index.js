const form = document.getElementById('paymentForm');
const modal = document.getElementById('emailModal');
const closeBtn = document.getElementById('closeModal');

// Submit form handler
form.addEventListener('submit', function(e) {
  e.preventDefault();

  // Gather form data
  const formData = {
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    amount_due: document.getElementById('amount_due').value,
    company: document.getElementById('company').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    fax: document.getElementById('fax').value,
    website: document.getElementById('website').value,
    braintree_customer_id: "ABC123XYZ" // Replace with real value later
  };

  fetch('http://localhost:3000/checkout/getPaymentLink', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(data => {
    console.log("Payment link created. UUID:", data.uuid);

    const paymentLink = `http://localhost:3000/payment-link/${data.uuid}`;
    const payLink = document.querySelector('.pay-link');
    payLink.href = paymentLink;
    modal.style.display = "block";
  })
  .catch(err => {
    console.error("Error creating payment link:", err);
  });
});
