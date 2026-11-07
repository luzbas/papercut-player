import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PapercutPage from './skins/papercut/PapercutPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PapercutPage />
  </StrictMode>,
)
