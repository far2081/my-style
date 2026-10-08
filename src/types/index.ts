export type ViewMode = 
  | 'home' 
  | 'stylist' 
  | 'collections' 
  | 'latest' 
  | 'trends' 
  | 'tryon' 
  | 'bridal' 
  | 'runway' 
  | 'dress-studio' 
  | 'offers' 
  | 'wishlist' 
  | 'cart' 
  | 'account' 
  | 'admin';

export type ProductImageType = 
  | 'Front'
  | 'Back'
  | 'Left'
  | 'Right'
  | 'Full Look'
  | 'Detail'
  | 'Fabric Detail'
  | 'Close Up'
  | '360 Multi-View';

export interface ProductImage {
  id: string;
  productId: string;
  imageType: ProductImageType;
  storagePath: string;
  imageUrl: string;
  sortOrder: number;
  altText: string;
  width?: number;
  height?: number;
  fileSize?: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  category: string;
  subcategory: string;
  event: string;
  occasion: string;
  dressType: string;
  style: string;
  color: string;
  secondaryColors: string[];
  colorHex: string;
  fabric: string;
  season: 'Summer' | 'Winter' | 'Spring' | 'All Season';
  price: number;
  salePrice?: number;
  originalPrice?: number;
  currency: 'PKR' | 'USD';
  sizes: string[];
  stock: number;
  inStock: boolean;
  description: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  exclusive: boolean;
  status: 'published' | 'draft' | 'archived';
  rating: number;
  reviewCount: number;
  highlights: string[];
  availability: 'In Stock' | 'Bespoke / Made to Order' | 'Limited Edition';
  gallery: ProductImage[];
  // Legacy & convenient access map
  images: {
    front: string;
    back?: string;
    left?: string;
    right?: string;
    fullLook?: string;
    detail?: string;
    fabricDetail?: string;
    closeUp?: string;
    multiView360?: string;
  };
  // Compatibility getters for prompt 1 UI
  isNew?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
}

export interface EventCollection {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  description: string;
  subcategories: string[];
  productIds: string[];
  status: 'active' | 'draft';
  sortOrder: number;
}

export interface OccasionItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  badge?: string;
}

export interface TrendItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  colorPalette: string[];
  keyElements: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
  selectedColor?: string;
}

export interface BridalItem {
  category: 'Bridal Dress' | 'Makeup' | 'Jewelry' | 'Hair' | 'Dupatta' | 'Shoes' | 'Accessories';
  name: string;
  description: string;
  image: string;
  price: number;
}

export interface MakeupPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  palette: string[];
  beforeImage: string;
  afterImage: string;
}

export interface AIDressDesign {
  id: string;
  name: string;
  folder: 'My Designs' | 'Bridal' | 'Mehndi' | 'Barat' | 'Walima' | 'Nikah' | 'Party' | 'Formal' | 'Casual' | 'Eid' | 'Summer' | 'Winter' | 'Favorites';
  date: string;
  image: string;
  prompt: string;
  fabric: string;
  colorPalette: string[];
  isFavorite: boolean;
  isAiConcept?: boolean;
}

export interface AIStylistSubmission {
  photo?: string;
  age: string;
  event: string;
  occasion: string;
  bodyStructure: string;
  preferredColors: string[];
  dressType: string;
  style: string;
  season: string;
  budget: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  preferredColors?: string[];
  preferredEvents?: string[];
  preferredStyle?: string;
  budgetRange?: { min: number; max: number };
  savedSizes?: Record<string, any>;
  shippingAddress?: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  profile?: UserProfile;
}

export interface Trend {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  season: string;
  event: string;
  status: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minimumOrder: number;
  maximumDiscount?: number;
  active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  minimumOrder: number;
  rewardType: string;
  rewardValue: string;
  active: boolean;
}

export interface OrderItem {
  id?: string;
  name: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon?: string;
  appliedOffer?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'demo_authorized';
  paymentProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  reviewText: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface AIJob {
  id: string;
  userId?: string;
  feature: 'stylist' | 'tryon' | 'makeup' | 'runway' | 'dress_studio';
  provider: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  inputData: any;
  outputData?: any;
  errorMessage?: string;
  createdAt: string;
}

