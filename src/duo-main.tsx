import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PapercutDuoPage from './skins/papercut/PapercutDuoPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PapercutDuoPage />
  </StrictMode>,
)
