const path = require("path");
const express = require("express");
const cors = require("cors");
const { pool, checkConnection } = require("./event_db");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3030);
const legacyClientDirectory = path.join(__dirname, "..", "WenboHeA2-clientside");
const clientBuildDirectory = path.join(__dirname, "..", "client-angular", "dist", "client-angular", "browser");
const adminBuildDirectory = path.join(__dirname, "..", "admin-angular", "dist", "admin-angular", "browser");

app.use(cors());
app.use(express.json({ limit: "100kb" }));

function normaliseRegistration(row) {
  return {
    id: row.registration_id,
    eventId: row.event_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    ticketCount: Number(row.ticket_count),
    registeredAt: row.registered_at,
  };
}

function normaliseEvent(row, registrations = undefined) {
  const result = {
    id: row.event_id,
    name: row.name,
    purpose: row.purpose,
    description: row.description,
    date: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    address: row.address,
    city: row.city,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    ticketPrice: Number(row.ticket_price),
    goalAmount: Number(row.goal_amount),
    raisedAmount: Number(row.raised_amount),
    progressPercent: Number(row.goal_amount) > 0
      ? Math.min(100, Math.round((Number(row.raised_amount) / Number(row.goal_amount)) * 100))
      : 0,
    imageKey: row.image_key,
    status: row.status,
    eventStatus: new Date(`${row.event_date}T23:59:59`) < new Date() ? "past" : row.status,
    category: { id: row.category_id, name: row.category_name },
    organisation: { id: row.organisation_id, name: row.organisation_name },
  };
  if (registrations) result.registrations = registrations.map(normaliseRegistration);
  if (row.registration_count !== undefined) result.registrationCount = Number(row.registration_count);
  return result;
}

function validDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return parsed.toISOString().slice(0, 10) === value;
}

function positiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateEventPayload(body) {
  const required = ["name", "purpose", "description", "date", "startTime", "endTime", "venue", "address", "city"];
  const missing = required.filter((key) => typeof body[key] !== "string" || !body[key].trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}.`;
  if (!validDate(body.date)) return "Date must use YYYY-MM-DD format.";
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(body.startTime) || !/^\d{2}:\d{2}(:\d{2})?$/.test(body.endTime)) {
    return "Times must use HH:MM or HH:MM:SS format.";
  }
  if (body.startTime >= body.endTime) return "End time must be later than start time.";
  for (const key of ["ticketPrice", "goalAmount", "raisedAmount", "latitude", "longitude"]) {
    if (!Number.isFinite(Number(body[key]))) return `${key} must be numeric.`;
  }
  if (Number(body.ticketPrice) < 0 || Number(body.goalAmount) < 0 || Number(body.raisedAmount) < 0) {
    return "Amounts cannot be negative.";
  }
  if (Number(body.latitude) < -90 || Number(body.latitude) > 90 || Number(body.longitude) < -180 || Number(body.longitude) > 180) {
    return "Latitude or longitude is outside the valid range.";
  }
  if (Number(body.raisedAmount) > Number(body.goalAmount)) return "Raised amount cannot exceed the goal amount.";
  if (!['active', 'suspended'].includes(body.status || 'active')) return "Status must be active or suspended.";
  if (!positiveId(body.categoryId) || !positiveId(body.organisationId)) return "A valid category and organisation are required.";
  return null;
}

async function eventRows({ all = false, filters = [], params = [] } = {}) {
  const conditions = [...filters];
  if (!all) conditions.push("e.status = 'active'");
  const [rows] = await pool.query(
    `SELECT e.*, c.name AS category_name, o.name AS organisation_name,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registration_count
     FROM events e
     JOIN categories c ON c.category_id = e.category_id
     JOIN organisations o ON o.organisation_id = e.organisation_id
     WHERE ${conditions.length ? conditions.join(" AND ") : "1=1"}
     ORDER BY e.event_date, e.start_time`,
    params,
  );
  return rows;
}

app.get("/api/health", async (req, res) => {
  try {
    await checkConnection();
    res.json({ status: "ok", database: "connected", angular: "22+" });
  } catch {
    res.json({ status: "degraded", database: "offline", angular: "22+" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT category_id AS id, name, description FROM categories ORDER BY name");
    res.json(rows);
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/organisations", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT organisation_id AS id, name, mission, email, phone, website FROM organisations ORDER BY name");
    res.json(rows);
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/events", async (req, res) => {
  const { date, location, category } = req.query;
  if (!validDate(date)) return res.status(400).json({ error: "Date must use YYYY-MM-DD format." });
  try {
    const filters = [];
    const params = [];
    if (date) { filters.push("e.event_date = ?"); params.push(date); }
    if (location) { filters.push("(e.city LIKE ? OR e.venue LIKE ?)"); params.push(`%${location}%`, `%${location}%`); }
    if (category) { filters.push("c.category_id = ?"); params.push(Number(category)); }
    const rows = await eventRows({ filters, params });
    res.json({ count: rows.length, events: rows.map((row) => normaliseEvent(row)) });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

async function findEvent(id, includeInactive = false) {
  const [rows] = await pool.query(
    `SELECT e.*, c.name AS category_name, o.name AS organisation_name
     FROM events e JOIN categories c ON c.category_id=e.category_id
     JOIN organisations o ON o.organisation_id=e.organisation_id
     WHERE e.event_id=? ${includeInactive ? "" : "AND e.status='active'"}`,
    [id],
  );
  return rows[0];
}

async function registrationsFor(id) {
  const [rows] = await pool.query(
    "SELECT * FROM registrations WHERE event_id=? ORDER BY registered_at DESC, registration_id DESC",
    [id],
  );
  return rows;
}

app.get("/api/events/:id", async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "Event id must be a positive integer." });
  try {
    const row = await findEvent(id);
    if (!row) return res.status(404).json({ error: "Event not found." });
    res.json(normaliseEvent(row, await registrationsFor(id)));
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.post("/api/registrations", async (req, res) => {
  const { eventId, fullName, email, phone, ticketCount } = req.body || {};
  const id = positiveId(eventId);
  if (!id || !String(fullName || "").trim() || !/^\S+@\S+\.\S+$/.test(String(email || "")) || !String(phone || "").trim() || !Number.isInteger(Number(ticketCount)) || Number(ticketCount) < 1 || Number(ticketCount) > 20) {
    return res.status(400).json({ error: "Enter a valid event, name, email, phone and ticket count (1-20)." });
  }
  try {
    const event = await findEvent(id);
    if (!event) return res.status(404).json({ error: "Active event not found." });
    const [result] = await pool.query(
      "INSERT INTO registrations (event_id, full_name, email, phone, ticket_count) VALUES (?, ?, ?, ?, ?)",
      [id, String(fullName).trim(), String(email).trim().toLowerCase(), String(phone).trim(), Number(ticketCount)],
    );
    const [rows] = await pool.query("SELECT * FROM registrations WHERE registration_id=?", [result.insertId]);
    res.status(201).json(normaliseRegistration(rows[0]));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "This email is already registered for the event." });
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/admin/events", async (req, res) => {
  try {
    const rows = await eventRows({ all: true });
    res.json({ count: rows.length, events: rows.map((row) => normaliseEvent(row)) });
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/admin/events/:id", async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "Event id must be a positive integer." });
  try {
    const row = await findEvent(id, true);
    if (!row) return res.status(404).json({ error: "Event not found." });
    res.json(normaliseEvent(row, await registrationsFor(id)));
  } catch {
    res.status(503).json({ error: "Database unavailable." });
  }
});

async function writeEvent(req, res, updateId = null) {
  const body = req.body || {};
  const validationError = validateEventPayload(body);
  if (validationError) return res.status(400).json({ error: validationError });
  const values = [body.organisationId, body.categoryId, body.name.trim(), body.purpose.trim(), body.description.trim(), body.date, body.startTime, body.endTime, body.venue.trim(), body.address.trim(), body.city.trim(), body.latitude, body.longitude, body.ticketPrice, body.goalAmount, body.raisedAmount, body.imageKey || "community", body.status || "active"];
  try {
    if (updateId) {
      const existing = await findEvent(updateId, true);
      if (!existing) return res.status(404).json({ error: "Event not found." });
      const [result] = await pool.query(
        `UPDATE events SET organisation_id=?, category_id=?, name=?, purpose=?, description=?, event_date=?, start_time=?, end_time=?, venue=?, address=?, city=?, latitude=?, longitude=?, ticket_price=?, goal_amount=?, raised_amount=?, image_key=?, status=? WHERE event_id=?`,
        [...values, updateId],
      );
      res.json(normaliseEvent(await findEvent(updateId, true)));
    } else {
      const [result] = await pool.query(
        `INSERT INTO events (organisation_id, category_id, name, purpose, description, event_date, start_time, end_time, venue, address, city, latitude, longitude, ticket_price, goal_amount, raised_amount, image_key, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
      );
      res.status(201).json(normaliseEvent(await findEvent(result.insertId, true)));
    }
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "The selected category or organisation does not exist." });
    res.status(503).json({ error: "Database unavailable." });
  }
}

