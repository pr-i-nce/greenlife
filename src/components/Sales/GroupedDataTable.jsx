import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import SalesDetailsTable from './SalesDetailsTable';
import GenericModal from '../GenericModal';
import { BASE_URL } from '../apiClient';
import apiClient from '../apiClient';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

const GroupedDataTable = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const fetchGroupedData = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/sales/agent');
      setGroupedData(data);
      console.log(data);
    } catch (error) {
      Swal.fire({
        ...swalOptions,
        title: 'Error fetching data',
        text: error.message,
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupedData();
  }, []);

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
        pdf.save('agent-sales.pdf');
        const pdfBlob = pdf.output('bloburl');
        const printWindow = window.open(pdfBlob);
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      });
      if (!originalShowState) {
        setShowSalesDetails(false);
      }
    }, 500);
  };

  const handleViewDetails = (agentId) => {
    setSelectedAgentId(agentId);
    setShowSalesDetails(true);
  };

  if (loading) {
    return <div>Loading agent sales data...</div>;
  }

  if (showSalesDetails) {
    return (
      <GenericModal onClose={() => setShowSalesDetails(false)} showBackButton={false}>
        <SalesDetailsTable
          agentId={selectedAgentId}
          onBack={() => setShowSalesDetails(false)}
        />
      </GenericModal>
    );
  }

  if (!groupedData.length) {
    return <div>No agent sales data available.</div>;
  }

  return (
    <div className="registered-table">
      <div style={{ margin: '20px 0', textAlign: 'right' }}>
        {/* <button className="action-btn view-btn no-print" onClick={handlePrint}>
          Print Data
        </button> */}
      </div>
      <div id="printable-area">
        <div className="table-header">
          <img
            src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Agent Sales"
            className="header-image"
          />
          <div className="header-overlay">
            <h2>Agent Details</h2>
          </div>
        </div>
        <div className="table-content">
          <table>
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Distributor</th>
                <th>Region</th>
                <th>Sub Region</th>
                <th>Total Sales</th>
                <th>Total Commission</th>
                <th>Total Sales Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((item) => {
                const { agent } = item;
                return (
                  <tr key={agent.agentId}>
                    <td data-label="Agent Name">
                      {agent.first_name} {agent.last_name}
                    </td>
                    <td data-label="Phone Number">{agent.phone_number}</td>
                    <td data-label="Email">{agent.email}</td>
                    <td data-label="Distributor">{agent.distributor}</td>
                    <td data-label="Region">{agent.region}</td>
                    <td data-label="Sub Region">{agent.sub_region}</td>
                    <td data-label="Total Sales">{agent.totalSales}</td>
                    <td data-label="Total Commission">{agent.totalCommission}</td>
                    <td data-label="Total Sales Count">{agent.totalSalesCount}</td>
                    <td data-label="Actions">
                      <button
                        className="action-btn view-btn no-print screen-only"
                        onClick={() => handleViewDetails(agent.agentId)}
                      >
                        View Sales Details
                      </button>
                      <span className="print-only">
                        {item.sales && item.sales.length > 0 ? 'Sales Details Included' : ''}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroupedDataTable;
