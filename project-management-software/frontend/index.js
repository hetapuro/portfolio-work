import React from 'react'
import ReactDOM from 'react-dom/client'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { ColorProvider } from './components/colorContext'

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css"
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min"

import App from './App';

import projectReducer from './reducers/projectReducer'
import hourlogReducer from './reducers/hourlogReducer'
import notifReducer from './reducers/notifReducer'

const store = configureStore({
  reducer: {
    projects: projectReducer,
    hourlogs: hourlogReducer,
    notifs: notifReducer
  }
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ColorProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </ColorProvider>
)