import React from "react";
import CustomerList from "../components/CustomerList";

function CustomerListPage() {
  return (
    <>
      <div className="page-header">
        <h1>Customer List</h1>
      </div>
      <CustomerList />
    </>
  );
}
export default CustomerListPage;
