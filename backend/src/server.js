const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const trackSession = require('./middlewares/sessionTracker');

// 🔹 SOCKET
const initSocket = require('./socket');

// 🔹 ROTAS
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const mangaChapterRoutes = require('./routes/mangaChapterRoutes');
const novelRoutes = require('./routes/novelRoutes');
const novelChapterRoutes = require('./routes/novelChapterRoutes');
const genreRoutes = require('./routes/genreRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const readingHistoryRoutes = require('./routes/readingHistoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const worldbuildingRoutes = require('./routes/worldbuildingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const userStatsRoutes = require('./routes/userStatsRoutes');
const coinRoutes = require('./routes/coinRoutes');
const helpCenterRoutes = require('./routes/helpCenterRoutes');
const helpRequestRoutes = require('./routes/helpRequestRoutes');

const app = express();
const server = http.createServer(app);

// 🔹 SOCKET.IO INIT
const io = initSocket(server);

// 🔹 DISPONIBILIZAR IO NAS ROTAS
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔹 CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 🔹 MIDDLEWARES GLOBAIS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 ARQUIVOS ESTÁTICOS
const uploadPath = process.env.UPLOAD_PATH || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadPath)));

// 🔹 AUTH PRIMEIRO
app.use('/api/auth', authRoutes);

// 🔹 TRACK SESSION (APÓS AUTH)
app.use(trackSession);

// 🔹 DEMAIS ROTAS
app.use('/api/mangas', mangaRoutes);
app.use('/api/mangas', mangaChapterRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/novels', novelChapterRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reading-history', readingHistoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worldbuilding', worldbuildingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/users', userStatsRoutes);
app.use('/api/coins', coinRoutes);

// 🔹 HELP CENTER & HELP REQUESTS
app.use('/api/help-center', helpCenterRoutes);
app.use('/api/help-requests', helpRequestRoutes);

// 🔹 TESTE
app.get('/', (req, res) => {
  res.json({ message: 'API Manga & Novel Platform 🚀' });
});

// 🔹 ERROR HANDLER
app.use(errorHandler);

// 🔹 START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
