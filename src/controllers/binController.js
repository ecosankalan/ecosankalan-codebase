const Bin = require('../models/Bin');

const serializeBin = (bin) => {
  const obj = bin?.toObject ? bin.toObject() : bin;
  if (!obj) return obj;

  return {
    ...obj,
    types: obj.accepts || [],
    capacityStatus: obj.capacityStatus || 'available',
  };
};

const normalizeAddress = (address) => {
  if (!address) return undefined;
  if (typeof address === 'string') {
    return { street: address };
  }
  return address;
};

exports.listBins = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const hasGeoQuery = lat !== undefined || lng !== undefined || radius !== undefined;

    if (hasGeoQuery && (!lat || !lng || !radius)) {
      return res.status(400).json({
        success: false,
        message: 'lat, lng, and radius are required together',
      });
    }

    let bins;

    if (hasGeoQuery) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const searchRadius = Number(radius);

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        Number.isNaN(searchRadius)
      ) {
        return res.status(400).json({
          success: false,
          message: 'lat, lng, and radius must be valid numbers',
        });
      }

      bins = await Bin.find({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: searchRadius,
          },
        },
      }).lean();
    } else {
      bins = await Bin.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    }

    return res.status(200).json({
      success: true,
      count: bins.length,
      bins: bins.map(serializeBin),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load bins',
    });
  }
};

exports.createBin = async (req, res) => {
  try {
    const {
      name,
      address,
      location,
      types,
      accepts,
      capacityStatus,
      operatingHours,
      imageUrl,
      isActive,
    } = req.body;

    const acceptedTypes = Array.isArray(types) ? types : accepts;

    if (!name || !location || !Array.isArray(location.coordinates)) {
      return res.status(400).json({
        success: false,
        message: 'name, address, location, and types are required',
      });
    }

    if (!acceptedTypes || !Array.isArray(acceptedTypes) || acceptedTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'types must be a non-empty array',
      });
    }

    const createdBin = await Bin.create({
      name,
      address: normalizeAddress(address),
      location,
      accepts: acceptedTypes,
      capacityStatus: capacityStatus || 'available',
      operatingHours,
      imageUrl,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      addedBy: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: 'Bin created successfully',
      bin: serializeBin(createdBin),
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0]?.message || 'Invalid bin data',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create bin',
    });
  }
};
