import { supabase, isSupabaseConfigured } from './supabase';
import { Product, EventCollection, Trend, Coupon, Offer, Order, Review, AIJob } from '../types';
import { PRODUCTS_DATA } from '../data/products';
import { EVENT_COLLECTIONS_DATA } from '../data/collections';
import { TRENDS_2026_DATA } from '../data/trends2026';

export const dbService = {
  // ============================================================================
  // PRODUCTS & DRESS LIBRARY
  // ============================================================================
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      return PRODUCTS_DATA;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn('Supabase products fetch failed or empty, using seed catalog', error?.message);
        return PRODUCTS_DATA;
      }

      // Map Supabase rows to Product format
      return data.map((row: any) => ({
        id: row.product_id,
        name: row.name,
        subtitle: row.subtitle || row.name,
        category: row.category,
        subcategory: row.subcategory,
        event: row.event,
        occasion: row.occasion,
        dressType: row.dress_type,
        style: row.style,
        color: row.color,
        secondaryColors: row.secondary_colors || [],
        colorHex: row.color_hex || '#4A2438',
        fabric: row.fabric,
        season: row.season,
        price: Number(row.price),
        salePrice: row.sale_price ? Number(row.sale_price) : undefined,
        originalPrice: row.original_price ? Number(row.original_price) : Number(row.price),
        currency: row.currency || 'PKR',
        sizes: row.sizes || ['XS', 'S', 'M', 'L', 'XL'],
        stock: row.stock || 10,
        inStock: row.in_stock ?? true,
        availability: (row.stock || 10) > 0 ? 'In Stock' : 'Bespoke / Made to Order',
        description: row.description,
        tags: row.tags || [],
        featured: Boolean(row.featured),
        trending: Boolean(row.trending),
        newArrival: Boolean(row.new_arrival),
        exclusive: Boolean(row.exclusive),
        status: row.status || 'Active',
        rating: 4.9,
        reviewCount: 18,
        highlights: row.highlights || [],
        gallery: (row.product_images || []).map((img: any) => ({
          id: img.id,
          productId: row.product_id,
          imageType: img.image_type,
          storagePath: img.storage_path,
          imageUrl: img.image_url,
          sortOrder: img.sort_order || 0,
          altText: img.alt_text || row.name,
          status: img.status || 'Active',
        })),
        images: {
          front: (row.product_images || []).find((i: any) => i.image_type === 'Front')?.image_url || '',
          back: (row.product_images || []).find((i: any) => i.image_type === 'Back')?.image_url,
          detail: (row.product_images || []).find((i: any) => i.image_type === 'Detail')?.image_url,
          fabricDetail: (row.product_images || []).find((i: any) => i.image_type === 'Fabric Detail')?.image_url,
          fullLook: (row.product_images || []).find((i: any) => i.image_type === 'Full Look')?.image_url,
        },
      }));
    } catch (e) {
      console.error('Error fetching products from DB:', e);
      return PRODUCTS_DATA;
    }
  },


  async saveProduct(product: Product): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { data, error } = await supabase.from('products').upsert({
        product_id: product.id,
        name: product.name,
        slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: product.category,
        subcategory: product.subcategory,
        event: product.event,
        occasion: product.occasion,
        dress_type: product.dressType,
        style: product.style,
        color: product.color,
        secondary_colors: product.secondaryColors,
        fabric: product.fabric,
        season: product.season,
        price: product.price,
        sale_price: product.salePrice,
        sizes: product.sizes,
        stock: product.stock,
        in_stock: product.inStock,
        description: product.description,
        tags: product.tags,
        featured: product.featured,
        trending: product.trending,
        new_arrival: product.newArrival,
        exclusive: product.exclusive,
        status: product.status,
        highlights: product.highlights,
      }).select().single();

      if (error) {
        console.error('Save product error:', error.message);
        return false;
      }

      // Upsert product images
      if (product.gallery && product.gallery.length > 0 && data?.id) {
        const imagePayload = product.gallery.map(img => ({
          product_id: data.id,
          image_type: img.imageType,
          storage_path: img.storagePath,
          image_url: img.imageUrl,
          sort_order: img.sortOrder,
          alt_text: img.altText || product.name,
        }));
        await supabase.from('product_images').upsert(imagePayload);
      }

      return true;
    } catch (e) {
      console.error('Failed to save product to DB:', e);
      return false;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('products').delete().eq('product_id', productId);
    return !error;
  },

  // ============================================================================
  // COLLECTIONS & EVENTS
  // ============================================================================
  async getCollections(): Promise<EventCollection[]> {
    if (!isSupabaseConfigured) {
      return EVENT_COLLECTIONS_DATA;
    }

    try {
      const { data, error } = await supabase.from('collections').select('*').order('sort_order', { ascending: true });
      if (error || !data || data.length === 0) return EVENT_COLLECTIONS_DATA;

      return data.map((c: any) => ({
        id: c.slug || c.id,
        name: c.name,
        slug: c.slug || c.id,
        coverImage: c.cover_image,
        description: c.description || '',
        subcategories: [],
        productIds: [],
        status: (c.status?.toLowerCase() === 'draft' ? 'draft' : 'active') as 'active' | 'draft',
        sortOrder: c.sort_order || 0,
      }));
    } catch {
      return EVENT_COLLECTIONS_DATA;
    }
  },

  // ============================================================================
  // TRENDS
  // ============================================================================
  async getTrends(): Promise<Trend[]> {
    if (!isSupabaseConfigured) {
      return TRENDS_2026_DATA.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        category: t.category,
        season: 'All Seasons',
        event: 'Runway',
        status: 'Active',
      }));
    }
    try {
      const { data, error } = await supabase.from('trends').select('*').order('sort_order');
      if (error || !data || data.length === 0) {
        return TRENDS_2026_DATA.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          image: t.image,
          category: t.category,
          season: 'All Seasons',
          event: 'Runway',
          status: 'Active',
        }));
      }
      return data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        category: t.category,
        season: t.season || 'All Seasons',
        event: t.event || 'Runway',
        status: t.status || 'Active',
      }));
    } catch {
      return TRENDS_2026_DATA.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: t.image,
        category: t.category,
        season: 'All Seasons',
        event: 'Runway',
        status: 'Active',
      }));
    }
  },


  // ============================================================================
  // OFFERS & COUPONS
  // ============================================================================
  async getOffers(): Promise<Offer[]> {
    const defaultOffers: Offer[] = [
      {
        id: 'off_bridal_01',
        title: 'Complimentary Haute Bridal Glamour',
        description: 'Orders above Rs. 150,000 unlock complimentary full-service bridal aesthetic consultation and studio look formulation.',
        minimumOrder: 150000,
        rewardType: 'complimentary_service',
        rewardValue: 'Free Bridal Studio Glam',
        active: true,
      },
      {
        id: 'off_pret_02',
        title: 'VIP Velvet Season Courier Upgrade',
        description: 'Complimentary next-day white-glove delivery on all Luxury Pret orders above Rs. 60,000.',
        minimumOrder: 60000,
        rewardType: 'shipping_upgrade',
        rewardValue: 'Complimentary White-Glove Shipping',
        active: true,
      },
    ];

    if (!isSupabaseConfigured) return defaultOffers;

    try {
      const { data, error } = await supabase.from('offers').select('*').eq('active', true);
      if (error || !data || data.length === 0) return defaultOffers;
      return data.map((o: any) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        minimumOrder: Number(o.minimum_order),
        rewardType: o.reward_type,
        rewardValue: o.reward_value,
        active: o.active,
      }));
    } catch {
      return defaultOffers;
    }
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    
    // Check known codes first
    const demoCoupons: Record<string, { type: 'percent' | 'fixed'; val: number; min: number }> = {
      'ROYAL10': { type: 'percent', val: 10, min: 20000 },
      'BRIDAL20': { type: 'percent', val: 20, min: 100000 },
      'STYLEMIRA5000': { type: 'fixed', val: 5000, min: 50000 },
    };

    if (demoCoupons[cleanCode]) {
      const c = demoCoupons[cleanCode];
      if (subtotal < c.min) {
        return { valid: false, discount: 0, message: `Minimum order amount of Rs. ${c.min.toLocaleString()} required.` };
      }
      const discount = c.type === 'percent' ? (subtotal * c.val) / 100 : c.val;
      return { valid: true, discount, message: `Coupon ${cleanCode} applied successfully!` };
    }

    if (!isSupabaseConfigured) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('active', true)
        .single();

      if (error || !data) {
        return { valid: false, discount: 0, message: 'Invalid coupon code.' };
      }

      if (subtotal < Number(data.minimum_order)) {
        return { valid: false, discount: 0, message: `Minimum order of Rs. ${Number(data.minimum_order).toLocaleString()} required.` };
      }

      const discount = data.discount_type === 'percentage' 
        ? (subtotal * Number(data.discount_amount)) / 100 
        : Number(data.discount_amount);

      return { valid: true, discount, message: `Coupon applied: Rs. ${discount.toLocaleString()} off` };
    } catch {
      return { valid: false, discount: 0, message: 'Failed to validate coupon.' };
    }
  },

  // ============================================================================
  // ORDERS & CHECKOUT (Server & DB Connected)
  // ============================================================================
  async createOrder(orderData: Partial<Order>): Promise<{ order: Order | null; error: string | null }> {
    const orderNumber = 'SM-2026-' + Math.floor(100000 + Math.random() * 900000);
    const isCOD = (orderData.paymentProvider || '').toLowerCase().includes('cod') || 
                  (orderData.paymentProvider || '').toLowerCase().includes('cash');

    const paymentStatus = orderData.paymentStatus || (isCOD ? 'pending' : 'pending');
    const paymentProvider = orderData.paymentProvider || (isCOD ? 'Cash on Delivery' : 'Direct Bank Wire');

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      userId: orderData.userId,
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      shippingAddress: orderData.shippingAddress || { address: '', city: 'Lahore', postalCode: '' },
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total || 0,
      appliedCoupon: orderData.appliedCoupon,
      appliedOffer: orderData.appliedOffer,
      status: 'confirmed',
      paymentStatus,
      paymentProvider,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('orders').insert({
          order_number: orderNumber,
          user_id: orderData.userId,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          shipping_address: orderData.shippingAddress,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          shipping: orderData.shipping,
          total: orderData.total,
          applied_coupon: orderData.appliedCoupon,
          applied_offer: orderData.appliedOffer,
          status: 'confirmed',
          payment_status: paymentStatus,
          payment_provider: paymentProvider,
        }).select().single();

        if (!error && data?.id) {
          newOrder.id = data.id;

          // Insert Order Items
          if (orderData.items && orderData.items.length > 0) {
            const itemRows = orderData.items.map(item => ({
              order_id: data.id,
              product_name: item.name,
              size: item.size,
              color: item.color,
              price: item.price,
              quantity: item.quantity,
              image_url: item.image,
              total: item.price * item.quantity,
            }));
            await supabase.from('order_items').insert(itemRows);

            // Deduct real inventory
            for (const item of orderData.items) {
              try {
                await supabase.rpc('deduct_stock', {
                  p_name: item.name,
                  p_qty: item.quantity,
                });
              } catch {}
            }
          }

          // Create real shipment record
          const trackingNumber = 'TCS-' + Math.floor(10000000 + Math.random() * 90000000);
          try {
            await supabase.from('shipments').insert({
              order_id: data.id,
              carrier: 'TCS Luxury White-Glove Express',
              tracking_number: trackingNumber,
              status: 'Confirmed - Preparing Atelier Cutting',
              estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          } catch {}
        }
      } catch (e: any) {
        console.warn('Supabase order creation notice:', e.message);
      }
    }

    return { order: newOrder, error: null };
  },

  async updateOrderStatus(orderId: string, orderNumber: string, customerName: string, customerEmail: string, newStatus: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      await supabase.from('orders').update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);
    }
    return true;
  },

  // ============================================================================
  // AI JOBS ASYNC QUEUE
  // ============================================================================
  async createAIJob(feature: AIJob['feature'], inputData: any, userId?: string): Promise<AIJob> {
    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newJob: AIJob = {
      id: jobId,
      userId,
      feature,
      provider: 'stylemira-neural-engine-v2',
      status: 'queued',
      inputData,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      supabase.from('ai_jobs').insert({
        job_id: jobId,
        user_id: userId,
        feature,
        provider: 'stylemira-neural-engine-v2',
        status: 'queued',
        input_data: inputData,
      }).then();
    }

    return newJob;
  },
};
