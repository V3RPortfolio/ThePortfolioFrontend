import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { devAccessToken, devRefreshToken, devTokenType } from './constants';
import authService from './services/authentication.service';

const token = typeof window !== 'undefined' ? authService.getAccessToken() : null;
if (!token && !!devAccessToken && !!devRefreshToken && !!devTokenType) {
  console.info('Using development tokens from environment variables');
  authService.setTokens({
    access_token: devAccessToken,
    refresh_token: devRefreshToken,
    token_type: devTokenType,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
