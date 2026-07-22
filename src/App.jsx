import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DiscordButton from './components/DiscordButton'
import AnnouncementBanner from './components/AnnouncementBanner'
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
import GEOINT from './pages/GEOSINT'

const PageMeta = () => {
  const location = useLocation()
  const path = location.pathname

  const pageMeta = {
    '/': {
      title: 'DataWire.cc - OSINT Intelligence Platform',
      description: 'Advanced OSINT tools and intelligence gathering platform',
      themeColor: '#ffffff'
    },
    '/login': {
      title: 'Login - DataWire.cc',
      description: 'Sign in to access your OSINT dashboard',
      themeColor: '#ffffff'
    },
    '/dashboard': {
      title: 'Dashboard - DataWire.cc',
      description: 'Your OSINT intelligence dashboard',
      themeColor: '#ffffff'
    },
    '/settings': {
      title: 'Settings - DataWire.cc',
      description: 'Manage your DataWire account settings',
      themeColor: '#ffffff'
    },
    '/purchase': {
      title: 'Purchase - DataWire.cc',
      description: 'Purchase OSINT subscription plans',
      themeColor: '#ffffff'
    },
    '/commands': {
      title: 'Commands - DataWire.cc',
      description: 'Discord bot commands for OSINT',
      themeColor: '#ffffff'
    },
    '/add-bot': {
      title: 'Add Bot - DataWire.cc',
      description: 'Add DataWire bot to your Discord server',
      themeColor: '#ffffff'
    },
    '/privacy': {
      title: 'Privacy Policy - DataWire.cc',
      description: 'DataWire privacy policy',
      themeColor: '#ffffff'
    },
    '/tos': {
      title: 'Terms of Service - DataWire.cc',
      description: 'DataWire terms of service',
      themeColor: '#ffffff'
    },
    '/geoint': {
      title: 'GEOINT - DataWire.cc',
      description: 'AI-powered geolocation analysis using computer vision',
      themeColor: '#ffffff'
    },
  }

  // Check if it's a user profile page
  if (path.startsWith('/users/')) {
    return (
      <Helmet>
        <meta name="theme-color" content="#000000" />
      </Helmet>
    )
  }

  // Get meta for current path or default to home
  const meta = pageMeta[path] || pageMeta['/']

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="theme-color" content={meta.themeColor} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" />
      <meta property="og:url" content={`https://datawire.cc${path}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content="https://i.ibb.co/wFrNvxt5/Chat-GPT-Image-Jul-6-2026-09-02-01-PM-removebg-preview.png" />
    </Helmet>
  )
}

const shouldShowAnnouncement = (path) => {
  // Hide on profile pages and settings
  if (path.startsWith('/users/') || path === '/settings') {
    return false
  }
  return true
}

function App() {
  const location = useLocation()
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <PageMeta />
        <Routes>
          <Route path="/own" element={<Own />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/geoint" element={<GEOINT />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/users/@:username" element={<UserProfile />} />
          <Route path="/users/:username" element={<UserProfile />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="*" element={
            <>
              <Navbar />
              {shouldShowAnnouncement(location.pathname) && <AnnouncementBanner />}
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
