const express = require('express');
const bodyParser = require('body-parser');

const fs = require('./helpers');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// gerador de Token aleatório
const aleatoryToken = () => {
    let tokenAleatory = '';
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let index = 0; index < 16; index += 1) {
        tokenAleatory += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return tokenAleatory;
};

// Middleware
const validateEmail = (request, response, next) => {
  const { email } = request.body;
  const validEmail = /\S+@\S+\.\S+/.test(email);

  if (!email) {
    return response.status(400).send({ message: 'O campo "email" é obrigatório' });
  }

  if (!validEmail) {
    return response.status(400)
      .send({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  return next();
};

const validatePassword = (request, response, next) => {
  const { password } = request.body;

  if (!password) {
    return response.status(400).send({ message: 'O campo "password" é obrigatório' });
  }

  if (password.length < 6) {
    return response.status(400)
      .send({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  return next();
};

app.get('/talker', async (_request, response) => {
    const talker = await fs.read();
    response.status(200).send(talker);
});

app.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const talkers = await fs.read();
  const talkerId = talkers.find((talker) => talker.id === Number(id));

  if (talkerId) {
  return response.status(200).json(talkerId);
  }

  return response.status(404).send({ message: 'Pessoa palestrante não encontrada' });
});

app.post('/login', validateEmail, validatePassword, (request, response) => { 
  const token = aleatoryToken();

  return response.status(200).send({ token: `${token}` });
  });

app.listen(PORT, () => {
  console.log('O pai tá on');
});
