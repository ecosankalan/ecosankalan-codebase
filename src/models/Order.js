/**
 * models/Order.js
 * Cart and completed orders — the full purchase lifecycle.
 *
 * One Order document covers both states:
 *   status: 'cart'      → user is still adding items (their active cart)
 *   status: 'pending'   → Razorpay payment initiated, awaiting webhook
 *   status: 'paid'      → payment confirmed, stock deducted
 *   status: 'shipped'   → seller has dispatched
 *   status: 'delivered' → order complete
 *   status: 'cancelled' → order cancelled, eco-points refunded
 *
 * Why use ONE document for cart + order (instead of a separate Cart model)?
 * It simplifies checkout: cart just becomes an order with status 'paid'.
 * No data migration needed at checkout time — just update the status.
 *
 * Eco-points redemption logic (Month 5):
 *   pointsUsed × (1/10) = ₹ discount
 *   Max discount = 30% of subtotal
 *   Example: ₹500 order → max discount = ₹150 → max 1500 points
 */

const mongoose = require('mongoose');

// ── Cart Item sub-schema ──────────────────────────────────────────────────────
// Snapshot of product at time of adding to cart.
// Why snapshot price? Product price might change — order must show what user paid.
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },

  // Snapshot fields — copied from Product at add-to-cart time
  name:     { type: String, required: true },
  price:    { type: Number, required: true }, // price at time of adding
  imageUrl: { type: String, default: null },

  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Cannot order more than 10 of the same item'],
  },

  // Calculated: price × quantity (stored for fast reads)
  subtotal: {
    type: Number,
    required: true,
  },
}, { _id: false });

// ── Main Order Schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // ── Who placed it ─────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Items ────────────────────────────────────────────────────────────────
    items: {
      type: [cartItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must have at least one item',
      },
    },

    // ── Pricing breakdown ────────────────────────────────────────────────────
    subtotal: {
      // Sum of all item subtotals (before discount)
      type: Number,
      required: true,
    },

    ecoPointsDiscount: {
      // ₹ value of eco-points discount applied
      // = pointsUsed / 10
      type: Number,
      default: 0,
    },

    pointsUsed: {
      // How many eco-points the user redeemed
      // Deducted from User.ecoPoints atomically at checkout
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      // What user actually pays: subtotal - ecoPointsDiscount
      type: Number,
      required: true,
    },

    // ── Delivery address ────────────────────────────────────────────────────
    // Snapshot of address at order time (DPDP: minimal data, only what's needed)
    deliveryAddress: {
      fullName:  { type: String, required: true },
      phone:     { type: String, required: true },
      street:    { type: String, required: true },
      area:      { type: String },
      city:      { type: String, required: true },
      state:     { type: String, required: true },
      pincode:   { type: String, required: true },
    },

    // ── Razorpay payment ─────────────────────────────────────────────────────
    payment: {
      razorpayOrderId:   { type: String, default: null }, // from Razorpay create order
      razorpayPaymentId: { type: String, default: null }, // from Razorpay webhook
      razorpaySignature: { type: String, default: null }, // for verification
      method:            { type: String, default: null }, // 'upi', 'card', 'netbanking'
      paidAt:            { type: Date,   default: null },
    },

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['cart', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'cart',
      index: true,
    },

    // ── Voucher (Month 5 — 500 codes × ₹4 from ₹2000 budget) ────────────────
    voucherCode:     { type: String, default: null },
    voucherDiscount: { type: Number, default: 0 },

    // ── Cancellation ─────────────────────────────────────────────────────────
    cancelledAt:     { type: Date, default: null },
    cancellationReason: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ userId: 1, status: 1 });           // order history
orderSchema.index({ userId: 1, status: 1, createdAt: -1 }); // sorted history
orderSchema.index({ 'payment.razorpayOrderId': 1 });   // webhook lookup

// ── Virtual: item count ────────────────────────────────────────────────────────
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);
