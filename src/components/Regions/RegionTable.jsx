import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaClipboardList, FaMapMarkerAlt, FaArrowLeft, FaTrash, FaEye } from 'react-icons/fa';
import GenericModal from '../GenericModal';
import RegionsRegistration from './RegionRegistration';
import RegionsUpdate from './RegionUpdate';
import RegionsView from './RegionsView';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';
import '../../styles/roles.css';

const RegionsManagement = () => {
  const { groupData, accessToken } = useContext(GlobalContext);
  const [mode, setMode] = useState("table");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [regFormData, setRegFormData] = useState({ regionName: "", regionCode: "" });
  const [regError, setRegError] = useState("");
  const [editingRegion, setEditingRegion] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({ regionName: "", regionCode: "" });
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://jituze.greenlife.co.ke/rest/region/all", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error("Failed to fetch regions.");
      const data = await response.json();
      setRegions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegions(); }, [accessToken]);

  const handleRegChange = (e) => { setRegFormData({ ...regFormData, [e.target.id]: e.target.value }); };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!regFormData.regionName.trim() || !regFormData.regionCode.trim()) {
      setRegError("All fields are required.");
      Swal.fire({ title: "Validation Error", text: "All fields are required.", icon: "error", button: "OK" });
      return;
    }
    setRegError("");
    const payload = { regionName: regFormData.regionName, regionCode: regFormData.regionCode };
    try {
      const response = await fetch("https://jituze.greenlife.co.ke/rest/region", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        Swal.fire({ icon: "success", title: "Success", text: responseText, confirmButtonColor: "#2B9843" }).then(() => {
          setRegFormData({ regionName: "", regionCode: "" });
          setMode("table");
          fetchRegions();
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "An error occurred while registering. Please try again." });
    }
  };

  const handleUpdateChange = (e) => { setUpdateFormData({ ...updateFormData, [e.target.id]: e.target.value }); };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateFormData.regionName.trim() || !updateFormData.regionCode.trim()) {
      setUpdateError("All fields are required.");
      Swal.fire({ icon: "error", title: "Update Error", text: "All fields are required." });
      return;
    }
    setUpdateError("");
    const payload = { regionName: updateFormData.regionName, regionCode: updateFormData.regionCode };
    try {
      setUpdating(true);
      const response = await fetch(`https://jituze.greenlife.co.ke/region/update?regionCode=${encodeURIComponent(editingRegion.regionCode)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Update failed");
      }
      const updatedRegion = await response.json();
      setRegions(regions.map(region => region.id === updatedRegion.id ? updatedRegion : region));
      setEditingRegion(null);
      setMode("table");
      Swal.fire({ icon: "success", title: "Update Successful", text: "Region updated successfully!", confirmButtonColor: "#2B9843" });
      fetchRegions();
    } catch (err) {
      setUpdateError(err.message);
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (regionCode) => {
    const region = regions.find(r => r.regionCode === regionCode);
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete region "${region.regionName}", please type "yes" below:`,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Type yes to confirm",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#2B9843",
      preConfirm: (inputValue) => {
        if (inputValue !== "yes") { Swal.showValidationMessage('You must type "yes" to confirm deletion.'); }
        return inputValue;
      }
    });
    if (result.isConfirmed && result.value === "yes") {
      try {
        const response = await fetch(`https://jituze.greenlife.co.ke/rest/region/delete?regionCode=${encodeURIComponent(regionCode)}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Delete failed");
        }
        const successMessage = await response.text();
        Swal.fire({ icon: "success", title: "Deleted!", text: successMessage, confirmButtonColor: "#2B9843" });
        setRegions(regions.filter(r => r.regionCode !== regionCode));
      } catch (err) {
        Swal.fire({ icon: "error", title: "Delete Failed", text: err.message });
      }
    }
  };

  const handleEdit = (regionCode) => {
    const region = regions.find(r => r.regionCode === regionCode);
    setEditingRegion(region);
    setUpdateFormData({ regionName: region.regionName || "", regionCode: region.regionCode || "" });
    setMode("update");
  };

  const handleView = (region) => {
    setViewRecord(region);
    setMode("view");
  };

  const displayValue = (value) => value !== null && value !== undefined && String(value).trim() !== "" ? value : "null";

  const filteredRegions = regions.filter((region) => {
    const rName = region.regionName ? region.regionName.toLowerCase() : "";
    const rCode = region.regionCode ? region.regionCode.toLowerCase() : "";
    const term = searchTerm.toLowerCase();
    return rName.includes(term) || rCode.includes(term);
  });

  if (mode === "table") {
    return (
      <div className="registered-table">
        <button className="register-btn" style={{ position: "absolute", top: "10px", right: "10px" }} onClick={() => {
          if (!groupData?.permissions?.createRegion) {
            Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to register a region.' });
            return;
          }
          setMode("register");
        }}>
          Register Region
        </button>
        <div className="table-header" style={{ position: "relative" }}>
          <img src="https://images.pexels.com/photos/8943323/pexels-photo-8943323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Regions" className="header-image" />
          <div className="header-overlay">
            <h2>Registered Regions</h2>
          </div>
        </div>
        <div className="table-content">
          <input type="text" placeholder="Search regions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
          <table>
            <thead>
              <tr>
                <th>Region Name</th>
                <th>Region Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegions.map((region) => (
                <tr key={region.id}>
                  <td data-label="Region Name">{region.regionName}</td>
                  <td data-label="Region Code">{region.regionCode}</td>
                  <td data-label="Actions">
                    <button className="action-btn update-btn" onClick={() => {
                      if (!groupData?.permissions?.updateRegion) {
                        Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to update a region.' });
                        return;
                      }
                      handleEdit(region.regionCode);
                    }}>
                      Edit
                    </button>
                    <button className="action-btn delete-btn" onClick={() => {
                      if (!groupData?.permissions?.deleteRegion) {
                        Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to delete a region.' });
                        return;
                      }
                      handleDelete(region.regionCode);
                    }}>
                      <FaTrash /> Delete
                    </button>
                    <button className="action-btn view-btn" onClick={() => {
                      if (!groupData?.permissions?.readRegion) {
                        Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission to view region details.' });
                        return;
                      }
                      handleView(region);
                    }}>
                      <FaEye /> View
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
  if (mode === "register") {
    return (
      <div className="region-container">
        <GenericModal onClose={() => setMode("table")}>
          <RegionsRegistration onClose={() => setMode("table")} onRegistrationSuccess={fetchRegions} />
        </GenericModal>
      </div>
    );
  }
  if (mode === "update" && editingRegion) {
    return (
      <div className="region-container">
        <GenericModal onClose={() => setMode("table")}>
          <RegionsUpdate record={editingRegion} onClose={() => setMode("table")} onUpdateSuccess={fetchRegions} />
        </GenericModal>
      </div>
    );
  }
  if (mode === "view" && viewRecord) {
    return (
      <div className="region-container">
        <GenericModal onClose={() => { setViewRecord(null); setMode("table"); }}>
          <RegionsView record={viewRecord} onClose={() => { setViewRecord(null); setMode("table"); }} />
        </GenericModal>
      </div>
    );
  }
  if (loading) {
    return <div className="registered-table">Loading regions...</div>;
  }
  if (error) {
    return <div className="registered-table">Error: {error}</div>;
  }
  return null;
};

export default RegionsManagement;
