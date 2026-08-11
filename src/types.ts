export type Category = 
  | 'Refrigerators'
  | 'LED & Smart TVs'
  | 'Home Theater'
  | 'Air Conditioners'
  | 'Washing Machines'
  | 'Water Dispensers'
  | 'Microwaves'
  | 'Small Appliances'
  | 'Generators & Power'
  | 'Furniture'
  | 'Electricals & Cables'
  | 'Fans'
  | 'Accessories';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  brand: string;
  image: string;
  gallery: string[];
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: string;
  paymentMethod: 'pay_on_delivery' | 'bank_transfer' | 'card';
}
