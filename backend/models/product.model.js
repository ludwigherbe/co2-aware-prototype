class Product {
  constructor({ id, name, price, description, category, thumbnail, detailImages, inStock }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.category = category;
    this.thumbnail = thumbnail;
    this.detailImages = detailImages || [];
    this.inStock = inStock;
  }
}

module.exports = Product;
const Product = require('./product.model');