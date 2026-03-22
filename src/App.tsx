import { useState } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Historical } from './pages/Historical'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'historical'>('dashboard')

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'dashboard' ? <Dashboard /> : <Historical />}
    </Layout>
  )
}

export default App
