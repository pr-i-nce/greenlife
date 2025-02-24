import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import CommissionRegister from './CommissionRegistration';
import CommissionUpdate from './CommissionUpdate';
import CommissionView from './CommissionView';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../apiClient';
import '../../styles/registeredTables.css';

function CommissionTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  const [commissions, setCommissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [commissionToUpdate, setCommissionToUpdate] = useState(null);
  const [commissionToView, setCommissionToView] = useState(null);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/commission/all`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error("Failed to fetch commissions.");
      const data = await response.json();
      setCommissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommissions(); }, [accessToken]);

  const handleDelete = async (commission) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete commission "${commission.commissionType}", please type "yes" below:`,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Type yes to confirm",
      showCancelButton: true,
      confirmButtonText: "Delete",
      preConfirm: (inputValue) => {
        if (inputValue !== "yes") {
          Swal.showValidationMessage('You must type "yes" to confirm deletion.');
        }
        return inputValue;
      }
    });
    if (result.isConfirmed && result.value === "yes") {
      try {
        const response = await fetch(`${BASE_URL}/commission/${commission.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Delete failed");
        }
        const successMessage = await response.text();
        Swal.fire({ icon: "success", title: "Deleted!", text: successMessage });
        setCommissions(commissions.filter((c) => c.id !== commission.id));
      } catch (err) {
        Swal.fire({ icon: "error", title: "Delete Failed", text: err.message });
      }
    }
  };

  const filteredCommissions = commissions.filter((c) =>
    c.commissionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    fetchCommissions();
  };

  const handleUpdateSuccess = () => {
    setCommissionToUpdate(null);
    fetchCommissions();
  };

  if (showRegisterModal) {
    return <CommissionRegister onClose={() => setShowRegisterModal(false)} onRegisterSuccess={handleRegisterSuccess} />;
  }
  if (commissionToUpdate) {
    return <CommissionUpdate commission={commissionToUpdate} onClose={() => setCommissionToUpdate(null)} onUpdateSuccess={handleUpdateSuccess} />;
  }
  if (commissionToView) {
    return <CommissionView commission={commissionToView} onClose={() => setCommissionToView(null)} />;
  }
  return (
    <div className="registered-table">
      <div className="table-header">
        <img src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Commissions" className="header-image" />
        <div className="header-overlay">
          <h2>Registered Commissions</h2>
        </div>
      </div>
      <div className="table-content">
        <div className="table-controls">
          <button
            className="register-btn"
            onClick={() => {
              if (!groupData?.permissions?.createCommission) {
                Swal.fire({
                  icon: 'error',
                  title: 'Access Denied',
                  text: 'You do not have permission to set a commission.'
                });
                return;
              }
              setShowRegisterModal(true);
            }}
          >
            Set Commission
          </button>
        </div>
        <input type="text" placeholder="Search commissions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
        {loading ? (
          <div>Loading commissions...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Commission Type</th>
                <th>First Commission (%)</th>
                <th>Second Commission (%)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map((c) => (
                <tr key={c.id}>
                  <td data-label="Commission Type">{c.commissionType}</td>
                  <td data-label="Initial Commission">{c.initialCommission}</td>
                  <td data-label="Last Commission">{c.lastCommission}</td>
                  <td data-label="Actions">
                    <button
                      className="action-btn update-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.updateCommission) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'You do not have permission to edit a commission.'
                          });
                          return;
                        }
                        setCommissionToUpdate(c);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.deleteCommission) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'You do not have permission to delete a commission.'
                          });
                          return;
                        }
                        handleDelete(c);
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.readCommission) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: 'You do not have permission to view a commission.'
                          });
                          return;
                        }
                        setCommissionToView(c);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CommissionTable;
