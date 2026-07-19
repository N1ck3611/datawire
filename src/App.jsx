import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DiscordButton from './components/DiscordButton'
import EyeBackground from './components/EyeBackground'
import Home from './pages/Home'
import Commands from './pages/Commands'
import Own from './pages/Own'
import AddBot from './pages/AddBot'
import Privacy from './pages/Privacy'
import TOS from './pages/TOS'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Purchase from './pages/Purchase'
import Callback from './pages/Callback'
import UserSettings from './pages/UserSettings'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/own" element={<Own />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/users/@:username" element={<UserProfile />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="*" element={
            <>
              <Navbar />
              <EyeBackground />
              <main className="flex-1 relative z-10">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/commands" element={<Commands />} />
                  <Route path="/add-bot" element={<AddBot />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/tos" element={<TOS />} />
                </Routes>
              </main>
              <Footer />
              <DiscordButton />
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
