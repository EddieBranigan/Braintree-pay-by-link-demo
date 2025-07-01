const fs = require('fs');
const path = require('path');

const ordersFilePath = path.join(__dirname, '../public/orders.json');
const MAX_ORDERS = 500;

function readOrders() {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf-8');
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders:', err);
    return [];
  }
}

function writeOrders(orders) {
  if (orders.length > MAX_ORDERS) {
    orders = orders.slice(-MAX_ORDERS);
  }

  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
}

function addOrder(order) {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

function getOrderByUUID(uuid) {
  const orders = readOrders();
  return orders.find(o => o.uuid === uuid);
}

function updateOrderPaymentStatus(uuid, paid) {
  const orders = readOrders();
  const index = orders.findIndex(o => o.uuid === uuid);
  if (index !== -1) {
    orders[index].paid = paid;
    writeOrders(orders);
    return true;
  }
  return false;
}

module.exports = {
  readOrders,
  addOrder,
  getOrderByUUID,
  updateOrderPaymentStatus
};
