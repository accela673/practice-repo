const { io } = require('socket.io-client');

const socket = io('http://localhost:5001', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhcmRhcmthc21hbGlldkBnbWFpbC5jb20iLCJzdWIiOjYsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzU0OTI5ODUyLCJleHAiOjE3NTQ5MzM0NTJ9.HKTtRHxBTSrP7dAvnCwN6Mk-FaM3QkwyKRAcfg0DaeY',
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
