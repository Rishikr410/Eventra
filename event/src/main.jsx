import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './pages/style/Global.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
