import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    id: null,
    address_details: "",
    city: "",
    state: "",
    pin_code: "",
  });

  const fetchCustomer = async () => {
    try {
      const res = await axios.get(`${API_BASE}/customers/${id}`);
      setCustomer(res.data);
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Error fetching customer:", err);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressForm.id) {
        // Update
        await axios.put(`${API_BASE}/addresses/${addressForm.id}`, addressForm);
      } else {
        // Add
        await axios.post(`${API_BASE}/customers/${id}/addresses`, addressForm);
      }
      setAddressForm({ id: null, address_details: "", city: "", state: "", pin_code: "" });
      fetchCustomer();
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleEdit = (addr) => {
    setAddressForm(addr);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await axios.delete(`${API_BASE}/addresses/${addressId}`);
      fetchCustomer();
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>
        {customer.first_name} {customer.last_name}
      </h2>
      <p>
        <strong>Phone:</strong> {customer.phone_number}
      </p>

      <div className="form-section">
        <h3>{addressForm.id ? "Edit Address" : "Add Address"}</h3>
        <form onSubmit={handleAddressSubmit} className="grid-2">
          <input
            placeholder="Address Details"
            value={addressForm.address_details}
            onChange={(e) => setAddressForm({ ...addressForm, address_details: e.target.value })}
          />
          <input
            placeholder="City"
            value={addressForm.city}
            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
          />
          <input
            placeholder="State"
            value={addressForm.state}
            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
          />
          <input
            placeholder="PIN Code"
            value={addressForm.pin_code}
            onChange={(e) => setAddressForm({ ...addressForm, pin_code: e.target.value })}
          />
          <div className="form-actions">
            <button type="submit" className="btn primary">
              {addressForm.id ? "Update" : "Add"}
            </button>
            {addressForm.id && (
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  setAddressForm({ id: null, address_details: "", city: "", state: "", pin_code: "" })
                }
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h3>Addresses</h3>
      {addresses.length === 0 ? (
        <p>No addresses found.</p>
      ) : (
        <ul className="address-list">
          {addresses.map((addr) => (
            <li key={addr.id} className="address-item">
              <p>
                {addr.address_details}, {addr.city}, {addr.state} - {addr.pin_code}
              </p>
              <button onClick={() => handleEdit(addr)} className="btn small">Edit</button>
              <button onClick={() => handleDelete(addr.id)} className="btn small danger">Delete</button>
            </li>
          ))}
        </ul>
      )}

      <div className="form-actions">
        <button onClick={() => navigate("/")} className="btn ghost">← Back</button>
        <button onClick={() => navigate(`/edit/${id}`)} className="btn">Edit Customer</button>
      </div>
    </div>
  );
}

export default CustomerDetailPage;
