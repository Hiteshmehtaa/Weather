import { Suspense, lazy, useState } from 'react'
import { Layout } from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const Historical = lazy(() => import('./pages/Historical').then((module) => ({ default: module.Historical })))

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'historical'>('dashboard')

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant">
            <span className="text-sm font-semibold tracking-wide">Loading weather modules...</span>
          </div>
        }
      >
        {currentPage === 'dashboard' ? <Dashboard /> : <Historical />}
      </Suspense>
    </Layout>
  )
}

export default App
