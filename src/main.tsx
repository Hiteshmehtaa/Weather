import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
 // This MUST be processed by PostCSS/Tailwind

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Lock app visuals to dark theme.
document.documentElement.classList.remove('light')
document.documentElement.classList.add('dark')
document.documentElement.setAttribute('data-theme', 'dark')
document.body.classList.remove('light')
document.body.classList.add('dark')
document.documentElement.style.colorScheme = 'dark'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
