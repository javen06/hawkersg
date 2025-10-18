import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HawkerCenterPage from './pages/HawkerCenterPage';
import StallInformationPage from './pages/StallInformationPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ConsumerProfilePage from './pages/ConsumerProfilePage';
import NearbyPage from './pages/NearbyPage';
import ScrollToTop from "./components/ScrollToTop";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EditConsumerProfilePage from "./pages/EditConsumerProfilePage";
import BusinessProfile from './pages/BusinessProfile';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-12">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

// 👇 put location logic here (inside Router)
function AppRoutes() {
  const location = useLocation();
  const state = location.state as { background?: Location };

  return (
    <>
      {/* main routes */}
      <Routes location={state?.background || location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/nearby" element={<NearbyPage key={location.key} />} />
        <Route path="/hawker/:id" element={<HawkerCenterPage />} />
        <Route path="/browse" element={<SearchPage />} />
        <Route path="/stall/:id" element={<StallInformationPage />} />
        <Route path="/stall/:stallId" element={<StallInformationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup-business" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ConsumerProfilePage />} />
        <Route path="/business" element={<BusinessProfile />} />
      </Routes>

      {/* modal route */}
      {state?.background && (
        <Routes>
          <Route path="/profile/edit" element={<EditConsumerProfilePage currentUser={undefined} />} />
        </Routes>
      )}
    </>
  );
}


export default App;