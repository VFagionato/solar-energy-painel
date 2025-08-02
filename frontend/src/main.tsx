import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { customTheme } from './theme/index'
import './index.css'
import 'antd/dist/reset.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={customTheme} locale={enUS}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
