import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAccessToken, setGroupData } from './store/authSlice';
import apiClient from './apiClient';
import '../styles/login.css';
import '../styles/hero.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginEndpoint = '/registration/login';
      
      const response = await apiClient.post(loginEndpoint, null, {
        params: {
          email: email,
          password: password,
        },
      });
      
      const responseData = response.data;
      const token = responseData.token || response.headers?.authorization || response.headers?.Authorization;
      if (token) {
        dispatch(setAccessToken(token));
        const { groupName, permissions } = responseData;
        const filteredData = { groupName, permissions };
        console.log('Group data:', filteredData);
        dispatch(setGroupData(filteredData));
        navigate('/landingpage');
      } else {
        setErrorMessage('No token received.');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <>
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
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Sign In</h2>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                <FaUser className="icon" /> Email
              </label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                <FaLock className="icon" /> Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input-field password-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
