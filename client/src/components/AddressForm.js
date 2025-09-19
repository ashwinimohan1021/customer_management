import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const empty = { address_details: "", city: "", state: "", pin_code: "" };

function AddressForm({ customerId, address = null, onSaved }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => { setForm(address || empty); }, [address]);

  const validate = () => {
    const e = {};
    if (!form.address_details.trim()) e.address_details = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!/^[0-9]{4,10}$/.test(String(form.pin_code))) e.pin_code = "PIN must be 4–10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const req = form.id
      ? axios.put(`${API_BASE}/addresses/${form.id}`, form)
      : axios.post(`${API_BASE}/customers/${customerId}/addresses`, form);

    req.then(() => {
        onSaved?.(form.id ? "Address updated ✔" : "Address added ✔");
        setForm(empty);
      })
      .catch((e) => console.error(e));
  };

  return (
    <form className="form compact" onSubmit={submit} noValidate>
      <div className="grid-2">
        <div className="form-field">
          <label>Address Details</label>
          <input value={form.address_details}
                 onChange={(e)=>setForm({...form, address_details:e.target.value})}
                 className={errors.address_details ? "invalid":""}/>
          {errors.address_details && <small className="error">{errors.address_details}</small>}
        </div>
        <div className="form-field">
          <label>City</label>
          <input value={form.city}
                 onChange={(e)=>setForm({...form, city:e.target.value})}
                 className={errors.city ? "invalid":""}/>
          {errors.city && <small className="error">{errors.city}</small>}
        </div>
      </div>

      <div className="grid-2">
        <div className="form-field">
          <label>State</label>
          <input value={form.state}
                 onChange={(e)=>setForm({...form, state:e.target.value})}
                 className={errors.state ? "invalid":""}/>
          {errors.state && <small className="error">{errors.state}</small>}
        </div>
        <div className="form-field">
          <label>PIN Code</label>
          <input value={form.pin_code}
                 onChange={(e)=>setForm({...form, pin_code:e.target.value})}
                 className={errors.pin_code ? "invalid":""}/>
          {errors.pin_code && <small className="error">{errors.pin_code}</small>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary">{form.id ? "Update" : "Add"}</button>
      </div>
    </form>
  );
}
export default AddressForm;
