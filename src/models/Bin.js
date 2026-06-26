const mongoose = require('mongoose');

const binSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bin name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required'],
        validate: {
          validator(coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              coords[0] >= -180 && coords[0] <= 180 &&
              coords[1] >= -90 && coords[1] <= 90
            );
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
    },
    types: {
      type: [{
        type: String,
        enum: ['plastic', 'organic', 'eWaste', 'metal', 'paper', 'general'],
      }],
      required: [true, 'At least one bin type is required'],
      validate: {
        validator(types) {
          return Array.isArray(types) && types.length > 0;
        },
        message: 'At least one bin type is required',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    capacityStatus: {
      type: String,
      trim: true,
      default: 'low',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

binSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Bin', binSchema);
