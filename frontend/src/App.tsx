import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
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
// import LegalAnalysis from './pages/LegalAnalysis';
import LegalAssistant from './pages/LegalAssistant';
import DocumentSummary from './pages/DocumentSummary';
import DocumentKeyPoints from './pages/DocumentKeyPoints';
import DocumentSections from './pages/DocumentSections';
import DocumentFull from './pages/DocumentFull';
import DocumentChat from './pages/DocumentChat';
import Profile from './pages/Profile';
// import DocumentUpload from './pages/DocumentUpload';
import SubscriptionPage from './pages/SubscriptionPage';
import EditProfile from './pages/EditProfile';
import ScenarioDetail from './components/ScenarioDetail'; // Use the original component
import ScenarioSimulationPage from './pages/ScenarioSimulationPage';
import ClientInterview from './components/ClientInterview';
// import EvidenceAnalysis from './components/EvidenceAnalysis'; // Remove this import
import DigitalEvidence from './components/DigitalEvidence';
import BailDraft from './pages/BailDraft';
import SimulationEntrance from './components/SimulationEntrance';
import LegalAssessment from './components/LegalAssessment';
import LegalResearchPage from './pages/LegalResearchPage';
import ProgressTest from './components/ProgressTest';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/account/profile" element={<Profile />} />
            <Route path="/account/edit-profile" element={<EditProfile />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/account/subscription" element={<SubscriptionPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/legal-assistant" element={<LegalAssistant />} />
            <Route path="/courtroom" element={<Courtroom />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />
            {/* <Route path="/marketplace" element={<MarketplacePage />} /> */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/test" element={<Test />} />
            <Route path="/client-interview" element={<ClientInterview />} />
            {/* <Route path="/evidence-analysis" element={<EvidenceAnalysis />} /> */}
            <Route path="/digital-evidence" element={<DigitalEvidence />} />
            <Route path="/bail-draft" element={<BailDraft />} />
            <Route path="/progress-test" element={<ProgressTest />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/scenarios/:id" element={<ScenarioDetail />} />
            <Route path="/simulation-entrance" element={<SimulationEntrance />} />
            <Route path="/scenario-simulation" element={<ScenarioSimulationPage />} />
            <Route path="/legal-assessment" element={<LegalAssessment />} />
            <Route path="/legal-research" element={<LegalResearchPage />} />
            <Route path="/legal-assistant" element={<LegalAssistant />} />
            <Route path="/document-summary" element={<DocumentSummary />} />
            <Route path="/document-key-points" element={<DocumentKeyPoints />} />
            <Route path="/document-sections" element={<DocumentSections />} />
            <Route path="/document-full" element={<DocumentFull />} />
            <Route path="/document-chat" element={<DocumentChat />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </LanguageProvider>
    </Router>
  );
}

export default App;