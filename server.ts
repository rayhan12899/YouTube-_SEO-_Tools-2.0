import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send-message", (data) => {
      // data: { roomId, message, user }
      io.to(data.roomId).emit("receive-message", data);
    });

    socket.on("share-generation", (data) => {
      // data: { roomId, result, type }
      socket.to(data.roomId).emit("new-generation", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // AI routes
  app.post("/api/ai/voiceover", async (req, res) => {
    try {
      const { text, voiceName } = req.body;
      const { handleVoiceOver } = await import("./server/ai");
      const base64Audio = await handleVoiceOver(text, voiceName);
      res.json({ data: base64Audio });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, prompt, config } = req.body;
      const { handleGenerateContent } = await import("./server/ai");
      const text = await handleGenerateContent(model, prompt, config);
      res.json({ text });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // API health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