app.post("/api/admin/events", (req, res) => writeEvent(req, res));
app.put("/api/admin/events/:id", (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "Event id must be a positive integer." });
  return writeEvent(req, res, id);
});

app.delete("/api/admin/events/:id", async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ error: "Event id must be a positive integer." });
  try {
    const [registrations] = await pool.query("SELECT COUNT(*) AS count FROM registrations WHERE event_id=?", [id]);
    if (Number(registrations[0].count) > 0) return res.status(409).json({ error: "This event cannot be deleted because registrations already exist." });
    const [result] = await pool.query("DELETE FROM events WHERE event_id=?", [id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Event not found." });
    res.status(204).end();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") return res.status(409).json({ error: "This event cannot be deleted because registrations already exist." });
    res.status(503).json({ error: "Database unavailable." });
  }
});

app.get("/api/weather", async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);
  const date = String(req.query.date || "");
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !validDate(date)) return res.status(400).json({ error: "Valid latitude, longitude and date are required." });
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), start_date: date, end_date: date, past_days: "14", daily: "weather_code,temperature_2m_max,temperature_2m_min", timezone: "auto" }).toString();
    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: "Weather provider unavailable." });
    const payload = await response.json();
    res.json({ date, latitude, longitude, daily: payload.daily });
  } catch {
    res.status(502).json({ error: "Weather provider unavailable." });
  }
});

if (require("fs").existsSync(adminBuildDirectory)) app.use("/admin", express.static(adminBuildDirectory));
if (require("fs").existsSync(clientBuildDirectory)) app.use(express.static(clientBuildDirectory));
else app.use(express.static(legacyClientDirectory));

app.get("/admin/*", (req, res) => {
  if (require("fs").existsSync(path.join(adminBuildDirectory, "index.html"))) return res.sendFile(path.join(adminBuildDirectory, "index.html"));
  res.status(404).send("Admin Angular app has not been built yet.");
});
app.get("*", (req, res) => {
  const angularIndex = path.join(clientBuildDirectory, "index.html");
  res.sendFile(require("fs").existsSync(angularIndex) ? angularIndex : path.join(legacyClientDirectory, "index.html"));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "The server could not complete that request." });
});

app.listen(port, () => console.log(`Charity Events API running at http://localhost:${port}`));
