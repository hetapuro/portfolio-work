import { useEffect, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { appendAuthUser } from './reducers/authUserReducer'
import projectService from './services/projects'
import hourlogService from './services/hourlogs'
import notifService from './services/notifs'
import selfevalService from './services/selfevals'
import transactions from './services/transactions'
import userService from './services/users'
import { useDispatch, useSelector } from 'react-redux'

import LoginPage from './components/loginPage'
import PricacyPolicy from './components/privacyPolicy'
import Header from './components/Mains/header'
import AppRoutes from './components/Mains/routes'
import Footer from './components/Mains/footer'

import './styles.css'
import { ColorContext } from './components/colorContext'

const App = () => {
  const user = useSelector(state => state.authedUser)
  const { inlineStyles } = useContext(ColorContext)
  const dispatch = useDispatch()

  useEffect(() => {
    // Update the background color of the body element when the colors change
    Object.entries(inlineStyles).forEach(([variable, value]) => {
      document.body.style.setProperty(variable, value)
    });
  }, [inlineStyles]);

  // Checks session storage upon loading
  useEffect(() => {
    console.log('checking user')
    const loggedUserJSON = sessionStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(appendAuthUser(user))
      projectService.setToken(user.token)
      hourlogService.setToken(user.token)
      notifService.setToken(user.token)
      selfevalService.setToken(user.token)
      transactions.setToken(user.token)
      userService.setToken(user.token)
    }

    setTimeout(() => {
    }, 1500)

  }, [])

  return (
    <Router>
      {!user && (
        <Routes>
          <Route path='/' element={<LoginPage />}/>
          <Route path='/privacyPolicy' element={<PricacyPolicy />} />
        </Routes>
      )}
      {user && (
        <>
          <Header />
          <AppRoutes />
          <Footer />
      </>
      )}
    </Router>
  )
}

export default App