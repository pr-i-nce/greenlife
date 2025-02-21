import React from 'react';
import { 
  FaSignInAlt, 
  FaUserPlus, 
  FaChartLine, 
  FaUserCheck, 
  FaRegLightbulb 
} from 'react-icons/fa';
import '../styles/hero.css';

function Hero() {
  return (
    <div className="admin-landing">
      {/* Header */}
      <header className="admin-header">
        <div className="header-flex">
          <img 
            src="https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=100" 
            alt="GreenLife Logo" 
            className="logo"
          />
          <h1>GreenLife Admin Portal</h1>
        </div>
      </header>

      {/* Intro / Hero Section */}
      <section className="intro-section">
        <div className="intro-flex">
          <div className="intro-text">
            <h2>Welcome to Your Sales Management Hub</h2>
            <p>
              Manage your team with real-time analytics, intuitive dashboards, and tools designed to help your business thrive.
            </p>
            <div className="auth-buttons">
              <a href="/login"  className="link">
              <button className="btn btn-signin">
                <FaSignInAlt className="icon" /> Sign In
              </button>
              </a>
              <a href="/user-register" className="link">
              <button className="btn btn-signup">
                <FaUserPlus className="icon" /> Sign Up
              </button>
              </a>
            </div>
          </div>
          <div className="intro-image">
            <img 
              src="https://imgs.search.brave.com/3JNMEZKTFgK5z_OG9fVKf5I3LyTBUUtNz1zk-n2ykro/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM4/MDkzMzk1L3Bob3Rv/L2ZlcnRpbGl6ZXJz/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz14ZjJNVjJxTWlf/Uk1wTEdTeUNGdWVr/bl8zaWJTTDJHZWZQ/MjhnOC1LVURNPQ" 
              alt="Dashboard Preview" 
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="hiw-section">
        <div className="hiw-overlay" />
        <div className="hiw-inner">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <FaChartLine className="step-icon" />
              <h3>Track Sales</h3>
              <p>Monitor real-time performance trends.</p>
            </div>
            <div className="step">
              <FaUserCheck className="step-icon" />
              <h3>Manage Agents</h3>
              <p>Effortlessly assign tasks and track progress.</p>
            </div>
            <div className="step">
              <FaRegLightbulb className="step-icon" />
              <h3>Gain Insights</h3>
              <p>Generate detailed reports for smarter decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-cards">
          <div className="card">
            <img 
              src="https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800" 
              alt="Sales Tracking" 
              className="card-image"
            />
            <div className="card-content">
              <FaChartLine className="card-icon" />
              <h3>Sales Tracking</h3>
              <p>Stay updated with live performance metrics.</p>
            </div>
          </div>
          <div className="card">
            <img 
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800" 
              alt="Agent Management" 
              className="card-image"
            />
            <div className="card-content">
              <FaUserCheck className="card-icon" />
              <h3>Agent Management</h3>
              <p>Organize your team, assign tasks, and monitor progress.</p>
            </div>
          </div>
          <div className="card">
            <img 
              src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=800" 
              alt="Real-Time Analytics" 
              className="card-image"
            />
            <div className="card-content">
              <FaRegLightbulb className="card-icon" />
              <h3>Real-Time Analytics</h3>
              <p>Access insights and detailed reports instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join now and take control of your sales management.</p>
        <div className="cta-buttons">
        <a href="/login"  className="link">
              <button className="btn btn-signin">
                <FaSignInAlt className="icon" /> Sign In
              </button>
              </a>
              <a href="/user-register" className="link">
              <button className="btn btn-signup">
                <FaUserPlus className="icon" /> Sign Up
              </button>
              </a>
        </div>
      </section>
    </div>
  );
}

export default Hero;
