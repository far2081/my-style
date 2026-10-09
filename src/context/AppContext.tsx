import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, ProductImage, CartItem, ViewMode, BridalItem, EventCollection, User, Order, Offer } from '../types';
import { PRODUCTS_DATA } from '../data/products';
import { EVENT_COLLECTIONS_DATA } from '../data/collections';
import { BRIDAL_ITEMS_DATA } from '../data/bridalLooks';
import { dbService } from '../services/dbService';
import { authService } from '../services/authService';

interface AppContextType {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  // User & Auth State
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Central Dress Library State
  products: Product[];
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  addProductImage: (productId: string, image: Omit<ProductImage, 'id' | 'createdAt'>) => void;
  removeProductImage: (productId: string, imageId: string) => void;
  reorderProductImages: (productId: string, newGallery: ProductImage[]) => void;
  setMainProductImage: (productId: string, imageUrl: string) => void;
  toggleProductStatus: (productId: string) => void;
  // Collections State
  eventCollections: EventCollection[];
  selectedCollection: EventCollection | null;
  setSelectedCollection: (col: EventCollection | null) => void;
  // Categorized Selectors
  newArrivals: Product[];
  featuredProducts: Product[];
  trendingProducts: Product[];
  exclusiveProducts: Product[];
  // Cart & Commerce State
  cart: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Orders & Offers
  orders: Order[];
  createOrder: (order: Partial<Order>) => Promise<{ order: Order | null; error: string | null }>;
  updateOrderStatus: (orderId: string, nextStatus: any) => void;
  offers: Offer[];
  appliedCoupon: string | null;
  setAppliedCoupon: (code: string | null) => void;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ valid: boolean; discount: number; message: string }>;
  // Wishlist & UI
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  tryOnProduct: Product | null;
  setTryOnProduct: (product: Product | null) => void;
  isTryOnModalOpen: boolean;
  setIsTryOnModalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBridalItems: BridalItem[];
  toggleBridalItem: (item: BridalItem) => void;
  bridalLookTotal: number;
  isBridalOfferEligible: boolean;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeFilterOccasion: string | null;
  setActiveFilterOccasion: (occ: string | null) => void;
  activeFilterEvent: string | null;
  setActiveFilterEvent: (event: string | null) => void;
  customerPhoto: string | null;
  setCustomerPhoto: (photo: string | null) => void;
}

const getInitialView = (): ViewMode => {
  try {
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase().replace('#', '').replace('/', '');
    const route = hash || path;
    if (route.includes('stylist')) return 'stylist';
    if (route.includes('collection')) return 'collections';
    if (route.includes('latest')) return 'latest';
    if (route.includes('trend')) return 'trends';
    if (route.includes('tryon') || route.includes('try-on')) return 'tryon';
    if (route.includes('bridal') || route.includes('makeup')) return 'bridal';
    if (route.includes('runway')) return 'runway';
    if (route.includes('dress-studio') || route.includes('studio')) return 'dress-studio';
    if (route.includes('wishlist')) return 'wishlist';
    if (route.includes('account') || route.includes('order')) return 'account';
    if (route.includes('offer')) return 'offers';
    if (route.includes('admin')) return 'admin';
  } catch {}
  return 'home';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveViewState] = useState<ViewMode>(getInitialView());
  const [products, setProducts] = useState<Product[]>(PRODUCTS_DATA);
  const [eventCollections, setEventCollections] = useState<EventCollection[]>(EVENT_COLLECTIONS_DATA);
  const [selectedCollection, setSelectedCollection] = useState<EventCollection | null>(null);

  const setActiveView = (view: ViewMode) => {
    setActiveViewState(view);
    try {
      if (view === 'home') {
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        window.history.replaceState(null, '', `/#/${view}`);
      }
    } catch {}
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveViewState(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr_default',
    name: 'Farhana Aamir',
    email: 'farzunmir@gmail.com',
    role: 'customer',
    profile: {
      name: 'Farhana Aamir',
      email: 'farzunmir@gmail.com',
      phone: '+92 300 1234567',
      role: 'customer',
      preferredColors: ['Burgundy', 'Champagne Gold', 'Deep Plum'],
      preferredEvents: ['Bridal', 'Barat'],
      preferredStyle: 'Royal Heritage Haute Couture',
    },
  });

  // Offers & Orders State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord_init_01',
      orderNumber: 'SM-2026-98124',
      userId: 'usr_default',
      customerName: 'Farhana Aamir',
      customerEmail: 'farzunmir@gmail.com',
      customerPhone: '+92 300 1234567',
      shippingAddress: {
        address: 'Atelier Suite 4B, M.M. Alam Road, Gulberg III',
        city: 'Lahore',
        postalCode: '54000',
      },
      items: [
        {
          name: 'Shahzadi Zardozi Velvet Lehenga',
          size: 'M',
          color: 'Burgundy',
          price: 345000,
          quantity: 1,
          image: PRODUCTS_DATA[0]?.images.front,
        },
      ],
      subtotal: 345000,
      discount: 25000,
      shipping: 0,
      total: 320000,
      status: 'processing',
      paymentStatus: 'paid',
      paymentProvider: 'HBL_CORPORATE_WIRE',
      createdAt: '2026-10-02T10:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
    },
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Load backend data from DB service on mount
  useEffect(() => {
    let isMounted = true;
    dbService.getProducts().then((data) => {
      if (isMounted && data && data.length > 0) setProducts(data);
    });
    dbService.getCollections().then((cols) => {
      if (isMounted && cols && cols.length > 0) setEventCollections(cols);
    });
    dbService.getOffers().then((off) => {
      if (isMounted && off && off.length > 0) setOffers(off);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authService.signIn(email, pass);
    if (res.user) {
      setCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const logout = async () => {
    await authService.signOut();
    setCurrentUser(null);
  };


  const [cart, setCart] = useState<CartItem[]>([
    {
      product: PRODUCTS_DATA[0],
      selectedSize: 'M',
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([PRODUCTS_DATA[1], PRODUCTS_DATA[3]]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(PRODUCTS_DATA[0]);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeFilterOccasion, setActiveFilterOccasion] = useState<string | null>(null);
  const [activeFilterEvent, setActiveFilterEvent] = useState<string | null>(null);
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);

  // Derived filtered subsets
  const newArrivals = useMemo(
    () => products.filter((p) => p.newArrival && p.status === 'published'),
    [products]
  );
  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured && p.status === 'published'),
    [products]
  );
  const trendingProducts = useMemo(
    () => products.filter((p) => p.trending && p.status === 'published'),
    [products]
  );
  const exclusiveProducts = useMemo(
    () => products.filter((p) => p.exclusive && p.status === 'published'),
    [products]
  );

  // Central Dress Library Admin Actions
  const addProduct = (newProdData: Partial<Product>) => {
    const id = newProdData.id || `PR${String(products.length + 1).padStart(3, '0')}`;
    const defaultImg = newProdData.images?.front || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80';
    
    const newProduct: Product = {
      id,
      name: newProdData.name || 'New Couture Ensemble',
      subtitle: newProdData.subtitle || 'Bespoke Creation',
      category: newProdData.category || 'Bridal',
      subcategory: newProdData.subcategory || 'Bridal Lehenga',
      event: newProdData.event || 'BARAT',
      occasion: newProdData.occasion || 'Barat',
      dressType: newProdData.dressType || 'Bridal Lehenga',
      style: newProdData.style || 'Royal Heritage Couture',
      color: newProdData.color || 'Burgundy',
      secondaryColors: newProdData.secondaryColors || ['Gold'],
      colorHex: newProdData.colorHex || '#4A2438',
      fabric: newProdData.fabric || 'Velvet',
      season: newProdData.season || 'Winter',
      price: newProdData.price || 150000,
      salePrice: newProdData.salePrice,
      currency: 'PKR',
      sizes: newProdData.sizes || ['S', 'M', 'L'],
      stock: newProdData.stock ?? 5,
      inStock: (newProdData.stock ?? 5) > 0,
      description: newProdData.description || 'Authentic Pakistani haute couture crafted with master artisan embroideries.',
      tags: newProdData.tags || ['Luxury', 'Traditional'],
      featured: newProdData.featured ?? false,
      trending: newProdData.trending ?? false,
      newArrival: newProdData.newArrival ?? true,
      exclusive: newProdData.exclusive ?? false,
      status: newProdData.status || 'published',
      rating: 5.0,
      reviewCount: 0,
      highlights: newProdData.highlights || ['Pure silk velvet base', 'Hand-crafted bullion embroidery'],
      availability: newProdData.availability || 'In Stock',
      gallery: [
        {
          id: `img-${id}-01`,
          productId: id,
          imageType: 'Front',
          storagePath: `Dresses/${newProdData.category || 'Bridal'}/${id}/front.jpg`,
          imageUrl: defaultImg,
          sortOrder: 1,
          altText: `${newProdData.name || 'Couture'} Front View`,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      images: {
        front: defaultImg,
      },
      isNew: true,
      isTrending: false,
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const duplicateProduct = (id: string) => {
    const original = products.find((p) => p.id === id);
    if (!original) return;
    const newId = `${original.id}-COPY`;
    const duplicated: Product = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      newArrival: true,
    };
    setProducts((prev) => [duplicated, ...prev]);
  };

  const addProductImage = (
    productId: string,
    img: Omit<ProductImage, 'id' | 'createdAt'>
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newImg: ProductImage = {
          ...img,
          id: `img-${productId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        const updatedGallery = [...p.gallery, newImg];
        return {
          ...p,
          gallery: updatedGallery,
          images: {
            ...p.images,
            ...(img.imageType === 'Front' ? { front: img.imageUrl } : {}),
            ...(img.imageType === 'Back' ? { back: img.imageUrl } : {}),
            ...(img.imageType === 'Left' ? { left: img.imageUrl } : {}),
            ...(img.imageType === 'Right' ? { right: img.imageUrl } : {}),
            ...(img.imageType === 'Detail' ? { detail: img.imageUrl } : {}),
            ...(img.imageType === 'Fabric Detail' ? { fabricDetail: img.imageUrl } : {}),
            ...(img.imageType === 'Close Up' ? { closeUp: img.imageUrl } : {}),
            ...(img.imageType === 'Full Look' ? { fullLook: img.imageUrl } : {}),
            ...(img.imageType === '360 Multi-View' ? { multiView360: img.imageUrl } : {}),
          },
        };
      })
    );
  };

  const removeProductImage = (productId: string, imageId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedGallery = p.gallery.filter((g) => g.id !== imageId);
        return { ...p, gallery: updatedGallery };
      })
    );
  };

  const reorderProductImages = (productId: string, newGallery: ProductImage[]) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, gallery: newGallery } : p))
    );
  };

  const setMainProductImage = (productId: string, imageUrl: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          images: {
            ...p.images,
            front: imageUrl,
          },
        };
      })
    );
  };

  const toggleProductStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextStatus = p.status === 'published' ? 'draft' : 'published';
        return { ...p, status: nextStatus };
      })
    );
  };

  // Bridal Studio Look Builder Selection
  const [selectedBridalItems, setSelectedBridalItems] = useState<BridalItem[]>([
    BRIDAL_ITEMS_DATA[0],
    BRIDAL_ITEMS_DATA[1],
    BRIDAL_ITEMS_DATA[2],
  ]);

  const toggleBridalItem = (item: BridalItem) => {
    setSelectedBridalItems((prev) => {
      const exists = prev.some((i) => i.name === item.name);
      if (exists) {
        return prev.filter((i) => i.name !== item.name);
      } else {
        return [...prev, item];
      }
    });
  };

  const bridalLookTotal = selectedBridalItems.reduce((acc, item) => acc + item.price, 0);

  const isBridalOfferEligible =
    selectedBridalItems.some((i) => i.category === 'Bridal Dress') ||
    cart.some((c) => c.product.category === 'Bridal' && c.product.price >= 250000);

  const addToCart = (product: Product, size = 'M') => {
    if (product.stock <= 0) {
      alert(`The ${product.name} is currently fully reserved in our couture archives.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Maximum available atelier inventory (${product.stock} units) reached for this piece.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, selectedSize: size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const currentProd = products.find((p) => p.id === productId);
    if (currentProd && quantity > currentProd.stock) {
      alert(`Cannot exceed available atelier inventory (${currentProd.stock} units).`);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const createOrder = async (orderData: Partial<Order>) => {
    const res = await dbService.createOrder(orderData);
    if (res.order) {
      // Decrement inventory
      setProducts((prev) =>
        prev.map((prod) => {
          const orderedItem = orderData.items?.find((i) => i.name === prod.name);
          if (orderedItem) {
            const nextStock = Math.max(0, prod.stock - orderedItem.quantity);
            return {
              ...prod,
              stock: nextStock,
              inStock: nextStock > 0,
            };
          }
          return prod;
        })
      );
      setOrders((prev) => [res.order!, ...prev]);
    }
    return res;
  };

  const updateOrderStatus = (orderId: string, nextStatus: any) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        if ((nextStatus === 'cancelled' || nextStatus === 'returned') && ord.status !== 'cancelled' && ord.status !== 'returned') {
          setProducts((prodList) =>
            prodList.map((prod) => {
              const item = ord.items.find((i) => i.name === prod.name);
              if (item) {
                const restored = prod.stock + item.quantity;
                return {
                  ...prod,
                  stock: restored,
                  inStock: true,
                };
              }
              return prod;
            })
          );
        }
        return { ...ord, status: nextStatus, updatedAt: new Date().toISOString() };
      })
    );
  };

  const applyCoupon = async (code: string) => {
    const res = await dbService.validateCoupon(code, cartTotal);
    if (res.valid) {
      setAppliedCoupon(code.toUpperCase());
      setCouponDiscount(res.discount);
    }
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        setCurrentUser,
        login,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addProductImage,
        removeProductImage,
        reorderProductImages,
        setMainProductImage,
        toggleProductStatus,
        eventCollections,
        selectedCollection,
        setSelectedCollection,
        newArrivals,
        featuredProducts,
        trendingProducts,
        exclusiveProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        orders,
        createOrder,
        updateOrderStatus,
        offers,
        appliedCoupon,
        setAppliedCoupon,
        couponDiscount,
        applyCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        selectedProduct,
        setSelectedProduct,
        tryOnProduct,
        setTryOnProduct,
        isTryOnModalOpen,
        setIsTryOnModalOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        selectedBridalItems,
        toggleBridalItem,
        bridalLookTotal,
        isBridalOfferEligible,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeFilterOccasion,
        setActiveFilterOccasion,
        activeFilterEvent,
        setActiveFilterEvent,
        customerPhoto,
        setCustomerPhoto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
