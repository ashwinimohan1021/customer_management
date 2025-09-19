import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">Customer Manager</Link>
      <div className="nav-links">
        <NavLink to="/" end>Customers</NavLink>
        <NavLink to="/customers/new" className="btn primary">+ Add Customer</NavLink>
      </div>
    </nav>
  );
}
export default Navbar;
