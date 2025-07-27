class Cart {
  constructor({ userId, items }) {
    this.userId = userId;
    this.items = items || []; 
  }
}
module.exports = Cart;
const Cart = require('./cart.model');