import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { spawn } from "child_process";

// Initialize express app
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const PYTHON_PORT = 8000;

app.use(express.json({ limit: "10mb" }));

// Spawn Python SQL Backend Service
console.log("[PROXY SERVER] Launching python multi-threaded SQLite service...");
const pythonExecutable = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

console.log(`[PROXY SERVER] Spawning backend using executable: ${pythonExecutable}`);

let backendPath = path.join(__dirname, "backend.py");
if (!fs.existsSync(backendPath)) {
  backendPath = path.join(__dirname, "../backend.py");
}
console.log(`[PROXY SERVER] Resolved backend script path to: ${backendPath}`);

const pythonBackend = spawn(pythonExecutable, [backendPath], {
  stdio: "inherit"
});

pythonBackend.on("error", (err) => {
  console.error(`[PROXY SERVER FATAL] Failed to start Python backend subprocess:`, err);
});

pythonBackend.on("close", (code) => {
  console.log(`[PROXY SERVER] Python service exited with status code: ${code}`);
});

// Proxy Route Handler
app.all("/api/*", async (req, res) => {
  const targetUrl = `http://127.0.0.1:${PYTHON_PORT}${req.originalUrl}`;
  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      }
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    // Check if the source is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (err: any) {
    console.error(`[PROXY ERR] Error communicating with python backend:`, err.message);
    res.status(502).json({
      error: "Failed to communicate with secure Python database service.",
      details: err.message
    });
  }
});

// Vite Dev vs. Prod Handler Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from compiled Static Build folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
