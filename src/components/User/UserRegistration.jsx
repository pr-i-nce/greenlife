import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { FaUser, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import '../../styles/registeredTables.css';
import { BASE_URL } from '../apiClient';

const UserRegistration = ({ onClose, onRegistrationSuccess }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [regFormData, setRegFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    userTitle: '',
    groupName: '',
  });

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/group/all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        Swal.fire('Error', err.message, 'error');
      });
  }, [accessToken]);

  const handleRegChange = (e) => {
    setRegFormData({ ...regFormData, [e.target.id]: e.target.value });
  };

  const handleRegSubmit = (e) => {
    e.preventDefault();

    fetch(`${BASE_URL}/registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify(regFormData),
    })
      .then((res) => res.text())
      .then((text) => {
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          console.error('JSON parse error:', err);
          data = {};
        }
        if (data && data.staffNumber) {
          Swal.fire('Success', data.message || 'User registered successfully!', 'success');
          onClose();
          if (onRegistrationSuccess) onRegistrationSuccess();
        } else {
          Swal.fire('Error', 'User not created.', 'error');
        }
      })
      .catch((error) => {
        console.error('Registration error:', error);
        Swal.fire('Error', error.message || 'Error creating user', 'error');
      });
  };

  return (
    <div className="region-container">
      <div className="region-header">
        <img
          src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="User Registration"
          className="region-header-image"
        />
        <div className="region-header-overlay">
          <h2>User Registration</h2>
        </div>
      </div>
      <form className="region-form" onSubmit={handleRegSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              <FaUser className="icon" /> First Name
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter first name"
              value={regFormData.firstName}
              onChange={handleRegChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              <FaUser className="icon" /> Last Name
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter last name"
              value={regFormData.lastName}
              onChange={handleRegChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone className="icon" /> Phone
            </label>
            <input
              type="text"
              id="phone"
              placeholder="Enter phone"
              value={regFormData.phone}
              onChange={handleRegChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              value={regFormData.email}
              onChange={handleRegChange}
              required
            />
          </div>
        </div>
        {/* <div className="form-row">
          <div className="form-group">
            <label htmlFor="userTitle">
              <FaIdBadge className="icon" /> User Title
            </label>
            <select
              id="userTitle"
              value={regFormData.userTitle}
              onChange={handleRegChange}
              required
            >
              <option value="">Select User Title</option>
              <option value="001">Admin</option>
              <option value="002">Director</option>
              <option value="003">Regional Manager</option>
              <option value="004">Sub Regional Manager</option>
            </select>
          </div>
        </div> */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupName">
              <FaIdBadge className="icon" /> Group Name
            </label>
            <select
              id="groupName"
              value={regFormData.groupName}
              onChange={handleRegChange}
              required
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group.groupName} value={group.groupName}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="submit-btn">
          Register User
        </button>
      </form>
    </div>
  );
};

export default UserRegistration;
