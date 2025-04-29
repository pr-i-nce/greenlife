import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import GenericModal from '../GenericModal';
import SalesDetailsTable from './SalesDetailsTable';
import apiClient from '../apiClient';
import { usePagination } from '../PaginationContext';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function AgentDetailsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  const [agentData, setAgentData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Use selectedRefNo to track the refNo of the agent record for which details are being viewed.
  const [selectedRefNo, setSelectedRefNo] = useState(null);
  const [showSalesDetails, setShowSalesDetails] = useState(false);

  const { pages, setPageForTab, rowsPerPage } = usePagination();

  // Fetch agent details from the /sales/get-batch endpoint using refNo in the request params.
  const fetchAgentData = async () => {
    setLoading(true);
    try {
      // Update the endpoint and pass a refNo parameter.
      // Here we assume you have a way to determine the correct refNo to use.
      // For instance, if groupData or another prop contains it, you can replace `yourRefNoValue` accordingly.
      const yourRefNoValue = groupData?.refNo || ''; // adjust this line as needed
      const { data } = await apiClient.get('/sales/get-batch', {
        params: { refNo: yourRefNoValue },
      });
      // Expecting data to be an array of agent objects.
      if (Array.isArray(data)) {
        setAgentData(data);
      } else {
        throw new Error('Invalid data format received from sales/get-batch');
      }
    } catch (error) {
      Swal.fire({
        ...swalOptions,
        title: 'Error fetching batch data',
        text: error.message,
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // The effect now calls the updated fetchAgentData and sets the pagination tab appropriately.
  useEffect(() => {
    fetchAgentData();
    setPageForTab('agents', 1);
  }, [accessToken]);

  // When a view details button is clicked, pass the refNo value for that agent record.
  const handleViewDetails = (agentRefNo) => {
    if (!groupData?.permissions?.readCommission) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to view commission details.',
      });
      return;
    }
    setSelectedRefNo(agentRefNo);
    setShowSalesDetails(true);
  };

  // Pagination calculations using the 'agents' key.
  const currentPage = pages['agents'] || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedData = agentData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(agentData.length / rowsPerPage);

  // Render the table of agent details.
  const renderTable = () => (
    <div id="printable-area">
      <div className="table-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Agent Details"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Agent Details Records</h2>
        </div>
      </div>
      <div className="table-content">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th className="first-name-col">Agent Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Distributor</th>
              <th className="region-name-col">Region</th>
              <th>Sub Region</th>
              <th>Total Sales</th>
              <th>Total Commission</th>
              <th>Total Sales Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((agent, index) => (
                <tr key={`${agent.refNo}-${index}`}>
                  <td data-label="SN">{index + 1 + indexOfFirstRow}</td>
                  <td className="first-name-col" data-label="Agent Name">
                    {agent.first_name || 'N/A'} {agent.last_name || 'N/A'}
                  </td>
                  <td data-label="Phone Number">{agent.phone_number || 'N/A'}</td>
                  <td data-label="Email">{agent.email || 'N/A'}</td>
                  <td data-label="Distributor">{agent.distributor || 'N/A'}</td>
                  <td className="region-name-col" data-label="Region">
                    {agent.region || 'N/A'}
                  </td>
                  <td data-label="Sub Region">{agent.sub_region || 'N/A'}</td>
                  <td data-label="Total Sales">{agent.totalSales || 'N/A'}</td>
                  <td data-label="Total Commission">{agent.totalCommission || 'N/A'}</td>
                  <td data-label="Total Sales Count">{agent.totalSalesCount || 'N/A'}</td>
                  <td data-label="Actions">
                    <button
                      className="action-btn view-btn no-print screen-only"
                      // Pass the agent's refNo to the handler.
                      onClick={() => handleViewDetails(agent.refNo)}
                    >
                      View Sales Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, page) => page + 1).map((page) => (
          <button
            key={page}
            onClick={() => setPageForTab('agents', page)}
            style={{
              margin: '0 5px',
              padding: '5px 10px',
              backgroundColor: (pages['agents'] || 1) === page ? '#0a803e' : '#f0f0f0',
              color: (pages['agents'] || 1) === page ? '#fff' : '#000',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );

  // Render the modal with SalesDetailsTable if an agent's refNo has been selected.
  if (showSalesDetails) {
    return (
      <GenericModal onClose={() => setShowSalesDetails(false)} showBackButton={false}>
        {/* Pass the refNo instead of agentId */}
        <SalesDetailsTable refNo={selectedRefNo} onBack={() => setShowSalesDetails(false)} />
      </GenericModal>
    );
  }

  if (loading) {
    return <div>Loading agent details...</div>;
  }

  return <div className="registered-table">{renderTable()}</div>;
}

export default AgentDetailsTable;
