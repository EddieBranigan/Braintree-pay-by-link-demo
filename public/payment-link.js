let uuid;
let amount = "300.00";
let order = null; // Global reference for use in payment
const submitButton = document.getElementById("submit-button");

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    uuid = pathParts[pathParts.length - 1];

    if (!uuid) {
        document.getElementById('orderDetails').innerText = 'No order specified.';
        return;
    }

    fetch('/orders.json')
        .then(res => res.json())
        .then(data => {
            order = data.find(o => o.uuid === uuid);
            const container = document.getElementById('orderDetails');

            if (!order) {
                container.innerHTML = `<p>Order not found for UUID: <strong>${uuid}</strong></p>`;
                return;
            }

            // Optional: update amount dynamically from order if present
            if (order.amount) {
                amount = order.amount;
            }

            container.innerHTML = `
                <div class="order-card">
                    <p><strong>Order ID:</strong> ${order.uuid}</p>
                    <p><strong>Status:</strong> ${order.paid ? 'Paid' : 'Unpaid'}</p>
                    <p><strong>Customer ID:</strong> ${order.braintree_customer_id}</p>
                    <p><strong>Name:</strong> ${order.contact_info.first_name} ${order.contact_info.last_name}</p>
                    <p><strong>Email:</strong> ${order.contact_info.email}</p>
                    <p><strong>Phone:</strong> ${order.contact_info.phone}</p>
                    <p><strong>Company:</strong> ${order.contact_info.company}</p>
                    <p><strong>Website:</strong> ${order.contact_info.website}</p>
                    <p><strong>Amount:</strong> £${amount}</p>
                </div>
            `;

            setupBraintree(); // Proceed to set up Drop-in once order is loaded
        })
        .catch(err => {
            console.error('Error fetching order:', err);
            document.getElementById('orderDetails').innerText = 'Error loading order data.';
        });
});

function setupBraintree() {
    fetch("http://localhost:3000/checkout")
        .then(response => response.text())
        .then(clientToken => {
            braintree.dropin.create({
                authorization: clientToken,
                container: "#dropin-container",
                locale: "en_GB",
                threeDSecure: {
                    amount: amount
                },
                card: {
                    overrides: {
                        fields: {
                            number: { prefill: "4000 0000 0000 1091" },
                            expirationDate: { prefill: "09/29" }
                        }
                    }
                },
                paypal: {
                    flow: "checkout",
                    amount: amount,
                    currency: "GBP",
                    commit: "true",
                    buttonStyle: {
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        size: 'large'
                    }
                },
                googlePay: {
                    googlePayVersion: 2,
                    transactionInfo: {
                        totalPriceStatus: "FINAL",
                        totalPrice: amount,
                        currencyCode: "GBP",
                        checkoutOption: "COMPLETE_IMMEDIATE_PURCHASE"
                    },
                    allowedPaymentMethods: [{
                        type: "CARD",
                        parameters: {
                            billingAddressRequired: false,
                            billingAddressParameters: {
                                format: "FULL"
                            }
                        }
                    }]
                }
            }).then(instance => {
                submitButton.addEventListener("click", async (e) => {
                    e.preventDefault();

                    try {
                        const result = await instance.requestPaymentMethod({
                            threeDSecure: {
                                amount: amount,
                                email: order.contact_info.email
                            }
                        });

                        const nonce = result.nonce;

                        const payload = {
                            paymentMethodNonce: nonce,
                            uuid: order.uuid,
                            firstName: order.contact_info.first_name,
                            lastName: order.contact_info.last_name,
                            email: order.contact_info.email,
                            amount: amount
                        };

                        const response = await fetch("/checkout", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) throw new Error("Checkout failed");

                        const data = await response.json();
                        
                        console.log(JSON.stringify(data))
                        const txn = data.transaction;

                        const confirmationDiv = document.createElement("div");
                        confirmationDiv.className = "payment-confirmation";
                        confirmationDiv.innerHTML = `
                        <h2>✅ Payment Received</h2>
                        <p><strong>Transaction ID:</strong> ${txn.id}</p>
                        <p><strong>Order UUID:</strong> ${txn.customFields?.uuid || 'N/A'}</p>
                        <p><strong>Status:</strong> ${txn.status}</p>
                        <p><strong>Amount:</strong> £${txn.amount}</p>
                        <p><strong>Customer ID:</strong> ${txn.customer.id}</p>
                        `;

                        document.getElementById("dropin-container").innerHTML = "";
                        document.getElementById("dropin-container").appendChild(confirmationDiv);

                    } catch (err) {
                        console.error("Payment error:", err);
                        alert("An error occurred while processing the payment.");
                    }
                });

            });
        });
}
