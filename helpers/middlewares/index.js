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

module.exports = {
  validateEmail,
  validatePassword,
  validateNameAndAge,
  validateTalkWatchedAt,
  validateTalkRate,
};