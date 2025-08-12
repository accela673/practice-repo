const { io } = require('socket.io-client');

const socket = io('http://localhost:5001', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhcmRhcmthc21hbGlldkBnbWFpbC5jb20iLCJzdWIiOjYsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzU1MDE1NjQ3LCJleHAiOjE3NTUwMTkyNDd9.SRSTbX4l2dVOvlo-IR9YcY1JkxrX3S9hz5gp14Y250k',
  },
});

socket.on('connect', () => {
  console.log('Connected with id:', socket.id);
});

socket.on('bookingNotification', (data) => {
  console.log('Notification received:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
