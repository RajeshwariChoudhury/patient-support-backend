import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
        ]
      });

      socket.emit('receive_message', {
        role: 'bot',
        message: response.choices[0].message.content
      });
    } catch (err) {
      console.error(err);
      socket.emit('receive_message', {
        role: 'bot',
        message: "Sorry, I couldn't respond right now. Try again later."
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
