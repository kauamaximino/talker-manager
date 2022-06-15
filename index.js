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
    for (let i = 0; i < 16; i += 1) {
        tokenAleatory += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return tokenAleatory;
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

app.post('/login', (request, response) => { 
  const { email, password } = request.body;
  const token = aleatoryToken();
  
  return response.status(200).send({ token: `${token}` });
});

app.listen(PORT, () => {
  console.log('O pai tá on');
});
