import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';
import GenericModal from '../GenericModal';
import SubregionRegistration from './SubregionRegistration';
import SubregionUpdate from './SubRegionUpdate';
import SubregionView from './SubregionView';
import { GlobalContext } from '../../components/GlobalContext';
import '../../styles/registeredTables.css';

const SubregionTable = () => {
  const { accessToken, groupData } = useContext(GlobalContext);
  const [mode, setMode] = useState("table");
  const [subregions, setSubregions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [regFormData, setRegFormData] = useState({ subRegionName: "", subRegionCode: "" });
  const [regError, setRegError] = useState("");
  const [editingSubregion, setEditingSubregion] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({ subRegionName: "", subRegionCode: "" });
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const fetchSubregions = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://jituze.greenlife.co.ke/rest/subregion/all", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch subregions.");
      }
      const data = await response.json();
      setSubregions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubregions();
  }, [accessToken]);

  const handleRegChange = (e) => {
    setRegFormData({ ...regFormData, [e.target.id]: e.target.value });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!regFormData.subRegionName.trim() || !regFormData.subRegionCode.trim()) {
      setRegError("All fields are required.");
      swal({ title: "Validation Error", text: "All fields are required.", icon: "error", button: "OK" });
      return;
    }
    setRegError("");
    const payload = { subRegionName: regFormData.subRegionName, subRegionCode: regFormData.subRegionCode };
    try {
      const response = await fetch("https://jituze.greenlife.co.ke/rest/subregion", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      if (response.ok) {
        Swal.fire({ icon: "success", title: "Success", text: responseText, confirmButtonColor: "#2B9843" }).then(() => {
          setRegFormData({ subRegionName: "", subRegionCode: "" });
          setMode("table");
          fetchSubregions();
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: responseText });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "An error occurred while registering. Please try again." });
    }
  };

  const handleUpdateChange = (e) => {
    setUpdateFormData({ ...updateFormData, [e.target.id]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateFormData.subRegionName.trim() || !updateFormData.subRegionCode.trim()) {
      setUpdateError("All fields are required.");
      Swal.fire({ icon: "error", title: "Update Error", text: "All fields are required." });
      return;
    }
    setUpdateError("");
    const payload = { subRegionName: updateFormData.subRegionName, subRegionCode: updateFormData.subRegionCode };
    try {
      setUpdating(true);
      const response = await fetch(`https://jituze.greenlife.co.ke/rest/subregion/update?subRegionCode=${encodeURIComponent(editingSubregion.subRegionCode)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Update failed");
      }
      const updatedRecord = await response.json();
      setSubregions(subregions.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      setEditingSubregion(null);
      setMode("table");
      Swal.fire({ icon: "success", title: "Update Successful", text: "Subregion updated successfully!", confirmButtonColor: "#2B9843" });
      fetchSubregions();
    } catch (err) {
      setUpdateError(err.message);
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    const subregion = subregions.find(r => r.id === id);
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: `To delete subregion "${subregion.subRegionName}", please type "yes" below:`,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Type yes to confirm",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#2B9843",
      preConfirm: (inputValue) => {
        if (inputValue !== "yes") {
          Swal.showValidationMessage('You must type "yes" to confirm deletion.');
        }
        return inputValue;
      }
    });
    if (result.isConfirmed && result.value === "yes") {
      try {
        const response = await fetch(`https://jituze.greenlife.co.ke/rest/subregion/delete?subRegionCode=${encodeURIComponent(subregion.subRegionCode)}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(errMsg || "Delete failed");
        }
        const successMessage = await response.text();
        Swal.fire({ icon: "success", title: "Deleted!", text: successMessage, confirmButtonColor: "#2B9843" });
        setSubregions(subregions.filter(r => r.id !== id));
      } catch (err) {
        Swal.fire({ icon: "error", title: "Delete Failed", text: err.message });
      }
    }
  };

  const handleEdit = (id) => {
    const subregion = subregions.find(r => r.id === id);
    setEditingSubregion(subregion);
    setUpdateFormData({
      subRegionName: subregion.subRegionName || "",
      subRegionCode: subregion.subRegionCode || ""
    });
    setMode("update");
  };

  const handleView = (subregion) => {
    setViewRecord(subregion);
    setMode("view");
  };

  const displayValue = (value) => value !== null && value !== undefined && String(value).trim() !== "" ? value : "null";

  const filteredSubregions = subregions.filter(r =>
    (r.subRegionName ? r.subRegionName.toLowerCase() : "").includes(searchTerm.toLowerCase()) ||
    (r.subRegionCode ? r.subRegionCode.toLowerCase() : "").includes(searchTerm.toLowerCase())
  );

  if (mode === "table") {
    return (
      <div className="registered-table">
        <button
          className="register-btn"
          style={{ position: "absolute", top: "10px", right: "10px" }}
          onClick={() => {
            if (!groupData?.permissions?.createSubRegion) {
              Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "You do not have permission to register a subregion."
              });
              return;
            }
            setMode("register");
          }}
        >
          Register Subregion
        </button>
        <div className="table-header" style={{ position: "relative" }}>
          <img src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Update Subregion" className="subregion-header-image" />
          <div className="header-overlay">
            <h2>Registered Subregions</h2>
          </div>
        </div>
        <div className="table-content">
          <input
            type="text"
            placeholder="Search subregions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <table>
            <thead>
              <tr>
                <th>Subregion Name</th>
                <th>Subregion Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubregions.map((r) => (
                <tr key={r.id}>
                  <td data-label="Subregion Name">{r.subRegionName}</td>
                  <td data-label="Subregion Code">{r.subRegionCode}</td>
                  <td data-label="Actions">
                    <button
                      className="action-btn update-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.updateSubRegion) {
                          Swal.fire({
                            icon: "error",
                            title: "Access Denied",
                            text: "You do not have permission to update a subregion."
                          });
                          return;
                        }
                        handleEdit(r.id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.deleteSubRegion) {
                          Swal.fire({
                            icon: "error",
                            title: "Access Denied",
                            text: "You do not have permission to delete a subregion."
                          });
                          return;
                        }
                        handleDelete(r.id);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="action-btn view-btn"
                      onClick={() => {
                        if (!groupData?.permissions?.readSubRegion) {
                          Swal.fire({
                            icon: "error",
                            title: "Access Denied",
                            text: "You do not have permission to view a subregion."
                          });
                          return;
                        }
                        handleView(r);
                      }}
                    >
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
      <div className="subregion-container">
        <GenericModal onClose={() => setMode("table")}>
          <SubregionRegistration onClose={() => setMode("table")} onRegistrationSuccess={fetchSubregions} />
        </GenericModal>
      </div>
    );
  }
  if (mode === "update" && editingSubregion) {
    return (
      <div className="subregion-container">
        <GenericModal onClose={() => setMode("table")}>
          <SubregionUpdate record={editingSubregion} onClose={() => setMode("table")} onUpdateSuccess={fetchSubregions} />
        </GenericModal>
      </div>
    );
  }
  if (mode === "view" && viewRecord) {
    return (
      <div className="subregion-container">
        <GenericModal onClose={() => { setViewRecord(null); setMode("table"); }}>
          <SubregionView record={viewRecord} onClose={() => { setViewRecord(null); setMode("table"); }} />
        </GenericModal>
      </div>
    );
  }
  return null;
};

export default SubregionTable;
