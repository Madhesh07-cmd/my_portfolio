#!/usr/bin/env node
require('dotenv').config();
const yargs = require('yargs');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_URL = 'http://localhost:3000';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('CLI started with args:', process.argv.slice(2));

const argv = yargs(process.argv.slice(2))
  .command(
    'hello',
    'Say hello',
    () => {},
    async (argv) => {
      console.log('👋 Hello from CLI!');
      try {
        const response = await axios.get(`${API_URL}/api/hello`);
        console.log('📡 Server says:', response.data.message);
      } catch (error) {
        console.error('❌ Could not reach server. Is it running?');
      }
    }
  )
  .command(
    'ask <prompt>',
    'Ask Gemini AI a question',
    (yargs) => {
      return yargs.positional('prompt', {
        describe: 'Your question for Gemini',
        type: 'string'
      });
    },
    async (argv) => {
      try {
        if (!process.env.GEMINI_API_KEY) {
          console.error('❌ GEMINI_API_KEY not set in .env file');
          process.exit(1);
        }
        
        console.log('🤖 Asking Gemini...');
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const result = await model.generateContent(argv.prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('\n📝 Gemini says:');
        console.log(text);
      } catch (error) {
        console.error('❌ Error calling Gemini API:', error.message);
      }
    }
  )
  .command(
    'chat <message>',
    'Chat with Gemini',
    (yargs) => {
      return yargs.positional('message', {
        describe: 'Message to send to Gemini',
        type: 'string'
      });
    },
    async (argv) => {
      try {
        if (!process.env.GEMINI_API_KEY) {
          console.error('❌ GEMINI_API_KEY not set in .env file');
          process.exit(1);
        }
        
        console.log('💬 Chatting with Gemini...');
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const chat = model.startChat();
        
        const result = await chat.sendMessage(argv.message);
        const response = await result.response;
        const text = response.text();
        
        console.log('\n📝 Gemini says:');
        console.log(text);
      } catch (error) {
        console.error('❌ Error in chat:', error.message);
      }
    }
  )
  .demandCommand()
  .strict()
  .help()
  .alias('help', 'h')
  .argv;