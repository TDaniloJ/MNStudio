// middlewares/sessionTracker.js - CORRIGIDO
const { Session } = require('../models');

const trackSession = async (req, res, next) => {
  try {
    // Só trackear se for uma rota que merece tracking (não incluir assets, etc)
    const shouldTrack = !req.url.match(/(\.js|\.css|\.png|\.jpg|\.ico|\.svg)$/i);
    
    if (shouldTrack && req.userId && req.userId !== 'undefined' && req.userId !== null) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          // Verificar se já existe uma sessão com este token
          const existingSession = await Session.findOne({
            where: { 
              user_id: req.userId,
              token: token
            }
          });

          if (existingSession) {
            // Apenas atualizar a última atividade
            await existingSession.update({
              last_activity: new Date()
            });
          } else {
            // Criar nova sessão apenas se não existir
            await Session.create({
              user_id: req.userId,
              token: token,
              ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1',
              user_agent: req.headers['user-agent'] || 'Unknown',
              device: 'web',
              browser: 'web',
              location: 'Localhost',
              last_activity: new Date(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
            });
          }
        } catch (error) {
          console.error('Erro no tracker de sessão:', error);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro no tracker de sessão:', error);
    next();
  }
};

module.exports = trackSession;