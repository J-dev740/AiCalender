import './index.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { Provider } from 'react-redux'
import App from './App.jsx'
import store from './redux/store.js'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Make sure to properly create the root
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Then render your app
root.render(
  <Provider store={store}>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </Provider>
)