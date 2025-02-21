import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../GlobalContext';
import GenericModal from '../GenericModal';
import UserRegistration from './UserRegistration';
import UserUpdate from './UserUpdate';
import UserView from './UserView';
import Swal from 'sweetalert2';
import { FaTrash, FaEdit } from 'react-icons/fa';
import '../../styles/registeredTables.css';

const API_BASE = 'https://jituze.greenlife.co.ke/rest';

const safeJsonParse = (res) => {
  return res.text().then((text) => {
    try {
      return text ? JSON.parse(text) : {};
    } catch (err) {
      console.error('JSON parse error:', err);
      return {};
    }
  });
};

function UserTable() {
  const { accessToken } = useContext(GlobalContext);

  const getAuthHeaders = () =>
    accessToken
      ? { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [registrationMode, setRegistrationMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const fetchUsers = () => {
    fetch(`${API_BASE}/registration/users`, { headers: getAuthHeaders() })
      .then((res) => safeJsonParse(res))
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setUsers([]);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  const handleDelete = (staffNumber) => {
    const user = users.find((u) => u.staffNumber === staffNumber);
    Swal.fire({
      title: 'Confirm Deletion',
      text: `To delete user "${user.firstName} ${user.lastName}", type "yes":`,
      input: 'text',
      inputPlaceholder: 'Type yes to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#2B9843',
      preConfirm: (inputValue) => {
        if (inputValue !== 'yes') {
          Swal.showValidationMessage('You must type "yes" to confirm deletion.');
        }
        return inputValue;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value === 'yes') {
        fetch(`${API_BASE}/registration/delete?staffNumber=${encodeURIComponent(staffNumber)}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })
          .then((res) => safeJsonParse(res))
          .then((data) => {
            Swal.fire('Success', data.message || 'User deleted successfully!', 'success');
            setUsers(users.filter((u) => u.staffNumber !== staffNumber));
          })
          .catch((error) => {
            console.error('Error deleting user:', error);
            Swal.fire('Error', error.message || 'Error deleting user', 'error');
          });
      }
    });
  };

  const filteredUsers = users.filter((user) => {
    const first = (user.firstName || '').toLowerCase();
    const last = (user.lastName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const group = (user.groupName || '').toLowerCase();
    return (
      first.includes(searchTerm.toLowerCase()) ||
      last.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      group.includes(searchTerm.toLowerCase())
    );
  });

  if (registrationMode) {
    return (
      <GenericModal onClose={() => setRegistrationMode(false)}>
        <UserRegistration
          onClose={() => {
            setRegistrationMode(false);
            fetchUsers();
          }}
        />
      </GenericModal>
    );
  }
  if (editingUser) {
    return (
      <GenericModal onClose={() => setEditingUser(null)}>
        <UserUpdate
          user={editingUser}
          onClose={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      </GenericModal>
    );
  }
  if (viewingUser) {
    return (
      <GenericModal onClose={() => setViewingUser(null)}>
        <UserView user={viewingUser} onClose={() => setViewingUser(null)} />
      </GenericModal>
    );
  }

  return (
    <div className="registered-table">
      <div className="table-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Users"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Registered Users</h2>
        </div>
      </div>
      <div className="table-content">
        <div className="table-controls">
          <button
            className="register-btn"
            onClick={() => setRegistrationMode(true)}
          >
            Register User
          </button>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Group Name</th>
              <th>Staff Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.staffNumber}>
                <td data-label="First Name">{user.firstName}</td>
                <td data-label="Last Name">{user.lastName}</td>
                <td data-label="Phone">{user.phone}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Group Name">{user.groupName}</td>
                <td data-label="Staff Number">{user.staffNumber}</td>
                <td data-label="Actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => setViewingUser(user)}
                  >
                    View
                  </button>
                  <button
                    className="action-btn update-btn"
                    onClick={() => setEditingUser(user)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(user.staffNumber)}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
