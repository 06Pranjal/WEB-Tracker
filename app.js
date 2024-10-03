const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketio(server);

// Set EJS as the view engine (for rendering index.ejs)
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle connection event for Socket.IO
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle receiving location from clients
    socket.on("send-location", (data) => {
        // Broadcast the received location to all connected clients
        io.emit("received-location", { id: socket.id, ...data });
    });

    // Handle user disconnect event
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Render the main page
app.get('/', (req, res) => {
    res.render("index");  // Renders the index.ejs file
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
