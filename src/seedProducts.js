const mongoose = require('mongoose');
require('dotenv').config();
const PartnerProduct = require('./models/PartnerProduct');

const products = [
  {
    partnerName: 'IKEA',
    partnerLogoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcojhNb1tYMY1-v6eRbvJILqIwb2Cn-CP3YvtquBvkdKMYgMZJxLMbhX7lbVXLTAdvXYEwulNdmlXohGbWRhKqLHIADNw1hYAHDeAajQV3G_N14RdEzCz-WootC7J1nj6Qn_r19ySTzcaT0zoL5R2vxZKOGqV7N8yiBKorfb29FzygeKCgg8k4jl6JevgXNgnIYlpLOCk9yOl_TNsMKvTOUJojbqRc6g3W__ROI8vZ3K7o3Ui1HtSYwVQ43QZiaVjMW9DUNuMsrbnY',
    name: 'Nordic Bamboo Organizer',
    description: 'Hand-crafted from 100% FSC-certified bamboo, this desktop organizer combines Scandinavian functionalism with sustainable materials. Designed for the modern professional, it features three tiered compartments for mail, notebooks, and digital accessories.',
    priceINR: 1499,
    ecoPointsCost: 850,
    category: 'Home',
    imageUrls: [
      'https://images.unsplash.com/photo-1595514535415-eb102570a256?q=80&w=600&auto=format&fit=crop', // bamboo organizer
      'https://images.unsplash.com/photo-1595514535281-2244f77c5e21?q=80&w=600&auto=format&fit=crop'
    ],
    partnerProductUrl: 'https://www.ikea.com/in/en/search/?q=bamboo%20organizer',
    isActive: true
  },
  {
    partnerName: 'Amazon Eco',
    partnerLogoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuNwp13D2GVapRliA0KsLo4B-Os1eyfKpeWvvHYzVH557YZ-v2TjydkdfZ2JjBatHbXU_KZChdz3E4eeW9AMey4ctP0MkWZkIyjol8SKKJVTqO0FvbL75qP5UeTBDvE0SnPdLjPEV710IlanlS1f2E5m2V6xThYaSXdpyZQ9HjFMVYWtzPMnmwxkZ_M0IaOSx7VX5UCF7sxSrAyqOEiu5ZRaEAvff5ukn8rnX1pD4eLyOZCuovbDBFy9IS8Ulyrjmd-GDkbJniRuA5',
    name: 'Stainless Steel Insulated Bottle',
    description: 'Keep your drinks cold for 24 hours and hot for 12. Made from 18/8 food-grade stainless steel with a zero-plastic bamboo lid. Completely BPA-free and 100% recyclable.',
    priceINR: 999,
    ecoPointsCost: 650,
    category: 'Reusable',
    imageUrls: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop', // bottle
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop'
    ],
    partnerProductUrl: 'https://www.amazon.in/s?k=stainless+steel+insulated+bottle+bamboo',
    isActive: true
  },
  {
    partnerName: 'Decathlon',
    partnerLogoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHlbudSqV7DRX5ag4LK5dxcG3oNWtDupwbLbkkPr3vPkSEzHCWeAw1eA3pvTyO_UWwTAug_LQF2RBrih4Qpgd-kxZ5rt7zw3uS8WOaxCQaxaAxv0lVeNdiHxVrjObDaC7u4ZbngKwIJYn75BO1KaLxOmK8WeNTvy9Zc9Hkjm2vI4L4LiRwAd_AwtfTn9k3-CuCj1riMCFA2elGDXu_IZlLjYScaKocck7hNrmt-Igr1x5lJCi1qnjcNJpIcUXhGxY6sVouPvk8v6mJ',
    name: 'Natural Cork Yoga Mat',
    description: '100% natural, biodegradable cork surface with a natural rubber base. Provides excellent grip even when wet. Naturally antimicrobial and odor-resistant.',
    priceINR: 2499,
    ecoPointsCost: 1200,
    category: 'Zero Waste',
    imageUrls: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600&auto=format&fit=crop', // yoga mat
    ],
    partnerProductUrl: 'https://www.decathlon.in/search?query=cork%20yoga%20mat',
    isActive: true
  },
  {
    partnerName: 'IKEA',
    partnerLogoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcojhNb1tYMY1-v6eRbvJILqIwb2Cn-CP3YvtquBvkdKMYgMZJxLMbhX7lbVXLTAdvXYEwulNdmlXohGbWRhKqLHIADNw1hYAHDeAajQV3G_N14RdEzCz-WootC7J1nj6Qn_r19ySTzcaT0zoL5R2vxZKOGqV7N8yiBKorfb29FzygeKCgg8k4jl6JevgXNgnIYlpLOCk9yOl_TNsMKvTOUJojbqRc6g3W__ROI8vZ3K7o3Ui1HtSYwVQ43QZiaVjMW9DUNuMsrbnY',
    name: 'Recycled Glass Tumbler Set',
    description: 'Set of 4 tumblers made from 100% recycled glass. Dishwasher safe and perfect for everyday use. Heavy base prevents tipping.',
    priceINR: 599,
    ecoPointsCost: 350,
    category: 'Kitchen',
    imageUrls: [
      'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=600&auto=format&fit=crop', // glasses
    ],
    partnerProductUrl: 'https://www.ikea.com/in/en/search/?q=recycled%20glass%20tumbler',
    isActive: true
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB.');
    await PartnerProduct.deleteMany({});
    console.log('Cleared old products.');
    await PartnerProduct.insertMany(products);
    console.log('Seeded products successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
