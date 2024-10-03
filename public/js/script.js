const socket = io();  // Initialize Socket.IO connection

// Initialize the map with global view
const map = L.map("map").setView([0, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

// Store markers for users
const markers = {};

let centered = false;  // Track if the map has been centered

// Function to handle and display the current user's location
function handleLocationUpdate(position) {
    const { latitude, longitude } = position.coords;

    // Emit location to server
    socket.emit('send-location', { latitude, longitude });

    // Center map only once or on user request
    if (!centered) {
        map.setView([latitude, longitude], 13);  // Center map
        centered = true;
    }

    // Update or add marker
    if (!markers[socket.id]) {
        markers[socket.id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup('You are here')
            .openPopup();
    } else {
        markers[socket.id].setLatLng([latitude, longitude]);
    }
}

// Use watchPosition to track location, with optimizations
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(handleLocationUpdate, (error) => {
        console.error(error);
    }, {
        enableHighAccuracy: false,  // Turn off high accuracy to reduce load
        timeout: 10000,             // Wait longer between location updates
        maximumAge: 30000           // Cache location for 30 seconds
    });
}

// Listen for other users' location updates
socket.on('received-location', (data) => {
    const { id, latitude, longitude } = data;

    // Add or update marker for other users
    if (!markers[id]) {
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ${id}`);
    } else {
        markers[id].setLatLng([latitude, longitude]);
    }
});
