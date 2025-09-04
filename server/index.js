const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite DB
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");

    // Create Customers table
    db.run(
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE
      )`
    );

    // Create Addresses table
    db.run(
      `CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        address_details TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )`
    );
  }
});

// -------- Customer Routes --------

// Get all customers with search, city filter, and pagination
app.get("/api/customers", (req, res) => {
  const { search = "", city = "", page = 1, limit = 5 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let sql = "SELECT * FROM customers WHERE 1=1";
  const params = [];

  // Search by name or phone
  if (search) {
    sql += " AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Filter by city
  if (city) {
    sql += " AND id IN (SELECT customer_id FROM addresses WHERE city = ?)";
    params.push(city);
  }

  // Pagination
  sql += " LIMIT ? OFFSET ?";
  params.push(Number(limit), offset);

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });

    // Count total
    let countSql = "SELECT COUNT(*) as total FROM customers WHERE 1=1";
    const countParams = [];

    if (search) {
      countSql += " AND (first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (city) {
      countSql += " AND id IN (SELECT customer_id FROM addresses WHERE city = ?)";
      countParams.push(city);
    }

    db.get(countSql, countParams, (err2, countRow) => {
      if (err2) return res.status(400).json({ error: err2.message });
      res.json({ data: rows, total: countRow.total });
    });
  });
});

// Get all distinct cities for dropdown
app.get("/api/customers/cities", (req, res) => {
  db.all("SELECT DISTINCT city FROM addresses ORDER BY city ASC", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    const cities = rows.map(r => r.city);
    res.json(cities);
  });
});

// Get single customer with addresses
app.get("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM customers WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Customer not found" });

    db.all("SELECT * FROM addresses WHERE customer_id = ?", [id], (err2, addresses) => {
      if (err2) return res.status(400).json({ error: err2.message });
      res.json({ ...row, addresses });
    });
  });
});

// Create customer with optional addresses
app.post("/api/customers", (req, res) => {
  const { first_name, last_name, phone_number, addresses = [] } = req.body;

  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.run(
    "INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)",
    [first_name, last_name, phone_number],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });

      const customerId = this.lastID;

      if (Array.isArray(addresses) && addresses.length > 0) {
        const stmt = db.prepare(
          "INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)"
        );
        addresses.forEach(addr => {
          stmt.run(customerId, addr.address_details, addr.city, addr.state, addr.pin_code);
        });
        stmt.finalize();
      }

      res.json({ id: customerId, first_name, last_name, phone_number, addresses });
    }
  );
});

// Update customer
app.put("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;
  db.run(
    "UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?",
    [first_name, last_name, phone_number, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updatedID: id });
    }
  );
});

// Delete customer
app.delete("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM customers WHERE id = ?", id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deletedID: id });
  });
});

// -------- Address Routes --------

// Add new address
app.post("/api/customers/:id/addresses", (req, res) => {
  const { id } = req.params;
  const { address_details, city, state, pin_code } = req.body;
  db.run(
    "INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)",
    [id, address_details, city, state, pin_code],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, customer_id: id, address_details, city, state, pin_code });
    }
  );
});

// Get single address
app.get("/api/addresses/:addressId", (req, res) => {
  const { addressId } = req.params;
  db.get("SELECT * FROM addresses WHERE id = ?", [addressId], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Address not found" });
    res.json(row);
  });
});

// Update address
app.put("/api/addresses/:addressId", (req, res) => {
  const { addressId } = req.params;
  const { address_details, city, state, pin_code } = req.body;
  db.run(
    "UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?",
    [address_details, city, state, pin_code, addressId],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updatedID: addressId });
    }
  );
});

// Delete address
app.delete("/api/addresses/:addressId", (req, res) => {
  const { addressId } = req.params;
  db.run("DELETE FROM addresses WHERE id = ?", addressId, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deletedID: addressId });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
