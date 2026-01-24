import React from 'react'
import { Link } from "react-router-dom"
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">ECHOES OF ANANSE'S VOID</span>
        </Link>
        
        <div className="nav-right">
          <Link to="/archive" className="nav-link">MY FEED</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/profile" className="icon-btn" aria-label="User Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m9-9h-6M8 12H2m15.364 6.364l-4.243-4.243m-6.364 0l-4.243 4.243m12.728 0l-4.242-4.242m-6.364 0L2.636 5.636"></path>
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar