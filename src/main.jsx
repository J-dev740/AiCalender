import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { Provider as ReduxProvider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import store from './redux/store.js' // You'll need to create this

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <ReduxProvider store={store}> */}
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    {/* </ReduxProvider> */}
  </StrictMode>,

)
