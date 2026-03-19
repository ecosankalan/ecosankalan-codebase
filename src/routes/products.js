/**
 * routes/products.js — Eco-Shop marketplace (Month 5)
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const stub = (n) => (req, res) => res.status(501).json({ success: false, message: `${n} coming in Month 5.` });

router.get('/', stub('GET /products'));
router.get('/:id', stub('GET /products/:id'));
router.post('/', protect, authorize('admin', 'seller'), stub('POST /products'));
router.put('/:id', protect, authorize('admin', 'seller'), stub('PUT /products/:id'));
router.delete('/:id', protect, authorize('admin', 'seller'), stub('DELETE /products/:id'));

module.exports = router;
