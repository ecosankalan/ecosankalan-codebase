/**
 * models/Product.js
 * Eco-Shop products — items made from recycled materials.
 *
 * Sellers (role: 'seller') can create and manage products.
 * Buyers (role: 'user') can browse, add to cart, and checkout.
 *
 * Stock management uses MongoDB's atomic $inc operator:
 *   When an order is placed: Product.stock $inc -quantity
 *   This prevents overselling even under concurrent requests.
 *
 * Why not store cart inside Product?
 * Cart is a user concern, not a product concern.
 * Cart lives inside the Order document (as a pending order).
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least ₹1'],
    },

    // ── Eco-points redemption ─────────────────────────────────────────────────
    // Redemption rule: 10 eco-points = ₹1 discount, max 30% of order value
    // This field is calculated at checkout — not stored per product
    // (kept here as a reminder for the checkout controller)

    // ── Categorisation ────────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'home-decor',
        'stationery',
        'bags',
        'clothing',
        'furniture',
        'jewellery',
        'toys',
        'other',
      ],
    },

    // ── Materials (what recycled materials it's made from) ────────────────────
    materials: {
      type: [String],
      // e.g. ['recycled plastic', 'upcycled denim']
      default: [],
    },

    // ── Images ────────────────────────────────────────────────────────────────
    images: {
      type: [String], // array of image URLs
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 images per product',
      },
      default: [],
    },

    // ── Inventory ─────────────────────────────────────────────────────────────
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    // ── Seller ────────────────────────────────────────────────────────────────
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true, // seller dashboard queries by sellerId
    },

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate listings
    },

    // ── Stats ─────────────────────────────────────────────────────────────────
    totalSold: {
      type: Number,
      default: 0, // incremented atomically when orders are fulfilled
    },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
      // Reviews system is a future feature — schema ready for it
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ category: 1, isActive: 1 });   // browse by category
productSchema.index({ sellerId: 1 });                  // seller dashboard
productSchema.index({ price: 1 });                     // price sort
productSchema.index({ totalSold: -1 });                // bestsellers

// ── Virtual: is in stock ──────────────────────────────────────────────────────
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

module.exports = mongoose.model('Product', productSchema);
