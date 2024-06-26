
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { persistor, store } from './Components/redux/store.js'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import ThemeProvider from './Components/PrivateRoute/ThemeProvider.jsx'
import {QueryClient, QueryClientProvider} from 'react-query'

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={new QueryClient()}>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider>
        <App />
    </ThemeProvider>
    </PersistGate>
  </Provider>
  </QueryClientProvider>
)
