const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('send_message', async (data) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: "You're a friendly support chatbot helping patients with emotional support and appointments." },
          { role: 'user', content: data.message }
        ],
      });

      socket.emit('receive_message', {
        role: 'bot',
        message: response.choices[0].message.content
      });
    } catch (err) {
      console.error("OpenAI Error:", err);
      socket.emit('receive_message', {
        role: 'bot',
        message: "Sorry, I couldn't process your request right now. Please try again later."
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
