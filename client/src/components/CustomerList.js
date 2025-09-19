import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";
const PAGE_SIZE = 5;

function CustomerList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityOptions, setCityOptions] = useState([]);

  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(sp.get("page") || 1);
  const q = sp.get("q") || "";
  const city = sp.get("city") || "";

  // Fetch distinct cities for dropdown
  useEffect(() => {
    axios.get(`${API_BASE}/customers/cities`)
         .then(res => setCityOptions(res.data))
         .catch(console.error);
  }, []);

  // Build params for API call
  const params = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: q,
    city: city || undefined,
  }), [page, q, city]);

  // Fetch customers with search, city filter, pagination
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/customers`, { params })
      .then((res) => {
        const list = res?.data?.data || res.data || [];
        setItems(Array.isArray(list) ? list : []);
        const totalCount = res?.data?.total;
        setTotal(typeof totalCount === "number" ? totalCount : null);
      })
      .catch((e) => {
        console.error(e);
        setItems([]);
        setTotal(null);
      })
      .finally(() => setLoading(false));
  }, [params]);

  const lastPage = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : undefined;
  const canPrev = page > 1;
  const canNext = lastPage ? page < lastPage : items.length === PAGE_SIZE;

  const updateParam = (name, value) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(name, value); else next.delete(name);
    if (name !== "page") next.set("page", "1"); // reset page on filter change
    setSp(next, { replace: true });
  };

  return (
    <>
      <div className="toolbar">
        <div className="field-group">
          <input
            className="input"
            placeholder="Search by name or phone…"
            value={q}
            onChange={(e) => updateParam("q", e.target.value)}
          />
          <select
            className="select"
            value={city}
            onChange={(e) => updateParam("city", e.target.value)}
          >
            <option value="">Filter by City ▾</option>
            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button className="btn primary" onClick={() => navigate("/customers/new")}>
          + Add Customer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">No customers found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.first_name} {c.last_name}</td>
                  <td>{c.phone_number}</td>
                  <td>
                    <Link className="btn" to={`/customers/${c.id}`}>View</Link>
                    <Link className="btn ghost" to={`/customers/${c.id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <button className="btn ghost" disabled={!canPrev}
                  onClick={() => updateParam("page", String(page - 1))}>‹ Prev</button>
          <span>{lastPage ? `Page ${page} / ${lastPage}` : `Page ${page}`}</span>
          <button className="btn ghost" disabled={!canNext}
                  onClick={() => updateParam("page", String(page + 1))}>Next ›</button>
        </div>
      </div>
    </>
  );
}

export default CustomerList;
