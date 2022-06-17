const express = require('express');
const bodyParser = require('body-parser');
const {
  validateEmail,
  validatePassword,
  validateNameAndAge,
  validateTalkWatchedAt,
  validateTalkRate,
} = require('./helpers/middlewares');

const fs = require('./helpers');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// Gerador de token aleatório
const aleatoryToken = () => {
  let tokenAleatory = '';
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let index = 0; index < 16; index += 1) {
     tokenAleatory += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return tokenAleatory;
};

let tokenLogin = '';

// Middleware para validação de token
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

app.get('/talker', async (_request, response) => {
    const talker = await fs.read();
    response.status(200).send(talker);
});

app.get('/talker/search', 
  validateToken,
  async (request, response) => { 
    const { q: searchTerm } = request.query;
    const talkers = await fs.read();
      
    if (!searchTerm) {
      return response.status(200).send(talkers);
    }
  
    const talkerByTerm = talkers
      .filter((talker) => talker.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
    if (talkerByTerm.length === 0) {
      return response.status(200).send([]);
    }
  
    return response.status(200).send(talkerByTerm);
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
    const { id: talkerId } = request.params;
    const { name, age, talk } = request.body;

    const talkers = await fs.read();

    const updateTalker = {
      name,
      age,
      talk,
    };
    
    const talkerFromId = talkers.find((talker) => talker.id === Number(talkerId));

    Object.assign(talkerFromId, updateTalker);

    await fs.write(talkers);

    return response.status(200).send(talkerFromId);
  });

app.delete('/talker/:id',
  validateToken,
  async (request, response) => { 
    const { id: talkerId } = request.params;

    const talkers = await fs.read();

    const deleteTalker = talkers.filter((talker) => talker.id !== Number(talkerId));

    await fs.write(deleteTalker);

    return response.status(204).send();
  });

app.listen(PORT, () => {
  console.log('o pai tá on');
});
