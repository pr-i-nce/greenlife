import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { BASE_URL } from '../apiClient';
import { useSelector } from 'react-redux';
import GenericModal from '../GenericModal';
import BatchDetails from './BatchSales';
import apiClient from '../apiClient';
import { usePagination } from '../PaginationContext';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

// View receipt image
const handleViewImage = (reciept_image_path, groupData) => {
  if (!groupData?.permissions?.viewRecieptImage) {
    Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to view receipt images.' });
    return;
  }
  const imageUrl = `${BASE_URL}/serve/getImage/${reciept_image_path}`;
  Swal.fire({
    ...swalOptions,
    title: 'Receipt Image',
    html: `<img src=\"${imageUrl}\" style=\"width:100%; height:auto; max-height:80vh;\" />`,
    heightAuto: false,
    confirmButtonText: 'Close'
  });
};

export default function PaidCommissionsTable() {
  const groupData = useSelector((state) => state.auth.groupData);
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [batchSalesData, setBatchSalesData] = useState(null);

  const { pages, setPageForTab, rowsPerPage } = usePagination();
  const pagesContainerRef = useRef(null);

  // init pagination & fetch
  useEffect(() => {
    setPageForTab('paidBatches', 1);
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/sales/paid-batches');
      setBatchData(data.object || []);
    } catch (error) {
      Swal.fire({ ...swalOptions, title: 'Error fetching batches', text: error.message, icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewBatch = async (refNo) => {
    if (!groupData?.permissions?.readCommission) {
      Swal.fire({ ...swalOptions, icon: 'error', title: 'Access Denied', text: 'No permission to view batch.' });
      return;
    }
    Swal.fire({ ...swalOptions, title: 'Loading...', didOpen: () => Swal.showLoading() });
    try {
      const { data } = await apiClient.get('/sales/get-batch', { params: { refNo } });
      Swal.close();
      if (data.successful) {
        setBatchSalesData(data.object);
        setShowBatchDetails(true);
      } else throw new Error(data.message);
    } catch (err) {
      Swal.close();
      Swal.fire({ ...swalOptions, title: 'Error', text: err.message, icon: 'error' });
    }
  };

  if (showBatchDetails) {
    return (
      <GenericModal onClose={() => setShowBatchDetails(false)} showBackButton={true}>
        <BatchDetails batchSales={batchSalesData} onBack={() => setShowBatchDetails(false)} />
      </GenericModal>
    );
  }

  // pagination controls
  const renderPagination = () => {
    const key = 'paidBatches';
    const totalPages = Math.ceil(batchData.length / rowsPerPage);
    const currentPage = pages[key] || 1;
    return (
      <div style={{ marginTop: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => pagesContainerRef.current?.scrollBy({ left: -50, behavior: 'smooth' })} style={{ margin: '0 5px', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>&#x25C0;</button>
        <div ref={pagesContainerRef} style={{ overflowX: 'auto', whiteSpace: 'nowrap', width: '300px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPageForTab(key, p)} style={{ margin: '0 5px', padding: '5px 10px', backgroundColor: currentPage === p ? '#0a803e' : '#f0f0f0', color: currentPage === p ? '#fff' : '#000', border: 'none', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
        <button onClick={() => pagesContainerRef.current?.scrollBy({ left: 50, behavior: 'smooth' })} style={{ margin: '0 5px', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>&#x25B6;</button>
      </div>
    );
  };

  // table of paid batches with header image and receipt view
  const renderBatchesTable = () => {
    const key = 'paidBatches';
    const currentPage = pages[key] || 1;
    const startIdx = (currentPage - 1) * rowsPerPage;
    const slice = batchData.slice(startIdx, startIdx + rowsPerPage);
    return (
      <>
        <div className="table-header">
          <img
            src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Paid Batches"
            className="header-image"
          />
          <div className="header-overlay">
            <h2>Paid Batches</h2>
          </div>
        </div>
        <div className="table-content">
          <table>
            <thead>
              <tr>
                <th>SN</th>
                <th>Ref No</th>
                <th>No Sales</th>
                <th>Commission</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.length > 0 ? slice.map((b, i) => (
                <tr key={b.ref_no}>
                  <td>{startIdx + i + 1}</td>
                  <td>{b.ref_no}</td>
                  <td>{b.totalsales}</td>
                  <td>{b.totalcommission}</td>
                  <td>
                    <button className="action-btn view-btn" onClick={() => handleViewImage(b.reciept_image_path, groupData)}>
                      View Receipt
                    </button>
                  </td>
                  <td>
                    <button className="action-btn view-btn" onClick={() => handleViewBatch(b.ref_no)}>
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </>
    );
  };

  return (
    <div className="registered-table">
      {loading ? <div>Loading paid batches...</div> : renderBatchesTable()}
    </div>
  );
}
