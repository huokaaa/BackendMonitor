const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; // Render otomatis kasih PORT

app.use(cors());
app.use(express.json());

// ================= CONFIG =================
const ADMIN_PASSWORD = "huokaaa"; // password admin reset

// ================= STATE =================
let totalReq = 0;
let reqPerSec = 0;
let cpu = 0;
let lastCpu = process.cpuUsage();
let lastTime = Date.now();

// ================= MIDDLEWARE =================
app.use((req, res, next) => {
  if (!req.path.startsWith("/stats") && !req.path.startsWith("/reset")) {
    totalReq++;
    reqPerSec++;
  }
  next();
});

// ================= CPU UPDATE =================
setInterval(() => {
  const now = Date.now();
  const cur = process.cpuUsage();

  const usedMs = (cur.user - lastCpu.user + cur.system - lastCpu.system) / 1000;
  const elapsed = now - lastTime;

  cpu = Math.min(100, Math.round((usedMs / elapsed) * 100));

  lastCpu = cur;
  lastTime = now;
}, 1000);

// ================= ROUTES =================
app.get("/stats", (req, res) => {
  res.json({
    totalReq,
    reqPerSec,
    cpu
  });
});

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.post("/reset", (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ ok: false, msg: "Password salah!" });
  }
  totalReq = 0;
  reqPerSec = 0;
  cpu = 0;
  lastCpu = process.cpuUsage();
  lastTime = Date.now();
  res.json({ ok: true, msg: "Data di-reset" });
});

// ================= START =================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend jalan di port ${PORT}`);
});
