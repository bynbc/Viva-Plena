import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importa os provedores (Cérebro e Login)
import { BrainProvider } from './context/BrainContext';
import { AuthProvider } from './context/AuthContext';

// AQUI ESTAVA O ERRO: Agora preenchemos o render com o App e os Provedores
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrainProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrainProvider>
  </React.StrictMode>
);
