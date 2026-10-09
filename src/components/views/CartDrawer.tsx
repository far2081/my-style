import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    setIsCheckoutOpen,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
  } = useApp();

  const [inputCoupon, setInputCoupon] = React.useState('');
  const [couponMsg, setCouponMsg] = React.useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const shippingCost = cartTotal > 50000 ? 0 : 3500;
  const estimatedDiscount = couponDiscount > 0 ? couponDiscount : (cartTotal > 300000 ? 25000 : 0);
  const grandTotal = Math.max(0, cartTotal - estimatedDiscount + shippingCost);

  const handleApplyCoupon = async () => {
    if (!inputCoupon.trim()) return;
    const res = await applyCoupon(inputCoupon);
    setCouponMsg({ text: res.message, isError: !res.valid });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };


  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-plum-dark border-l border-champagne/30 h-full flex flex-col justify-between shadow-2xl z-10 text-ivory">
        {/* Drawer Header */}
        <div className="p-6 border-b border-champagne/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-champagne" />
            <h3 className="font-editorial text-2xl font-bold uppercase tracking-tight">
              YOUR WARDROBE ({cart.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-champagne bg-plum/60 hover:bg-burgundy px-3 py-1.5 rounded-xl border border-champagne/30 transition-colors font-brand uppercase tracking-wider"
              title="Back to Shopping"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-ivory/70 hover:text-champagne transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-champagne/40 mx-auto" />
              <p className="text-base font-editorial text-ivory/80">Your shopping bag is currently empty.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-xs uppercase font-brand tracking-widest text-champagne underline"
              >
                Discover Haute Couture
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="bg-plum/60 border border-champagne/20 rounded-xl p-4 flex gap-4 items-center"
              >
                <img
                  src={item.product.images.front}
                  alt={item.product.name}
                  className="w-16 h-20 rounded-lg object-cover flex-shrink-0 border border-champagne/30"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-brand tracking-wider text-champagne-light">
                    {item.product.category}
                  </span>
                  <h4 className="text-sm font-editorial font-bold text-ivory truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-[11px] text-ivory/60 mt-0.5">
                    Size: <strong>{item.selectedSize}</strong> • {item.product.color}
                  </div>
                  <div className="text-xs font-bold font-editorial text-champagne mt-1">
                    PKR {(item.product.price * item.quantity).toLocaleString()}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-champagne/30 rounded-lg bg-charcoal/60">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)
                        }
                        className="px-2 py-1 text-ivory/70 hover:text-champagne"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)
                        }
                        className="px-2 py-1 text-ivory/70 hover:text-champagne"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="text-rose hover:text-rose-soft text-xs transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-6 bg-plum-dark/95 border-t border-champagne/20 space-y-4">
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON (e.g. ROYAL10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="flex-1 bg-plum border border-champagne/30 rounded-lg px-3 py-1.5 text-xs text-ivory uppercase placeholder:normal-case placeholder:text-ivory/40 focus:outline-none focus:border-champagne"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-burgundy border border-champagne/40 text-champagne px-3 py-1.5 rounded-lg text-xs font-brand uppercase tracking-wider hover:bg-plum"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[10px] ${couponMsg.isError ? 'text-rose' : 'text-emerald-400'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            <div className="space-y-2 text-xs text-ivory/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-ivory font-mono">PKR {cartTotal.toLocaleString()}</span>
              </div>
              {estimatedDiscount > 0 && (
                <div className="flex justify-between text-champagne">
                  <span>{appliedCoupon ? `Coupon (${appliedCoupon})` : 'VIP Atelier Privilege'}</span>
                  <span className="font-mono">- PKR {estimatedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured White-Glove Shipping</span>
                <span className="text-ivory font-mono">
                  {shippingCost === 0 ? 'Complimentary' : `PKR ${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-champagne pt-2 border-t border-champagne/15">
                <span className="font-brand uppercase tracking-wider">Total Investment</span>
                <span className="font-editorial text-lg">PKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl shadow-gold-subtle hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-ivory/50">
              <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
              <span>Complimentary insured shipping on luxury orders</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
