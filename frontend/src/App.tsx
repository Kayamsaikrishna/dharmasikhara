import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scenarios from './pages/Scenarios';
import Courtroom from './pages/Courtroom';
import Dashboard from './pages/Dashboard';
import MultiplayerPage from './pages/MultiplayerPage';
// import MarketplacePage from './pages/MarketplacePage';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Test from './pages/Test';
import CreateScenario from './pages/CreateScenario';
import PaymentPage from './pages/PaymentPage';
import CartPage from './pages/CartPage';
import LegalAnalysis from './pages/LegalAnalysis';
import LegalAssistant from './pages/LegalAssistant';
import Profile from './pages/Profile';
import DocumentUpload from './pages/DocumentUpload';
import SubscriptionPage from './pages/SubscriptionPage';
import EditProfile from './pages/EditProfile';
import ScenarioDetail from './components/ScenarioDetail';
import ScenarioSimulationPage from './pages/ScenarioSimulationPage';
import ClientInterview from './components/ClientInterview';
// import EvidenceAnalysis from './components/EvidenceAnalysis'; // Remove this import
import DigitalEvidence from './components/DigitalEvidence';
import BailDraft from './pages/BailDraft';
import SimulationEntrance from './components/SimulationEntrance';
import ProgressTest from './components/ProgressTest'; // Add this import
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
import TestScenarios from './components/TestScenarios';
import LegalResearchPage from './pages/LegalResearchPage';
import CertificationPage from './pages/CertificationPage';
import ExpertSupportPage from './pages/ExpertSupportPage';
import CaseSpecificAIPage from './pages/CaseSpecificAIPage';
import MarketingPage from './pages/MarketingPage';
import LegalNewsPage from './pages/LegalNewsPage';

function App() {
  return (
    <Router>
      <UserProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/scenarios" element={<Scenarios />} />
              <Route path="/scenarios/:id" element={<ScenarioDetail />} />
              <Route path="/courtroom" element={<Courtroom />} />
              <Route path="/scenario-simulation" element={<ScenarioSimulationPage />} />
              <Route path="/simulation-entrance" element={<SimulationEntrance />} />
              <Route path="/client-interview" element={<ClientInterview />} />
              {/* <Route path="/evidence-analysis" element={<EvidenceAnalysis />} /> Remove this route */}
              <Route path="/digital-evidence" element={<DigitalEvidence />} />
              <Route path="/bail-draft" element={<BailDraft />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/multiplayer" element={<MultiplayerPage />} />
              {/* <Route path="/marketplace" element={<MarketplacePage />} /> */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/test" element={<Test />} />
              <Route path="/test-scenarios" element={<TestScenarios />} />
              <Route path="/create-scenario" element={<CreateScenario />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/legal-analysis" element={<LegalAnalysis />} />
              <Route path="/legal-assistant" element={<LegalAssistant />} />
              <Route path="/legal-research" element={<LegalResearchPage />} />
              <Route path="/legal-news" element={<LegalNewsPage />} />
              <Route path="/certifications" element={<CertificationPage />} />
              <Route path="/expert-support" element={<ExpertSupportPage />} />
              <Route path="/case-specific-ai" element={<CaseSpecificAIPage />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/account/profile" element={<Profile />} />
              <Route path="/account/upload" element={<DocumentUpload />} />
              <Route path="/account/subscription" element={<SubscriptionPage />} />
              <Route path="/account/payment" element={<PaymentPage />} />
              <Route path="/account/edit-profile" element={<EditProfile />} />
              <Route path="/progress-test" element={<ProgressTest />} /> {/* Add this route */}
            </Routes>
          </div>
        </LanguageProvider>
      </UserProvider>
    </Router>
  );
}

export default App;