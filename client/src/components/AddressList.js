import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

function AddressList({ customerId, onChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 

  const fetchAddresses = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/customers/${customerId}/addresses`)
      .then((res) => setItems(res?.data?.data || res.data || []))
      .catch((e) => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, [customerId]);

  const remove = (id) => {
    if (!window.confirm("Delete this address?")) return;
    axios.delete(`${API_BASE}/addresses/${id}`)
      .then(() => { onChanged?.("Address deleted ✔"); fetchAddresses(); })
      .catch((e) => console.error(e));
  };

  if (loading) return <p className="muted">Loading addresses…</p>;
  if (!items.length) return <p className="muted">No addresses found.</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Details</th><th>City</th><th>State</th><th>PIN</th><th style={{width:160}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((a) => (
          <tr key={a.id}>
            <td>{a.address_details}</td>
            <td>{a.city}</td>
            <td>{a.state}</td>
            <td>{a.pin_code}</td>
            <td>
              <button className="btn" onClick={() => setEditingId(a.id)}>Edit</button>
              <button className="btn danger" onClick={() => remove(a.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default AddressList;
