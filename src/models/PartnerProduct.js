const mongoose = require('mongoose');

const partnerProductSchema = new mongoose.Schema(
  {
    partnerName: { type: String, required: true, trim: true },
    partnerLogoUrl: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priceINR: { type: Number, required: true, min: 0 },
    ecoPointsCost: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    imageUrls: { type: [String], default: [] },
    partnerProductUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

partnerProductSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model('PartnerProduct', partnerProductSchema);
