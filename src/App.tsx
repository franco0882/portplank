import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { LandingPage } from './components/marketing/LandingPage';
import { PricingPage } from './components/marketing/PricingPage';
import { AboutPage } from './components/marketing/AboutPage';
import { SignupForm } from './components/auth/SignupForm';
import { LoginForm } from './components/auth/LoginForm';
import { DashboardRoutes } from './components/dashboard/DashboardRoutes';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { SuccessPage } from './components/success/SuccessPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">Setting up your workspace...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but no profile, redirect to login to re-authenticate
  if (user && !userProfile && !loading) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Marketing Route Component
const MarketingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = React.useState<'free' | 'startup' | 'agency'>('free');
  const [selectedPriceId, setSelectedPriceId] = React.useState<string | undefined>(undefined);

  const handleGetStarted = () => {
    setSelectedPlan('free');
    setSelectedPriceId(undefined);
  };

  const handleSelectPlan = (plan: 'free' | 'startup' | 'agency', priceId?: string) => {
    setSelectedPlan(plan);
    setSelectedPriceId(priceId);
  };

  return (
    <Router>
      <Routes>
        {/* Marketing Routes */}
        <Route path="/" element={
          <MarketingRoute>
            <MarketingLayout>
              <LandingPage onGetStarted={handleGetStarted} />
            </MarketingLayout>
          </MarketingRoute>
        } />
        
        <Route path="/pricing" element={
          <MarketingRoute>
            <MarketingLayout>
              <PricingPage onSelectPlan={handleSelectPlan} />
            </MarketingLayout>
          </MarketingRoute>
        } />
        
        <Route path="/about" element={
          <MarketingRoute>
            <MarketingLayout>
              <AboutPage onGetStarted={handleGetStarted} />
            </MarketingLayout>
          </MarketingRoute>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={
          <MarketingRoute>
            <LoginForm />
          </MarketingRoute>
        } />
        
        <Route path="/signup" element={
          <MarketingRoute>
            <SignupForm
              selectedPlan={selectedPlan}
              selectedPriceId={selectedPriceId}
            />
          </MarketingRoute>
        } />

        {/* Success Page */}
        <Route path="/success" element={<SuccessPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardRoutes />
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;