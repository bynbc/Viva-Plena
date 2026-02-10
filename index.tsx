import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importa os provedores (o cérebro e a segurança)
import { BrainProvider } from './context/BrainContext';
import { AuthProvider } from './context/AuthContext';

// AQUI ESTAVA O ERRO: O render precisa ter o conteúdo dentro!
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrainProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrainProvider>
  </React.StrictMode>
);
