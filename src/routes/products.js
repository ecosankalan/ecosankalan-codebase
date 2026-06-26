const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const PartnerProduct = require('../models/PartnerProduct');

const router = express.Router();

const allowedRedirectDomains = () =>
  (process.env.ALLOWED_REDIRECT_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

const isAllowedUrl = (url) => {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();
  return allowedRedirectDomains().some((domain) =>
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
};

router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.category) query.category = req.query.category;
    const products = await PartnerProduct.find(query).sort({ createdAt: -1 }).lean();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load products' });
  }
});

router.get('/:id/redirect', async (req, res) => {
  try {
    const product = await PartnerProduct.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!isAllowedUrl(product.partnerProductUrl)) {
      return res.status(403).json({ success: false, message: 'Redirect domain is not allowed' });
    }

    const redirectUrl = new URL(product.partnerProductUrl);
    redirectUrl.searchParams.set('utm_source', 'ecosankalan');
    res.redirect(302, redirectUrl.toString());
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to redirect to product' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await PartnerProduct.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load product' });
  }
});

router.post('/', protect, authorize('admin', 'seller'), (req, res) => {
  res.status(501).json({ success: false, message: 'POST /products coming in Month 5.' });
});

router.put('/:id', protect, authorize('admin', 'seller'), (req, res) => {
  res.status(501).json({ success: false, message: 'PUT /products/:id coming in Month 5.' });
});

router.delete('/:id', protect, authorize('admin', 'seller'), (req, res) => {
  res.status(501).json({ success: false, message: 'DELETE /products/:id coming in Month 5.' });
});

module.exports = router;
