import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import GenericModal from '../GenericModal';
import SalesDetailsTable from './SalesDetailsTable';
import apiClient from '../apiClient';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { usePagination } from '../PaginationContext';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function PaidCommissionsTable() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const groupData = useSelector((state) => state.auth.groupData);
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const { pages, setPageForTab, rowsPerPage } = usePagination();

  const fetchGroupedData = async (isPolling = false) => {
    if (!isPolling) setLoading(true);

    try {
      const { data } = await apiClient.get('/sales/initial');

      // Transform data to extract agent details
      const transformedData = data.map(item => item.agent);

      setGroupedData(prevData => {
        if (JSON.stringify(transformedData) !== JSON.stringify(prevData)) {
          console.log('Updating grouped data:', transformedData);
          return transformedData;
        }
        return prevData;
      });
    } catch (error) {
      if (!isPolling) {
        Swal.fire({
          ...swalOptions,
          title: 'Error fetching data',
          text: error.message,
          icon: 'error',
        });
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  // Initial fetch and set pagination key 'paid'
  useEffect(() => {
    fetchGroupedData();
    setPageForTab('paid', 1);
  }, [accessToken]);

  const handlePrint = () => {
    const originalShowState = showSalesDetails;
    if (!showSalesDetails) {
      setShowSalesDetails(true);
    }
    setTimeout(() => {
      const printableArea = document.getElementById('printable-area');
      if (!printableArea) return;
      html2canvas(printableArea).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('paid-commissions.pdf');
      });
      if (!originalShowState) {
        setShowSalesDetails(false);
      }
    }, 500);
  };

  const handleViewDetails = (agentId) => {
    if (!groupData?.permissions?.readCommission) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to view commission details.'
      });
      return;
    }
    setSelectedAgentId(agentId);
    setShowSalesDetails(true);
  };

  // Logic to pay commission: prompt with agent id.
  const handlePay = async (agentId) => {
    if (!groupData?.permissions?.pay) {
      Swal.fire({
        ...swalOptions,
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to pay commission.'
      });
      return;
    }
    const { value } = await Swal.fire({
      ...swalOptions,
      title: 'Are you sure you want to pay commission for this agent?',
      input: 'text',
      inputPlaceholder: 'Type "yes" to confirm',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to type yes to confirm!';
        }
      },
    });
    if (!(value && value.toLowerCase() === 'yes')) {
      Swal.fire({
        ...swalOptions,
        title: 'Action canceled',
        icon: 'info',
      });
      return;
    }

    Swal.fire({
      ...swalOptions,
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await apiClient.put('/sales/pay', null, {
        params: { id: agentId },
      });
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Success',
        text: 'Commission paid successfully.',
        icon: 'success',
      });
      fetchGroupedData(); // Update list after payment.
    } catch (error) {
      console.error('Error paying commission:', error);
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: error.message,
        icon: 'error',
      });
    }
  };

  if (showSalesDetails) {
    return (
      <GenericModal onClose={() => setShowSalesDetails(false)} showBackButton={false}>
        <SalesDetailsTable agentId={selectedAgentId} onBack={() => setShowSalesDetails(false)} />
      </GenericModal>
    );
  }

  // Pagination calculation using the 'paid' key
  const currentPageValue = pages['paid'] || 1;
  const indexOfLastRow = currentPageValue * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedData = groupedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(groupedData.length / rowsPerPage);

  const renderTable = () => (
    <div id="printable-area">
      <div className="table-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Paid Commissions"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Paid Commissions Records</h2>
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
                <tr key={`${agent.agentId}-${index}`}>
                  <td data-label="SN">{index + 1 + indexOfFirstRow}</td>
                  <td className="first-name-col" data-label="Agent Name">
                    {agent.first_name || 'N/A'} {agent.last_name || 'N/A'}
                  </td>
                  <td data-label="Phone Number">{agent.phone_number || 'N/A'}</td>
                  <td data-label="Email">{agent.email || 'N/A'}</td>
                  <td data-label="Distributor">{agent.distributor || 'N/A'}</td>
                  <td className="region-name-col" data-label="Region">{agent.region || 'N/A'}</td>
                  <td data-label="Sub Region">{agent.sub_region || 'N/A'}</td>
                  <td data-label="Total Sales">{agent.totalSales || 'N/A'}</td>
                  <td data-label="Total Commission">{agent.totalCommission || 'N/A'}</td>
                  <td data-label="Total Sales Count">{agent.totalSalesCount || 'N/A'}</td>
                  <td data-label="Actions">
                    <button
                      className="action-btn view-btn no-print screen-only"
                      onClick={() => handleViewDetails(agent.agentId)}
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
            onClick={() => setPageForTab('paid', page)}
            style={{
              margin: '0 5px',
              padding: '5px 10px',
              backgroundColor: (pages['paid'] || 1) === page ? '#0a803e' : '#f0f0f0',
              color: (pages['paid'] || 1) === page ? '#fff' : '#000',
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

  if (loading) {
    return <div>Loading paid commissions data...</div>;
  }

  return (
    <div className="registered-table">
      <div style={{ margin: '20px 0', textAlign: 'right' }}>
        <button className="action-btn view-btn no-print" onClick={handlePrint}>
          Print Data
        </button>
      </div>
      {renderTable()}
    </div>
  );
}

export default PaidCommissionsTable;
