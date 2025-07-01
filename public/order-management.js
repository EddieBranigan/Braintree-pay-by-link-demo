document.addEventListener('DOMContentLoaded', () => {
  fetch('orders.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('ordersContainer');
      if (!data.length) {
        container.innerHTML = '<p>No orders found.</p>';
        return;
      }

      data.forEach(order => {
        const card = document.createElement('div');
        card.className = 'order-card';

        card.innerHTML = `
          <div><span class="order-id">Order ID:</span> ${order.uuid}</div>
          <div>Status: <span class="${order.paid ? 'paid' : 'unpaid'}">${order.paid ? 'Paid' : 'Unpaid'}</span></div>
          <div>Customer ID: ${order.braintree_customer_id}</div>
          <div class="contact-info">
            <strong>Contact Info:</strong><br>
            ${order.contact_info.first_name} ${order.contact_info.last_name}<br>
            ${order.contact_info.amount_due}<br>
            ${order.contact_info.company}<br>
            ${order.contact_info.email}<br>
            ${order.contact_info.phone}<br>
            ${order.contact_info.fax}<br>
            ${order.contact_info.website}
          </div>

          <div class="actions">
            <button class="action-btn" disabled>Void</button>
            <button class="action-btn" disabled>Refund</button>
            <button class="action-btn" disabled>Approve</button>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Failed to load orders:', err);
      document.getElementById('ordersContainer').innerHTML = '<p>Error loading orders.</p>';
    });
});
