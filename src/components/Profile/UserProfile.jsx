import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import {
  FaUser,
  FaUserTie,
  FaIdBadge,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaLock,
  FaSpinner
} from 'react-icons/fa';
import apiClient from '../apiClient';
import '../../styles/registeredTables.css';
import '../../styles/profile.css';

function UserProfile() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [profile, setProfile] = useState({
    id: '',
    staffNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    regionName: '',
    subRegion: '',
    groupName: '',
    registeredAt: ''
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get('/registration/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = response.data;
        setProfile({
          id: data.id || '',
          staffNumber: data.staffNumber || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          email: data.email || '',
          regionName: data.regionName || '',
          subRegion: data.subRegion || '',
          groupName: data.groupName || '',
          registeredAt: data.registeredAt || ''
        });
      } catch (error) {
        Swal.fire('Error', error.message || 'Error fetching profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) fetchProfile();
  }, [accessToken]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      email: profile.email,
    };
  
    if (newPassword) {
      payload.oldPassword = oldPassword; // Include old password in payload
      payload.newPassword = newPassword;
    }
  
    try {
      const response = await apiClient.put('/registration/update', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          staffNumber: profile.staffNumber,
        },
      });
  
      Swal.fire('Success', response.data.message || 'Profile updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', error.response?.data?.message || error.message || 'Error updating profile', 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="profile-container loading">
        <FaSpinner className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src="https://images.pexels.com/photos/3184310/pexels-photo-3184310.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="User Profile"
          className="profile-header-image"
        />
        <div className="profile-header-overlay">
          <h2>User Profile</h2>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-overview">
          <h3>Profile Overview</h3>
          <div className="overview-grid">
            <div className="overview-item">
              <FaIdBadge className="overview-icon" />
              <div>
                <span className="overview-label">ID:</span>
                <span className="overview-value">{profile.id}</span>
              </div>
            </div>
            <div className="overview-item">
              <FaIdBadge className="overview-icon" />
              <div>
                <span className="overview-label">Staff Number:</span>
                <span className="overview-value">{profile.staffNumber}</span>
              </div>
            </div>
            <div className="overview-item">
              <FaMapMarkerAlt className="overview-icon" />
              <div>
                <span className="overview-label">Region:</span>
                <span className="overview-value">{profile.regionName}</span>
              </div>
            </div>
            <div className="overview-item">
              <FaMapMarkerAlt className="overview-icon" />
              <div>
                <span className="overview-label">Sub Region:</span>
                <span className="overview-value">{profile.subRegion}</span>
              </div>
            </div>
            <div className="overview-item">
              <FaUsers className="overview-icon" />
              <div>
                <span className="overview-label">Group:</span>
                <span className="overview-value">{profile.groupName}</span>
              </div>
            </div>
            <div className="overview-item">
              <FaCalendarAlt className="overview-icon" />
              <div>
                <span className="overview-label">Registered At:</span>
                <span className="overview-value">{profile.registeredAt}</span>
              </div>
            </div>
          </div>
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <h3>Edit Profile</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                <FaUser className="form-icon" /> First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={profile.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">
                <FaUserTie className="form-icon" /> Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                value={profile.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">
                <FaPhone className="form-icon" /> Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={profile.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="form-icon" /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-divider" />
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="oldPassword">
                <FaLock className="form-icon" /> Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">
                <FaLock className="form-icon" /> New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
