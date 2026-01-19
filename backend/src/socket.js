module.exports = (server) => {
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado:', socket.id);

    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('join:admin', () => {
      socket.join('admins');
    });

    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado:', socket.id);
    });
  });

  return io;
};
