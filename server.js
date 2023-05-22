import express, { json } from 'express';
//const fetch = (await import('node-fetch')).default;
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path'

const app = express();
const PORT = process.env.PORT ||10000; // Change this to the port you want to use

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use(express.static(path.join(__dirname, '..')));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})

app.use(cors());

app.use(json())

let jwt_token = ""
// Define a route for the proxy

app.get('/proxy', async (req, res) => {
  // Make the request to the remote API
  console.log('app.get /proxy route initiated')

  //gets values from the client
  const authHeader = req.headers.authorization;
  const encodedCredentials = authHeader.split(' ')[1];
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
  const [username, password] = decodedCredentials.split(':');
  console.log(username)
  // Make the request to the remote API
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + encodedCredentials
  };

  const response = await fetch('https://01.kood.tech/api/auth/signin', {
    method: 'POST',
    headers
   // Pass the query parameters as the request body
  });
//const data = await response.json();

  // Get the response data and send it back to the client
  const data = await response.json();
  jwt_token = data;
  res.json({ token: jwt_token });

  //console.log(jwt_token)
  //res.send((data));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

