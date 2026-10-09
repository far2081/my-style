import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Package, Search, Heart, Sparkles, Folder, Ruler, Bell, Settings, ShieldCheck, Check, ArrowLeft } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { setActiveView, currentUser, login, logout, orders } = useApp();

  const [activeTab, setActiveTab] = useState<string>('profile');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const res = await login(authEmail, authPass);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Login failed');
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'track', label: 'Track Order', icon: Search },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'looks', label: 'Saved Looks', icon: Sparkles },
    { id: 'style-profile', label: 'AI Style Profile', icon: Sparkles },
    { id: 'dress-studio', label: 'AI Dress Studio', icon: Folder },
    { id: 'measurements', label: 'Saved Measurements', icon: Ruler },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="py-16 bg-plum text-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-champagne/20 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setActiveView('home');
                }
              }}
              className="p-2 rounded-xl bg-plum-dark border border-champagne/30 text-champagne hover:bg-burgundy flex items-center gap-1.5 text-xs font-brand uppercase tracking-wider transition-all"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <div className="text-[10px] font-brand uppercase tracking-[0.25em] text-champagne mb-1">
                Private Client Portal • Supabase Auth & RLS
              </div>
              <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-ivory uppercase">
                CLIENT DASHBOARD
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-plum-dark border border-champagne/30 px-4 py-2 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-champagne animate-pulse" />
              <span className="text-xs font-semibold text-champagne">
                {currentUser ? `${currentUser.role.toUpperCase()} SESSION` : 'GUEST'}
              </span>
            </div>
            {currentUser && (
              <button
                onClick={() => logout()}
                className="text-xs border border-rose/40 text-rose hover:bg-rose/10 px-3 py-2 rounded-xl transition-colors font-brand uppercase tracking-wider"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Auth Box if Not Logged In */}
        {!currentUser ? (
          <div className="max-w-md mx-auto bg-plum-dark/95 border border-champagne/30 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="text-center">
              <h3 className="font-editorial text-2xl font-bold text-ivory">Atelier Client Sign In</h3>
              <p className="text-xs text-ivory/60 mt-1">Access your couture commissions, measurements and virtual try-on archives.</p>
            </div>

            {authError && (
              <div className="bg-rose/20 border border-rose/30 text-rose text-xs p-3 rounded-xl text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-brand uppercase tracking-wider text-champagne block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="client@stylemira.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="text-[10px] font-brand uppercase tracking-wider text-champagne block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPass}
                  onChange={(e) => setAuthPass(e.target.value)}
                  className="w-full bg-plum border border-champagne/30 rounded-xl px-4 py-2.5 text-xs text-ivory focus:outline-none focus:border-champagne"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-champagne to-champagne-light text-plum font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:scale-[1.01] transition-all"
              >
                {authLoading ? 'Verifying Credentials...' : 'Sign In with Supabase'}
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard Layout: Tabs + Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Navigation Sidebar (3 cols) */}
            <div className="lg:col-span-3 bg-plum-dark/90 border border-champagne/20 rounded-2xl p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'wishlist') setActiveView('wishlist');
                      else if (tab.id === 'dress-studio') setActiveView('dress-studio');
                      else setActiveTab(tab.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-brand uppercase tracking-wider text-left transition-colors ${
                      isActive
                        ? 'bg-burgundy text-champagne font-bold border border-champagne/30 shadow-gold-subtle'
                        : 'text-ivory/70 hover:bg-plum/50 hover:text-champagne'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-champagne" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Display Area (9 cols) */}
            <div className="lg:col-span-9 bg-plum-dark/80 border border-champagne/25 rounded-2xl p-6 sm:p-8 shadow-luxury">
              {/* My Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="font-editorial text-2xl font-bold text-ivory">My Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-plum p-4 rounded-xl border border-champagne/15">
                      <span className="text-[10px] text-ivory/50 uppercase tracking-wider block">Full Name</span>
                      <span className="text-sm font-semibold text-ivory mt-1 block">{currentUser.name}</span>
                    </div>
                    <div className="bg-plum p-4 rounded-xl border border-champagne/15">
                      <span className="text-[10px] text-ivory/50 uppercase tracking-wider block">Email</span>
                      <span className="text-sm font-semibold text-champagne mt-1 block">{currentUser.email}</span>
                    </div>
                    <div className="bg-plum p-4 rounded-xl border border-champagne/15">
                      <span className="text-[10px] text-ivory/50 uppercase tracking-wider block">Role</span>
                      <span className="text-sm font-semibold text-ivory mt-1 block capitalize">{currentUser.role}</span>
                    </div>
                    <div className="bg-plum p-4 rounded-xl border border-champagne/15">
                      <span className="text-[10px] text-ivory/50 uppercase tracking-wider block">Preferred Palette</span>
                      <span className="text-sm font-semibold text-champagne mt-1 block">
                        {currentUser.profile?.preferredColors?.join(', ') || 'Haute Velvet Palette'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* My Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="font-editorial text-2xl font-bold text-ivory">My Couture Commissions ({orders.length})</h3>
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="bg-plum p-5 rounded-xl border border-champagne/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono text-champagne">ORDER #{ord.orderNumber}</span>
                          <h4 className="font-editorial text-lg font-bold text-ivory mt-0.5">
                            {ord.items[0]?.name || 'Bespoke Couture Piece'}
                          </h4>
                          <span className="text-xs text-ivory/60">
                            Status: <strong className="text-champagne uppercase">{ord.status}</strong> • {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 rounded-full bg-champagne text-plum text-[10px] font-bold uppercase font-brand inline-block mb-1">
                            {ord.paymentStatus}
                          </span>
                          <span className="text-xs font-bold text-champagne font-editorial block">
                            PKR {ord.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            {/* Track Order */}
            {activeTab === 'track' && (
              <div className="space-y-6">
                <h3 className="font-editorial text-2xl font-bold text-ivory">Track Bespoke Production</h3>
                <div className="bg-plum p-6 rounded-xl border border-champagne/20 space-y-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-champagne font-bold font-mono">Commission #SM-2026-98124</span>
                    <span className="text-ivory/60">Estimated Fitting: Nov 15, 2026</span>
                  </div>

                  {/* Production Timeline Milestones */}
                  <div className="space-y-4 pt-2">
                    {[
                      { step: '1. Pattern Drafting & Neural Fit Simulation', done: true },
                      { step: '2. Pure Silk Velvet Dyeing & Kalis Cutting', done: true },
                      { step: '3. Hand Zardozi, Dabka & French Tilla Embroidery', done: true, active: true },
                      { step: '4. Master Tailoring & Can-Can Reinforcement', done: false },
                      { step: '5. Quality Inspection & White-Glove Dispatch', done: false },
                    ].map((m, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            m.done
                              ? m.active
                                ? 'bg-champagne text-plum animate-pulse'
                                : 'bg-burgundy text-champagne border border-champagne/40'
                              : 'bg-charcoal text-ivory/40'
                          }`}
                        >
                          {m.done ? '✓' : idx + 1}
                        </div>
                        <span className={m.active ? 'text-champagne font-bold' : m.done ? 'text-ivory' : 'text-ivory/40'}>
                          {m.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Saved Measurements */}
            {activeTab === 'measurements' && (
              <div className="space-y-6">
                <h3 className="font-editorial text-2xl font-bold text-ivory">Saved Couture Measurements</h3>
                <p className="text-xs text-ivory/70">
                  Calibrated for master bridal tailors to ensure zero-alteration fitting.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Bust / Choli', val: '36.5 inches' },
                    { label: 'Under-Bust', val: '31.0 inches' },
                    { label: 'Waist', val: '28.5 inches' },
                    { label: 'Hip / Flare Start', val: '39.0 inches' },
                    { label: 'Lehenga Length', val: '43.5 inches' },
                    { label: 'Shoulder Width', val: '14.5 inches' },
                    { label: 'Sleeve Length', val: '22.0 inches' },
                    { label: 'Armhole Circumference', val: '16.0 inches' },
                  ].map((meas, idx) => (
                    <div key={idx} className="bg-plum p-3.5 rounded-xl border border-champagne/15">
                      <span className="text-[10px] text-ivory/50 uppercase tracking-wider block">{meas.label}</span>
                      <span className="text-sm font-semibold text-champagne mt-0.5 block">{meas.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Style Profile */}
            {activeTab === 'style-profile' && (
              <div className="space-y-6">
                <h3 className="font-editorial text-2xl font-bold text-ivory">AI Style DNA Profile</h3>
                <div className="space-y-4">
                  <div className="bg-plum p-4 rounded-xl border border-champagne/20">
                    <span className="text-[10px] font-brand uppercase tracking-wider text-champagne">
                      Undertone Analysis
                    </span>
                    <p className="text-sm font-semibold text-ivory mt-1">
                      Warm Golden Olive • Optimal Palettes: Deep Plum, Burgundy, Gilded Amber
                    </p>
                  </div>
                  <div className="bg-plum p-4 rounded-xl border border-champagne/20">
                    <span className="text-[10px] font-brand uppercase tracking-wider text-champagne">
                      Recommended Silhouettes
                    </span>
                    <p className="text-sm font-semibold text-ivory mt-1">
                      Structured A-Line Lehengas, Floor-sweeping Peshwas, Flared Angrakhas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications & Settings */}
            {(activeTab === 'notifications' || activeTab === 'settings') && (
              <div className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-ivory capitalize">{activeTab}</h3>
                <div className="bg-plum p-4 rounded-xl border border-champagne/20 text-xs text-ivory/80 space-y-2">
                  <p>• SMS & WhatsApp bridal order updates enabled</p>
                  <p>• Private Runway VIP invitations enabled</p>
                  <p>• Currency preferred: PKR (Pakistani Rupee)</p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

