import { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Hisense 43" Smart LED TV',
    slug: 'hisense-43-smart-led-tv',
    description: 'Enjoy stunning full HD clarity and smart features with this Hisense 43-inch TV. Perfect for movies, sports, and gaming.',
    price: 245000,
    originalPrice: 260000,
    category: 'LED & Smart TVs',
    brand: 'Hisense',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.5,
    reviewsCount: 128,
    isPopular: true,
    specs: {
      'Screen Size': '43 Inches',
      'Resolution': '1080p Full HD',
      'Smart TV': 'Yes',
      'Connectivity': '3 HDMI, 2 USB'
    }
  },
  {
    id: 'p2',
    name: 'LG Double Door Refrigerator - 205L',
    slug: 'lg-double-door-refrigerator-205l',
    description: 'Keep your food fresh longer with LG\'s smart cooling technology. Features a spacious freezer and frost-free operation.',
    price: 320000,
    category: 'Refrigerators',
    brand: 'LG',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 84,
    isPopular: true,
    specs: {
      'Capacity': '205 Liters',
      'Type': 'Double Door',
      'Defrosting': 'Frost Free',
      'Energy Rating': '4 Star'
    }
  },
  {
    id: 'p3',
    name: 'Panasonic 1.5 HP Split Air Conditioner',
    slug: 'panasonic-1-5-hp-split-ac',
    description: 'Fast cooling and energy-saving inverter technology. Includes built-in voltage protection.',
    price: 410000,
    originalPrice: 435000,
    category: 'Air Conditioners',
    brand: 'Panasonic',
    image: 'https://images.unsplash.com/photo-1620619861614-239634e94119?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1620619861614-239634e94119?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.6,
    reviewsCount: 56,
    isNew: true,
    specs: {
      'Capacity': '1.5 HP',
      'Type': 'Split AC',
      'Inverter': 'Yes',
      'Condenser': 'Copper'
    }
  },
  {
    id: 'p4',
    name: 'Thermocool 7kg Front Load Washing Machine',
    slug: 'thermocool-7kg-front-load-washing-machine',
    description: 'Efficient and quiet washing machine with multiple wash programs for different fabrics.',
    price: 285000,
    category: 'Washing Machines',
    brand: 'Thermocool',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.3,
    reviewsCount: 42,
    specs: {
      'Capacity': '7 kg',
      'Load Type': 'Front Load',
      'Max Spin Speed': '1200 RPM'
    }
  },
  {
    id: 'p5',
    name: 'Sony 5.1 Channel Home Theater System',
    slug: 'sony-5-1-home-theater',
    description: 'Immersive surround sound experience with deep bass. Bluetooth enabled for wireless streaming.',
    price: 195000,
    category: 'Home Theater',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1545454675-a6a61fa31e48?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1545454675-a6a61fa31e48?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: false,
    rating: 4.7,
    reviewsCount: 91,
    isPopular: true,
    specs: {
      'Output Power': '1000W',
      'Channels': '5.1',
      'Connectivity': 'Bluetooth, HDMI ARC, USB'
    }
  },
  {
    id: 'p6',
    name: 'Midea Water Dispenser with Fridge',
    slug: 'midea-water-dispenser',
    description: 'Hot, cold, and normal water options with a built-in mini fridge compartment at the bottom.',
    price: 95000,
    originalPrice: 110000,
    category: 'Water Dispensers',
    brand: 'Midea',
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.4,
    reviewsCount: 33,
    specs: {
      'Type': 'Freestanding',
      'Taps': '3 (Hot, Cold, Normal)',
      'Cabinet': 'Bottom Fridge'
    }
  },
  {
    id: 'p7',
    name: 'LG 20L Microwave Oven',
    slug: 'lg-20l-microwave',
    description: 'Quick and even heating with auto-cook menus. Easy to clean interior.',
    price: 65000,
    category: 'Microwaves',
    brand: 'LG',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.2,
    reviewsCount: 19,
    specs: {
      'Capacity': '20 Liters',
      'Power': '700W',
      'Control Type': 'Mechanical'
    }
  },
  {
    id: 'p8',
    name: 'Samsung 65" QLED 4K Smart TV',
    slug: 'samsung-65-qled-4k',
    description: 'Brilliant picture quality with Quantum Dot technology. Sleek, thin design that looks great in any room.',
    price: 850000,
    category: 'LED & Smart TVs',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?auto=format&fit=crop&q=80&w=800'
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 45,
    isNew: true,
    specs: {
      'Screen Size': '65 Inches',
      'Resolution': '4K UHD',
      'Display Tech': 'QLED',
      'Smart TV': 'Tizen OS'
    }
  }
];
