const Bin = require('../src/models/Bin');
const User = require('../src/models/User');

describe('Model schemas', () => {
  test('Bin accepts valid GeoJSON coordinates', () => {
    const bin = new Bin({
      name: 'Gate Bin',
      address: 'NSUT Gate 1',
      location: { type: 'Point', coordinates: [77.03, 28.61] },
      types: ['plastic'],
    });

    expect(bin.validateSync()).toBeUndefined();
  });

  test('Bin rejects invalid GeoJSON coordinates', () => {
    const bin = new Bin({
      name: 'Gate Bin',
      address: 'NSUT Gate 1',
      location: { type: 'Point', coordinates: [200, 95] },
      types: ['plastic'],
    });

    expect(bin.validateSync().errors['location.coordinates']).toBeDefined();
  });

  test('User schema does not define location storage', () => {
    expect(User.schema.path('location')).toBeUndefined();
    expect(User.schema.path('role').enumValues).toContain('ngo');
  });
});
