import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Setup from './pages/Setup'
import History from './pages/History'
import Interview from './pages/Interview'
import Results from './pages/Results'
import Autopsy from './pages/Autopsy'
import AutopsyResult from './pages/AutopsyResult'
import './App.css'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('pv-theme') || 'light'
    setTheme(saved)
    document.body.setAttribute('data-theme', saved)
  }, [])

  function toggleDarkMode() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.body.setAttribute('data-theme', next)
    localStorage.setItem('pv-theme', next)
  }

  return (
    <BrowserRouter>
      <Navbar toggleDarkMode={toggleDarkMode} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/history" element={<History />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/results" element={<Results />} />
          <Route path="/autopsy" element={<Autopsy />} />
          <Route path="/autopsy/result" element={<AutopsyResult />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
