/**
 * routes/orders.js — Cart & Razorpay checkout (Month 5)
 *
 * Eco-points redemption: 10 pts = ₹1, max 30% of order value
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const stub = (n) => (req, res) => res.status(501).json({ success: false, message: `${n} coming in Month 5.` });

router.use(protect); // all order routes require auth

router.get('/cart', stub('GET /orders/cart'));
router.post('/cart/add', stub('POST /orders/cart/add'));
router.put('/cart/update', stub('PUT /orders/cart/update'));
router.delete('/cart/clear', stub('DELETE /orders/cart/clear'));
router.post('/checkout', stub('POST /orders/checkout'));         // Razorpay + eco-points
router.get('/history', stub('GET /orders/history'));
router.get('/:id', stub('GET /orders/:id'));

module.exports = router;
