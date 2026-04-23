import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { devAccessToken, devRefreshToken, devTokenType } from './constants';
import httpService from './services/http.service.ts'

const token = typeof window !== 'undefined' ? httpService.getAccessToken() : null;
const refreshToken = typeof window !== 'undefined' ? httpService.getRefreshToken() : null;
if ((!token || !refreshToken) && !!devAccessToken && !!devRefreshToken && !!devTokenType) {
  console.info('Using development tokens from environment variables');
  httpService.setTokens({
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
