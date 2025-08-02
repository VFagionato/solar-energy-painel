import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import config from './config/env'
import { apiService } from './services/api'

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

function App() {
  const [count, setCount] = useState(0)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true)
        const health = await apiService.healthCheck()
        setHealthStatus(health)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to API')
        setHealthStatus(null)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{config.app.name}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      <div className="card">
        <h3>API Status</h3>
        {loading && <p>Checking API health...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {healthStatus && (
          <div>
            <p style={{ color: 'green' }}>✅ API is {healthStatus.status}</p>
            <p>Service: {healthStatus.service}</p>
            <p>Last check: {new Date(healthStatus.timestamp).toLocaleTimeString()}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Environment Info</h3>
        <p>Environment: {config.app.environment}</p>
        <p>Version: {config.app.version}</p>
        <p>API URL: {config.api.baseUrl}</p>
        {config.features.debug && <p>Debug mode: ON</p>}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
