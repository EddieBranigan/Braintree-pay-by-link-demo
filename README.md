# Braintree pay-by-link demo
A simple braintree server built in NodeJS with express framework and using the Braintree drop-in integration.

![payment link example](https://github.com/user-attachments/assets/edcadb9d-ce30-4346-a333-7ec556ac0ad1)

## Setup instructions
Install the packages from the package-json file by typing into terminal:
```
npm install
```

Make sure to create a .env file with your gateway credentials in it. An example is provided ('example.env').

## Start the server
Start the server by typing into terminal:
```
node server.js
```

## Testing
Testing in the Braintree sandbox environment can be done using testing card numbers provided in the [Braintree developer docs located here](https://developer.paypal.com/braintree/docs/reference/general/testing/node#valid-card-numbers). For convenience, a test visa card which simulates a 3DS response is pre-filled into the card payment option within the hosted fields ui.

**NOTE:**
When testing card verifications and transactions, keep in mind:

- Transaction success is determined by the test amount you use. For example, when testing decline scenarios.
- Verification success is determined by the test card number you use. For example, when testing Vault and recurring billing scenarios.

## Payment flow
First, visit the index page at http://localhost:8000 and click the button to generate a payment link. Click the link to be redirected with the payment link to make a purchase. After completing your transaction you should see a summary of your order. You can also navigate to //localhost:8000/order-management.html to see initialised as well as completed orders.

## Disclaimer
This repository is for illustrative purposes only and shouldn't be used directly in a live environment.
