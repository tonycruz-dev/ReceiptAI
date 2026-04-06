import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReceiptsProvider } from "./context/ReceiptsProvider.tsx";
import './index.css'
import App from './App.tsx'


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReceiptsProvider>
      <App />
    </ReceiptsProvider>
  </StrictMode>
);
