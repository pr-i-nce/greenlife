import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../styles/registeredTables.css';
import { useSelector } from 'react-redux';
import ProductDetails from './ProductDetails';
import GenericModal from '../GenericModal';
import { BASE_URL } from '../apiClient';
import apiClient from '../apiClient';
import { FaArrowLeft } from 'react-icons/fa';

const swalOptions = {
  background: '#ffffff',
  confirmButtonColor: '#2ECC71',
  cancelButtonColor: '#e74c3c',
  color: '#283e56',
};

function SalesDetailsTable({ agentId, onBack }) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [agent, setAgent] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchSalesDetails = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/sales/fetch', {
          params: { salesPersonId: agentId },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log("Sales details fetched:", data);
        if (Array.isArray(data)) {
          setSales(data);
          if (data.length > 0) {
            setAgent({
              first_name: data[0].first_name,
              last_name: data[0].last_name,
              phone_number: data[0].phone_number,
              email: data[0].email,
              distributor: data[0].distributor,
              region: data[0].region_name || data[0].region,
              sub_region: data[0].sub_region,
            });
          }
        } else {
          setAgent(data.agent);
          setSales(data.sales);
        }
      } catch (error) {
        Swal.fire({
          ...swalOptions,
          title: 'Error fetching sales details',
          text: error.message,
          icon: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    console.log("agentId received:", agentId);
    if (agentId) {
      fetchSalesDetails();
    }
  }, [agentId, accessToken]);

  const handleViewProductDetails = async (ref_id) => {
    Swal.fire({
      ...swalOptions,
      title: 'Fetching Product Details...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const { data } = await apiClient.get('/sales/sold-products', {
        params: { id: ref_id },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!data) throw new Error('Network error');
      const productDetails = Array.isArray(data.object) ? data.object : [];
      Swal.close();
      setSelectedProduct(productDetails);
    } catch (error) {
      Swal.close();
      Swal.fire({
        ...swalOptions,
        title: 'Error',
        text: 'Could not fetch product details. Please try again.',
        icon: 'error'
      });
    }
  };

  if (loading) {
    return <div>Loading sales details...</div>;
  }

  // Once product details are rendered, do not show the sales details table.
  if (selectedProduct) {
    return (
      <GenericModal onClose={() => setSelectedProduct(null)} showBackButton={true}>
        <div className="modal-inner-content" style={{ padding: '1rem' }}>
          <ProductDetails records={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </div>
      </GenericModal>
    );
  }

  return (
    <div className="registered-table">
      <div className="table-header">
        <img
          src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Sales Details"
          className="header-image"
        />
        <div className="header-overlay">
          <h2>Sales Details</h2>
        </div>
      </div>
      <button 
        className="modal-close-btn" 
        onClick={onBack}
        style={{ margin: '1rem' }}
      >
        <FaArrowLeft className="icon" /> Back
      </button>
      <div className="table-content">
        <table className="registered-table" style={{ margin: '-20px 0' }}>
          <thead>
            <tr>
              <th>SN</th>
              <th>Agent Name</th>
              <th>Phone Number</th>
              <th>Distributor</th>
              <th>Region</th>
              <th>Sub Region</th>
              <th>Amount</th>
              <th>Initial Commission</th>
              <th>Created Date</th>
              <th>Created Time</th>
              <th>Status</th>
              <th>Approval1</th>
              <th>Approval2</th>
              <th>Product Details</th>
              <th>Receipt Image</th>
            </tr>
          </thead>
          <tbody>
            {sales && sales.length > 0 ? (
              sales.map((sale, index) => (
                <tr key={sale.ref_id}>
                  <td data-label="SN">{index + 1}</td>
                  <td data-label="Agent Name">
                    {sale.first_name || agent?.first_name || 'N/A'} {sale.last_name || agent?.last_name || 'N/A'}
                  </td>
                  <td data-label="Phone Number">
                    {sale.phone_number || agent?.phone_number || 'N/A'}
                  </td>
                  <td data-label="Distributor">
                    {sale.distributor || agent?.distributor || 'N/A'}
                  </td>
                  <td data-label="Region">
                    {sale.region_name || agent?.region || 'N/A'}
                  </td>
                  <td data-label="Sub Region">
                    {sale.sub_region || agent?.sub_region || 'N/A'}
                  </td>
                  <td data-label="Amount">{sale.amount || 'N/A'}</td>
                  <td data-label="Initial Commission">{sale.initial_commission || 'N/A'}</td>
                  <td data-label="Created Date">
                    {sale.created_date ? sale.created_date.split('T')[0] : 'N/A'}
                  </td>
                  <td data-label="Created Time">
                    {sale.created_date ? sale.created_date.split('T')[1].split('.')[0] : 'N/A'}
                  </td>
                  <td data-label="Status">{sale.status || 'N/A'}</td>
                  <td data-label="Approval1">{sale.approval1 || 'N/A'}</td>
                  <td data-label="Approval2">{sale.approval2 || 'N/A'}</td>
                  <td data-label="Product Details">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewProductDetails(sale.ref_id)}
                    >
                      View Details
                    </button>
                  </td>
                  <td data-label="Receipt Image">
                    <button 
                      className="action-btn view-btn no-print screen-only"
                      onClick={() =>
                        window.open(
                          `${BASE_URL}/serve/getImage/${sale.reciept_image_path}`,
                          '_blank'
                        )
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="no-records" style={{ textAlign: 'center', padding: '20px' }}>
                  No sales records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesDetailsTable;
