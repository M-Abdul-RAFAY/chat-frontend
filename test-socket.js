const io = require('socket.io-client');

// Test socket connection to backend
const socket = io('http://localhost:8000', {
  auth: {
    token: 'test-token' // This will fail authentication, but we can test connection
  },
  autoConnect: true
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully:', socket.id);
  socket.disconnect();
});

socket.on('connect_error', (error) => {
  console.log('❌ Socket connection error:', error.message);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket disconnected');
  process.exit(0);
});

setTimeout(() => {
  console.log('⏰ Connection test timeout');
  process.exit(1);
}, 5000);
