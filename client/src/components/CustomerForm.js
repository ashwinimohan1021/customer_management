import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const isNonEmpty = (v) => String(v || "").trim().length > 0;
const isPhone = (v) => /^[0-9+\-()\s]{7,15}$/.test(String(v || ""));

function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    axios
      .get(`${API_BASE}/customers/${id}`)
      .then((res) => {
        const data = res?.data;
        if (data) {
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone_number: data.phone_number || "",
          });
        }
      })
      .catch((e) => console.error("Error fetching customer:", e));
  }, [id, isEdit]);

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
        return isNonEmpty(value) ? "" : "First name is required";
      case "last_name":
        return isNonEmpty(value) ? "" : "Last name is required";
      case "phone_number":
        return isPhone(value) ? "" : "Enter a valid phone number";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // validate on change
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const submit = (ev) => {
    ev.preventDefault();

    // validate all fields on submit
    const newErrors = {
      first_name: validateField("first_name", form.first_name),
      last_name: validateField("last_name", form.last_name),
      phone_number: validateField("phone_number", form.phone_number),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((x) => x)) return;

    const req = isEdit
      ? axios.put(`${API_BASE}/customers/${id}`, form)
      : axios.post(`${API_BASE}/customers`, form);

    req.then(() => {
      setToast(isEdit ? "Customer updated successfully ✔" : "Customer added successfully ✔");
      setTimeout(() => navigate("/customers"), 1200);
    }).catch((e) => {
      console.error("Save error:", e);
      setToast("Something went wrong ❌");
      setTimeout(() => setToast(""), 2000);
    });
  };

  const isFormValid =
    isNonEmpty(form.first_name) &&
    isNonEmpty(form.last_name) &&
    isPhone(form.phone_number);

  return (
    <div className="card">
      {toast && (
        <div className={`toast ${toast.includes("❌") ? "error" : "success"}`}>
          {toast}
        </div>
      )}

      <form className="form" onSubmit={submit} noValidate>
        <div className="grid-2">
          <div className="form-field">
            <label>First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className={errors.first_name ? "invalid" : ""}
            />
            {errors.first_name && <small className="error">{errors.first_name}</small>}
          </div>

          <div className="form-field">
            <label>Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className={errors.last_name ? "invalid" : ""}
            />
            {errors.last_name && <small className="error">{errors.last_name}</small>}
          </div>
        </div>

        <div className="form-field">
          <label>Phone Number</label>
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className={errors.phone_number ? "invalid" : ""}
          />
          {errors.phone_number && <small className="error">{errors.phone_number}</small>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={!isFormValid}>
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;
