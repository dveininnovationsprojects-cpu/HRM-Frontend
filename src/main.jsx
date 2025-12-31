import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intha rendu line-um puthusa add panni iruken
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// QueryClient instance create panrom
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Unga App-a intha provider kulla wrap pannunga */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)