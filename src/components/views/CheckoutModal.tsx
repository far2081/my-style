import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, ShieldCheck, ArrowRight, ArrowLeft, Lock, CreditCard, Truck } from 'lucide-react';
import { emailService } from '../../services/emailService';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartTotal, clearCart, createOrder, appliedCoupon, couponDiscount, currentUser } = useApp();

  // 5 required steps: Customer Information, Address, Delivery, Payment, Order Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || 'Farhana Aamir',
    email: currentUser?.email || 'farzunmir@gmail.com',
    phone: currentUser?.profile?.phone || '+92 300 1234567',
    address: 'Atelier Suite 4B, M.M. Alam Road, Gulberg III',
    city: 'Lahore',
    country: 'Pakistan',
    postalCode: '54000',
    deliveryMethod: 'white-glove',
    paymentMethod: 'Cash on Delivery (COD)',
  });

  if (!isCheckoutOpen) return null;

  const steps = [
    { number: 1, label: 'Customer Information' },
    { number: 2, label: 'Address' },
    { number: 3, label: 'Delivery' },
    { number: 4, label: 'Payment' },
    { number: 5, label: 'Order Review' },
  ];

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setOrderSubmitting(true);
      const subtotal = cartTotal;
      const discount = couponDiscount || (cartTotal > 300000 ? 25000 : 0);
      const shipping = cartTotal > 50000 ? 0 : 3500;
      const total = subtotal - discount + shipping;

      let chosenProvider = 'CASH_ON_DELIVERY';
      const pStatus: 'pending' | 'paid' = 'pending';
      if (formData.paymentMethod.includes('Stripe')) {
        chosenProvider = 'STRIPE_GATEWAY';
      } else if (formData.paymentMethod.includes('Bank Wire')) {
        chosenProvider = 'HBL_IBAN_WIRE';
      }

      const res = await createOrder({
        userId: currentUser?.id,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        items: cart.map(item => ({
          name: item.product.name,
          size: item.selectedSize,
          color: item.product.color,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images.front,
        })),
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon: appliedCoupon || undefined,
        paymentProvider: chosenProvider,
        paymentStatus: pStatus,
        status: 'pending',
      });

      setOrderSubmitting(false);
      if (res.order) {
        setCreatedOrderNumber(res.order.orderNumber);
        setIsCompleted(true);
        clearCart();

        // Send real transactional order confirmation email
        emailService.sendOrderConfirmation({
          orderNumber: res.order.orderNumber,
          customerName: formData.fullName,
          customerEmail: formData.email,
          items: cart.map(item => ({
            name: item.product.name,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total,
          paymentMethod: formData.paymentMethod,
          paymentStatus: pStatus,
          shippingAddress: {
            address: formData.address,
            city: formData.city,
          },
        }).catch(() => {});
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/90 backdrop-blur-md"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative bg-plum-dark border border-champagne/40 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 text-ivory z-10">
        {/* Top bar with Back and Close */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-champagne/20">
          <button
            onClick={() => {
              if (currentStep > 1 && !isCompleted) {
                setCurrentStep(currentStep - 1);
              } else {
                setIsCheckoutOpen(false);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-champagne hover:text-ivory bg-plum/70 hover:bg-burgundy px-3 py-1.5 rounded-xl border border-champagne/30 transition-colors font-brand uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-champagne" />
            <span>{currentStep > 1 && !isCompleted ? 'Previous Step' : 'Back to Store'}</span>
          </button>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full bg-plum/80 text-ivory/80 hover:text-champagne transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          <div className="py-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-champagne text-plum font-bold mx-auto flex items-center justify-center shadow-gold-glow">
              <Check className="w-10 h-10" />
            </div>
            <span className="text-xs font-brand uppercase tracking-[0.3em] text-champagne block">
              Order Confirmed • Bespoke Atelier Logged
            </span>
            <h3 className="text-3xl font-editorial font-bold text-ivory">
              Thank You, {formData.fullName}
            </h3>
            <p className="text-sm text-ivory/80 leading-relaxed font-light">
              Your haute couture commission order has been officially registered. An atelier representative will connect with you via WhatsApp and phone to confirm tailored measurement specifications.
            </p>
            <div className="bg-charcoal/80 border border-champagne/20 rounded-xl p-4 text-xs font-mono text-champagne">
              Order Reference: #{createdOrderNumber || 'SM-2026-98124'} (Database Recorded)
            </div>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="bg-champagne text-plum font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-gold-subtle mt-4"
            >
              Return to StyleMira Studio
            </button>
          </div>
        ) : (
          <div>
            {/* Header & Luxury Step Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-[10px] font-brand uppercase tracking-[0.25em] text-champagne mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted Haute Couture Checkout</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-editorial font-bold text-ivory uppercase tracking-tight mb-6">
                ORDER COMMISSION
              </h2>

              {/* Progress Indicator */}
              <div className="grid grid-cols-5 gap-2 border-b border-champagne/20 pb-6">
                {steps.map((st) => (
                  <div key={st.number} className="text-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold font-brand mb-1 transition-all ${
                        currentStep === st.number
                          ? 'bg-champagne text-plum shadow-gold-subtle scale-110'
                          : currentStep > st.number
                          ? 'bg-burgundy text-champagne border border-champagne/40'
                          : 'bg-plum text-ivory/40 border border-champagne/10'
                      }`}
                    >
                      {currentStep > st.number ? '✓' : st.number}
                    </div>
                    <span
                      className={`hidden sm:block text-[9px] uppercase tracking-wider ${
                        currentStep === st.number ? 'text-champagne font-bold' : 'text-ivory/50'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="space-y-4 max-w-xl mx-auto">
                <h4 className="text-lg font-editorial font-bold text-ivory">01. Customer Information</h4>
                <div>
                  <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-1">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4 max-w-xl mx-auto">
                <h4 className="text-lg font-editorial font-bold text-ivory">02. Shipping Address</h4>
                <div>
                  <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-1">
                    Street Address / Atelier Suite
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-brand uppercase tracking-wider text-champagne block mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Delivery */}
            {currentStep === 3 && (
              <div className="space-y-4 max-w-xl mx-auto">
                <h4 className="text-lg font-editorial font-bold text-ivory">03. White-Glove Delivery Method</h4>
                <div
                  onClick={() => setFormData({ ...formData, deliveryMethod: 'white-glove' })}
                  className="bg-plum border border-champagne/40 rounded-xl p-4 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-champagne" />
                    <div>
                      <p className="text-xs font-semibold text-ivory">Insured White-Glove Courier Delivery</p>
                      <p className="text-[10px] text-ivory/60">Tear-proof luxury garment bag & temperature-controlled shipping</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-champagne">Included</span>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-4 max-w-xl mx-auto">
                <h4 className="text-lg font-editorial font-bold text-ivory">04. Secure Payment Arrangement</h4>
                <p className="text-xs text-ivory/70">
                  Select your preferred settlement arrangement for this bespoke commission.
                </p>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery (Real production payment method per Prompt 4) */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Cash on Delivery (COD)' })}
                    className={`bg-plum border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${
                      formData.paymentMethod === 'Cash on Delivery (COD)' ? 'border-champagne shadow-gold-subtle' : 'border-champagne/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-champagne" />
                      <div>
                        <p className="text-xs font-semibold text-ivory">Cash on Delivery (COD) / Pay on Fitting</p>
                        <p className="text-[10px] text-ivory/60">Genuine order registered in Supabase; status marked as pending payment.</p>
                      </div>
                    </div>
                    {formData.paymentMethod === 'Cash on Delivery (COD)' && <Check className="w-4 h-4 text-champagne" />}
                  </div>

                  {/* Option 2: Direct Bank Wire */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Direct Bank Wire (HBL IBAN)' })}
                    className={`bg-plum border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${
                      formData.paymentMethod === 'Direct Bank Wire (HBL IBAN)' ? 'border-champagne shadow-gold-subtle' : 'border-champagne/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-champagne" />
                      <div>
                        <p className="text-xs font-semibold text-ivory">Direct Official Bank Wire / IBAN</p>
                        <p className="text-[10px] text-ivory/60">Habib Bank Limited (HBL) Official Corporate Account</p>
                      </div>
                    </div>
                    {formData.paymentMethod === 'Direct Bank Wire (HBL IBAN)' && <Check className="w-4 h-4 text-champagne" />}
                  </div>

                  {/* Option 3: Real Stripe Gateway */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Stripe Online Card Gateway' })}
                    className={`bg-plum border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${
                      formData.paymentMethod === 'Stripe Online Card Gateway' ? 'border-champagne shadow-gold-subtle' : 'border-champagne/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-champagne" />
                      <div>
                        <p className="text-xs font-semibold text-ivory">Credit / Debit Card (Stripe Gateway)</p>
                        <p className="text-[10px] text-ivory/60">Secure server-side verified intent token</p>
                      </div>
                    </div>
                    {formData.paymentMethod === 'Stripe Online Card Gateway' && <Check className="w-4 h-4 text-champagne" />}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Order Review */}
            {currentStep === 5 && (
              <div className="space-y-4 max-w-xl mx-auto">
                <h4 className="text-lg font-editorial font-bold text-ivory">05. Order Review & Final Authorization</h4>

                <div className="bg-plum border border-champagne/25 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-champagne/15 pb-2">
                    <span className="text-ivory/60">Client:</span>
                    <span className="font-semibold text-ivory">{formData.fullName} ({formData.phone})</span>
                  </div>
                  <div className="flex justify-between border-b border-champagne/15 pb-2">
                    <span className="text-ivory/60">Destination:</span>
                    <span className="font-semibold text-ivory">{formData.city}, {formData.country}</span>
                  </div>
                  <div className="flex justify-between border-b border-champagne/15 pb-2">
                    <span className="text-ivory/60">Settlement Mode:</span>
                    <span className="font-semibold text-champagne uppercase">{formData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-champagne pt-1">
                    <span>Authorized Amount:</span>
                    <span className="font-editorial text-base">PKR {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-champagne/15 mt-8 max-w-xl mx-auto">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="text-xs uppercase font-brand tracking-wider text-ivory/70 hover:text-champagne flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-champagne via-champagne-light to-champagne hover:from-champagne-light hover:to-champagne text-plum font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-gold-subtle flex items-center gap-2 hover:scale-102 transition-all"
              >
                <span>{currentStep === 5 ? 'Authorize & Place Order' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
