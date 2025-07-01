const express = require("express");
const router = express.Router();
const braintree = require("braintree");
const dotenv = require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const orderStore = require('../utils/orderStore');
const fs = require("fs");
const path = require("path");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BT_MERCHANT_ID,
  publicKey: process.env.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY,
});

 // Endpoint for creating a paymentLink
router.post('/getPaymentLink', (req, res) => {
  const uuid = uuidv4();
  const { first_name, last_name, company, email, phone, fax, website, braintree_customer_id } = req.body;

  const order = {
    uuid,
    paid: false,
    braintree_customer_id,
    contact_info: {
      first_name,
      last_name,
      company,
      email,
      phone,
      fax,
      website
    }
  };

  orderStore.addOrder(order);

  res.json({ message: 'Payment link created', uuid });
});

// Endpoint for generating a payment method nonce
router.get("/getNonce/:token", async (req, res) => {
  try {
    const result = await gateway.paymentMethodNonce.create(req.params.token);
    res.status(200).send(result); // 200 OK for successful responses
  } catch (error) {
    console.error("Error creating payment method nonce:", error.message);

    if (error.type === 'notFoundError') {
      res.status(404).send({ error: "Token not found" }); // 404 if token is invalid
    } else if (error.type === 'validationError') {
      res.status(400).send({ error: "Invalid token" }); // 400 for validation errors
    } else {
      res.status(500).send({ error: "Internal server error" }); // 500 for other server issues
    }
  }
});

// Endpoint for client token
router.get("/", (req, res) => {
  gateway.clientToken.generate({})
  .then(response => res.send(response.clientToken));
});

// Endpoint for refund request
router.post("/refund", (req, res) => {
  const { amount, txnId } = req.body;
  gateway.transaction.refund(txnId, amount)
  .then(result => res.send(result))
});

// Endpoint for capturing transactions
router.post("/", (req, res, next) => {
  const { paymentMethodNonce, firstName, lastName, email, amount, uuid } = req.body;

  const txn = {
    amount: amount,
    paymentMethodNonce: paymentMethodNonce,
    customer: {
      email: email,
      firstName: firstName,
      lastName: lastName
    },
    customFields: {
      uuid: uuid
    },
    options: {
      submitForSettlement: true,
      storeInVaultOnSuccess: true
    },
  };

  gateway.transaction.sale(txn)
    .then(result => {
      if (result.success) {
        const transaction = result.transaction;
        const customerId = transaction.customer.id || null;
        const transactionId = transaction.id;

        // Update the order with both customer and transaction ID
        updateOrder(uuid, true, amount, customerId, transactionId);

        res.send(result);
      } else {
        res.status(400).send({ error: "Transaction not successful", details: result });
      }
    })
    .catch(error => {
      console.error("Transaction Error:", error);
      res.status(500).send({ error: "Transaction failed", details: error });
    });
});


function updateOrder(uuid, paid, amount, customerId, transactionId) {
  const ordersPath = path.join(__dirname, "../public/orders.json");

  try {
    const data = fs.readFileSync(ordersPath, "utf8");
    const orders = JSON.parse(data);

    const orderIndex = orders.findIndex(order => order.uuid === uuid);
    if (orderIndex === -1) {
      console.error("Order not found:", uuid);
      return;
    }

    orders[orderIndex].paid = paid;
    orders[orderIndex].amount_paid = amount;
    orders[orderIndex].braintree_customer_id = customerId;
    orders[orderIndex].braintree_transaction_id = transactionId;

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    console.log("Order updated:", uuid);
  } catch (err) {
    console.error("Error updating order:", err);
  }
}


module.exports = router;