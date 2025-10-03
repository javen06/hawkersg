import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HawkerCenterPage from './pages/HawkerCenterPage';
import StallPage from './pages/StallPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import BusinessDashboard from './pages/BusinessDashboard';
import NearbyPage from './pages/NearbyPage';
import ScrollToTop from "./components/ScrollToTop";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50">
            <Header />
            {/* 👇 Push page content below the header */}
            <main className="pt-12">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/nearby" element={<NearbyPage />} />
                <Route path="/hawker/:id" element={<HawkerCenterPage />} />
                <Route path="/browse" element={<SearchPage />} />
                <Route path="/stall/:id" element={<StallPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup-business" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/business" element={<BusinessDashboard />} />
                
              </Routes>
            </main>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;