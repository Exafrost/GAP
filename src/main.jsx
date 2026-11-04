import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

// HashRouter : les adresses sont du type /#/jeu/123, compatible avec GitHub Pages
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </HashRouter>
);
