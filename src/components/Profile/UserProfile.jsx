import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
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

  // Fetch the user profile from /registration/user endpoint
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
    // Build the payload with the editable fields (staffNumber removed from payload)
    const payload = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      email: profile.email
    };

    // Include password field only if a new password is provided
    if (newPassword) {
      payload.password = newPassword;
    }

    try {
      const response = await apiClient.put('/registration/update', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        // Pass staffNumber as a query parameter
        params: {
          staffNumber: profile.staffNumber
        }
      });
      Swal.fire('Success', response.data.message || 'Profile updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      Swal.fire('Error', error.response?.data || error.message || 'Error updating profile', 'error');
    }
  };

  if (loading) return <div className="profile-container">Loading profile...</div>;

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
      <form className="profile-form" onSubmit={handleSubmit}>
        {/* Read-only Fields */}
        <div className="form-row">
          <div className="form-group">
            <label>ID</label>
            <input type="text" readOnly value={profile.id} />
          </div>
          <div className="form-group">
            <label>Staff Number</label>
            <input type="text" readOnly value={profile.staffNumber} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Region</label>
            <input type="text" readOnly value={profile.regionName} />
          </div>
          <div className="form-group">
            <label>Sub Region</label>
            <input type="text" readOnly value={profile.subRegion} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Group Name</label>
            <input type="text" readOnly value={profile.groupName} />
          </div>
          <div className="form-group">
            <label>Registered At</label>
            <input type="text" readOnly value={profile.registeredAt} />
          </div>
        </div>

        {/* Editable Fields */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
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
            <label htmlFor="lastName">Last Name</label>
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
            <label htmlFor="phone">Phone</label>
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
            <label htmlFor="email">Email</label>
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
        <hr className="divider" />

        {/* Change Password Section */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="oldPassword">Old Password</label>
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
            <label htmlFor="newPassword">New Password</label>
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
  );
}

export default UserProfile;
