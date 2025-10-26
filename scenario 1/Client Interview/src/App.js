import React, { useState } from 'react';
import InvestigationRoom from './InvestigationRoom';
import CourtRoom from './CourtRoom';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('investigation'); // 'investigation' or 'court'

  return (
    <div className="App">
      <header className="app-header">
        <h1>DharmaSikhara Legal Simulation</h1>
        <nav className="app-navigation">
          <button 
            className={currentView === 'investigation' ? 'nav-button active' : 'nav-button'}
            onClick={() => setCurrentView('investigation')}
          >
            Investigation Room
          </button>
          <button 
            className={currentView === 'court' ? 'nav-button active' : 'nav-button'}
            onClick={() => setCurrentView('court')}
          >
            Courtroom
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {currentView === 'investigation' ? <InvestigationRoom /> : <CourtRoom />}
      </main>
      
      <style jsx>{`
        .App {
          text-align: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        
        .app-header {
          background-color: #1a1a2e;
          color: white;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .app-navigation {
          margin-top: 1rem;
        }
        
        .nav-button {
          background-color: #2a2a3e;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          margin: 0 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .nav-button:hover {
          background-color: #3a3a4e;
        }
        
        .nav-button.active {
          background-color: #4a4a5e;
          font-weight: bold;
        }
        
        .app-main {
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}

export default App;