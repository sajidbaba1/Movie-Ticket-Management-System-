const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Read data from JSON file
const dataPath = path.join(__dirname, 'db.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper function to save data
const saveData = () => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Movies endpoints
app.get('/movies', (req, res) => {
  res.json(data.movies);
});

app.get('/movies/:id', (req, res) => {
  const movie = data.movies.find(m => m.id === parseInt(req.params.id));
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
});

app.post('/movies', (req, res) => {
  const newMovie = {
    id: Math.max(...data.movies.map(m => m.id)) + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  data.movies.push(newMovie);
  saveData();
  res.status(201).json(newMovie);
});

app.put('/movies/:id', (req, res) => {
  const index = data.movies.findIndex(m => m.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Movie not found' });

  data.movies[index] = { ...data.movies[index], ...req.body };
  saveData();
  res.json(data.movies[index]);
});

app.delete('/movies/:id', (req, res) => {
  const index = data.movies.findIndex(m => m.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Movie not found' });

  data.movies.splice(index, 1);
  saveData();
  res.status(204).send();
});

// Theaters endpoints
app.get('/theaters', (req, res) => {
  res.json(data.theaters);
});

app.get('/theaters/:id', (req, res) => {
  const theater = data.theaters.find(t => t.id === parseInt(req.params.id));
  if (!theater) return res.status(404).json({ error: 'Theater not found' });
  res.json(theater);
});

app.post('/theaters', (req, res) => {
  const newTheater = {
    id: Math.max(...data.theaters.map(t => t.id)) + 1,
    ...req.body
  };
  data.theaters.push(newTheater);
  saveData();
  res.status(201).json(newTheater);
});

app.put('/theaters/:id', (req, res) => {
  const index = data.theaters.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Theater not found' });

  data.theaters[index] = { ...data.theaters[index], ...req.body };
  saveData();
  res.json(data.theaters[index]);
});

app.delete('/theaters/:id', (req, res) => {
  const index = data.theaters.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Theater not found' });

  data.theaters.splice(index, 1);
  saveData();
  res.status(204).send();
});

// Users endpoints
app.get('/users', (req, res) => {
  res.json(data.users);
});

app.get('/users/:id', (req, res) => {
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/users', (req, res) => {
  const newUser = {
    id: Math.max(...data.users.map(u => u.id)) + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  data.users.push(newUser);
  saveData();
  res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
  const index = data.users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  data.users[index] = { ...data.users[index], ...req.body };
  saveData();
  res.json(data.users[index]);
});

app.delete('/users/:id', (req, res) => {
  const index = data.users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  data.users.splice(index, 1);
  saveData();
  res.status(204).send();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log('📡 Available endpoints:');
  console.log('   Movies: GET,POST /movies | GET,PUT,DELETE /movies/:id');
  console.log('   Theaters: GET,POST /theaters | GET,PUT,DELETE /theaters/:id');
  console.log('   Users: GET,POST /users | GET,PUT,DELETE /users/:id');
  console.log('   Health: GET /health\n');
});