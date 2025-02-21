import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaTrash, FaEye } from 'react-icons/fa';
import GenericModal from '../GenericModal';
import AgentsRegistration from './AgentRegistration';
import AgentsUpdate from './AgentUpdate';
import AgentsView from './AgentsView';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

function AgentsTable() {
  const { groupData, accessToken } = useContext(GlobalContext);
  const [registerMode, setRegisterMode] = useState(false);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const BASE_URL = 'https://jituze.greenlife.co.ke/rest';

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/agent/all`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to fetch agents.');
      }
      const data = await response.json();
      setAgents(data);
      console.log(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchAgents();
  }, [accessToken]);

  const filteredAgents = agents.filter(agent => {
    const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
    const distributorName = (agent.distributor || "").toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (agent.idNumber && agent.idNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agent.subRegion && agent.subRegion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      distributorName.includes(searchTerm.toLowerCase()) ||
      (agent.email && agent.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleDelete = async (email) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the agent with email: ${email}`,
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Type yes to confirm',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      preConfirm: (inputValue) => {
        if (inputValue !== 'yes') {
          Swal.showValidationMessage('You must type "yes" to confirm deletion.');
        }
        return inputValue;
      }
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`${BASE_URL}/agent/delete?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Delete failed');
      }
      const successMessage = await response.text();
      Swal.fire({ icon: 'success', title: 'Deleted!', text: successMessage });
      setAgents(prevAgents => prevAgents.filter(agent => agent.email !== email));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message });
    }
  };

  const handleEdit = (record) => setEditingRecord(record);
  const handleView = (record) => setViewRecord(record);

  if (loading) return <div className="registered-table">Loading agents...</div>;
  if (error) return <div className="registered-table">Error: {error}</div>;

  return (
    <>
      {(registerMode || editingRecord || viewRecord) ? (
        <>
          {registerMode && (
            <GenericModal onClose={() => setRegisterMode(false)}>
              <AgentsRegistration onClose={() => setRegisterMode(false)} onRegistrationSuccess={fetchAgents} />
            </GenericModal>
          )}
          {editingRecord && (
            <GenericModal onClose={() => setEditingRecord(null)}>
              <AgentsUpdate record={editingRecord} onClose={() => setEditingRecord(null)} onUpdateSuccess={fetchAgents} />
            </GenericModal>
          )}
          {viewRecord && (
            <GenericModal onClose={() => setViewRecord(null)}>
              <AgentsView record={viewRecord} onClose={() => setViewRecord(null)} />
            </GenericModal>
          )}
        </>
      ) : (
        <div className="registered-table">
          <div className="table-controls">
            <button
              className="register-btn"
              onClick={() => {
                if (!groupData?.permissions?.createAgent) {
                  Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to register an agent.' });
                  return;
                }
                setRegisterMode(true);
              }}
            >
              Register
            </button>
          </div>
          <div className="table-header">
            <img
              src="https://images.pexels.com/photos/3184425/pexels-photo-3184425.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Agents"
              className="header-image"
            />
            <div className="header-overlay">
              <h2>Agents</h2>
            </div>
          </div>
          <div className="table-content">
            <input
              type="text"
              placeholder="Search agents by name, id, subregion, distributor, or email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table>
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Agent Name</th>
                  <th>ID Number</th>
                  <th>Sub Region</th>
                  <th>Distributor</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent, index) => (
                    <tr key={agent.id}>
                      <td data-label="SN">{index + 1}</td>
                      <td data-label="Agent Name">{agent.firstName} {agent.lastName}</td>
                      <td data-label="ID Number">{agent.idNumber}</td>
                      <td data-label="Sub Region">{agent.subRegion}</td>
                      <td data-label="Distributor">{agent.distributor}</td>
                      <td data-label="Email">{agent.email}</td>
                      <td data-label="Status">
                        <span className={`status ${agent.active ? 'active' : 'inactive'}`}>
                          {agent.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <button className="action-btn update-btn" onClick={() => {
                          if (!groupData?.permissions?.updateAgent) {
                            Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to update an agent.' });
                            return;
                          }
                          handleEdit(agent);
                        }}>
                          Update
                        </button>
                        <button className="action-btn delete-btn" onClick={() => {
                          if (!groupData?.permissions?.deleteAgent) {
                            Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to delete an agent.' });
                            return;
                          }
                          handleDelete(agent.email);
                        }}>
                          <FaTrash /> Delete
                        </button>
                        <button className="action-btn view-btn" onClick={() => {
                          if (!groupData?.permissions?.readAgent) {
                            Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to view agent details.' });
                            return;
                          }
                          handleView(agent);
                        }}>
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">No agents found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default AgentsTable;
