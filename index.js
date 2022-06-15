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

let tokenLogin = '';

// Middleware para validação de email
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

// Middleware para validação de password
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

// Middlewares para validação de token
const validateToken = (request, response, next) => {
  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).send({ message: 'Token não encontrado' });
  }

  if (authorization !== tokenLogin) {
    return response.status(401).send({ message: 'Token inválido' });
  }

  return next();
};

// Middlewares para validação de nome e idade
const validateNameAndAge = (request, response, next) => {
  const { name, age } = request.body;

  if (!name) {
    return response.status(400).send({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return response.status(400)
      .send({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  if (!age) {
    return response.status(400).send({ message: 'O campo "age" é obrigatório' });
  }
  if (Number(age) < 18) {
    return response.status(400)
      .send({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  return next();
};

// Middlewares para validação do campo talk.watchedAt
const validateTalkWatchedAt = (request, response, next) => {
  const { talk } = request.body;
  const validateDateRegex = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;

  if (!talk) {
    return response.status(400).send({ message: 'O campo "talk" é obrigatório' });
  }

  if (!talk.watchedAt) {
    return response.status(400).send({ message: 'O campo "watchedAt" é obrigatório' });
  }

  if (!validateDateRegex.test(talk.watchedAt)) {
    return response.status(400)
      .send({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  
    return next(); 
};

// Middlewares para validação do campo talk.rate
const validateTalkRate = (request, response, next) => {
  const { talk: { rate } } = request.body;
  
  if (!rate) {
    return response.status(400).send({ message: 'O campo "rate" é obrigatório' });
  }

  if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
    return response.status(400)
      .send({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
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
  tokenLogin = aleatoryToken();

  return response.status(200).send({ token: `${tokenLogin}` });
});
  
app.post('/talker',
  validateToken,
  validateNameAndAge,
  validateTalkWatchedAt,
  validateTalkRate,
  async (request, response) => { 
    const { name, age, talk } = request.body;
    
    const oldTalkers = await fs.read();
    
    const newTalker = {
      id: oldTalkers.length + 1,
      name,
      age,
      talk,
    };

    const updateTalkers = [...oldTalkers, newTalker];

    await fs.write(updateTalkers);

    return response.status(201).send(newTalker);
  });

app.put('/talker/:id',
  validateToken,
  validateNameAndAge,
  validateTalkWatchedAt,
  validateTalkRate,
  async (request, response) => { 

  });

app.listen(PORT, () => {
  console.log('o pau tá on');
});
