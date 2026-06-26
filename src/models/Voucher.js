const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    partnerName: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, trim: true },
    discountDescription: { type: String, required: true, trim: true },
    partnerPortalUrl: { type: String, required: true },
    ecoPointsCost: { type: Number, default: 500, min: 0 },
    expiresAt: { type: Date, required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    assignedAt: { type: Date, default: null },
    source: { type: String, trim: true },
  },
  { timestamps: true }
);

voucherSchema.index({ partnerName: 1, assignedTo: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);
