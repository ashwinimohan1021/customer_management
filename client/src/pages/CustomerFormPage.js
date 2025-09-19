import React from "react";
import CustomerForm from "../components/CustomerForm";

function CustomerFormPage() {
  return (
    <>
      <div className="page-header">
        <h1>Add / Edit Customer</h1>
      </div>
      <CustomerForm />
    </>
  );
}
export default CustomerFormPage;
