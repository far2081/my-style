import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';

// Home & Interactive Sections
import { HeroSection } from './components/home/HeroSection';
import { QuickStyleFinder } from './components/home/QuickStyleFinder';
import { ShopByOccasion } from './components/home/ShopByOccasion';
import { LatestDresses } from './components/home/LatestDresses';
import { FashionTrends2026 } from './components/home/FashionTrends2026';
import { AIStylistSection } from './components/home/AIStylistSection';
import { VirtualTryOnSection } from './components/home/VirtualTryOnSection';
import { RunwaySection } from './components/home/RunwaySection';
import { BridalStudioSection } from './components/home/BridalStudioSection';
import { AIMakeupStudioSection } from './components/home/AIMakeupStudioSection';
import { SmartBridalOfferSection } from './components/home/SmartBridalOfferSection';
import { AIDressStudioSection } from './components/home/AIDressStudioSection';

// Page Views
import { CollectionsView } from './components/views/CollectionsView';
import { WishlistView } from './components/views/WishlistView';
import { AccountView } from './components/views/AccountView';
import { AdminView } from './components/views/AdminView';

// Modals
import { ProductDetailModal } from './components/views/ProductDetailModal';
import { TryOnModal } from './components/common/TryOnModal';
import { CartDrawer } from './components/views/CartDrawer';
import { CheckoutModal } from './components/views/CheckoutModal';
import { SearchModal } from './components/common/SearchModal';

export const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-plum text-ivory selection:bg-champagne selection:text-plum pb-16 lg:pb-0">
      {/* Desktop Header */}
      <Header />

      {/* Independent Mobile Header */}
      <MobileHeader />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <HeroSection />
            <QuickStyleFinder />
            <ShopByOccasion />
            <LatestDresses />
            <FashionTrends2026 />
            <AIStylistSection />
            <VirtualTryOnSection />
            <RunwaySection />
            <BridalStudioSection />
            <AIMakeupStudioSection />
            <SmartBridalOfferSection />
            <AIDressStudioSection />
          </>
        )}

        {activeView === 'stylist' && (
          <div className="pt-4">
            <AIStylistSection />
            <QuickStyleFinder />
          </div>
        )}

        {activeView === 'collections' && <CollectionsView />}

        {activeView === 'latest' && (
          <div className="pt-4">
            <LatestDresses />
            <CollectionsView />
          </div>
        )}

        {activeView === 'trends' && (
          <div className="pt-4">
            <FashionTrends2026 />
          </div>
        )}

        {activeView === 'tryon' && (
          <div className="pt-4">
            <VirtualTryOnSection />
          </div>
        )}

        {activeView === 'bridal' && (
          <div className="pt-4">
            <BridalStudioSection />
            <AIMakeupStudioSection />
            <SmartBridalOfferSection />
          </div>
        )}

        {activeView === 'runway' && (
          <div className="pt-4">
            <RunwaySection />
          </div>
        )}

        {activeView === 'dress-studio' && (
          <div className="pt-4">
            <AIDressStudioSection />
          </div>
        )}

        {activeView === 'offers' && (
          <div className="pt-4">
            <SmartBridalOfferSection />
            <BridalStudioSection />
          </div>
        )}

        {activeView === 'wishlist' && <WishlistView />}

        {activeView === 'account' && <AccountView />}

        {activeView === 'admin' && <AdminView />}
      </main>

      {/* Luxury Footer (contains exact mandatory attribution on every page) */}
      <Footer />

      {/* Independent Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Interactive Global Modals */}
      <ProductDetailModal />
      <TryOnModal />
      <CartDrawer />
      <CheckoutModal />
      <SearchModal />
    </div>
  );
};
