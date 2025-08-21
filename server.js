const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');

const PORT = 3000;

// Array para armazenar mensagens
const chatHistory = [];

// Upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Pasta pública
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filePath: `/uploads/${req.file.filename}`, fileName: req.file.originalname });
});

io.on('connection', socket => {
  console.log('Novo usuário conectado');

  // Enviar histórico para o novo usuário
  socket.emit('chat history', chatHistory);

  socket.on('chat message', msg => {
    chatHistory.push(msg);       // guarda a mensagem
    io.emit('chat message', msg); // envia para todos
  });

  socket.on('disconnect', () => console.log('Usuário desconectou'));
});

http.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
