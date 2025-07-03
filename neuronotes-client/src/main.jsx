import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ThemeProviderWrapper from './contexts/ThemeProviderWrapper';



ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProviderWrapper>
    <App />
  </ThemeProviderWrapper>
);
