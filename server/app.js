const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
let connection = mysql.createConnection(credentials);
connection.connect();

function rowToObject(row) {
  return {
   username: row.username,
   picture: row.picture,
   caption: row.caption,
  };
}

app.get('/post/:username', (request, response) => {
  const query = 'SELECT username, picture, caption, id FROM post WHERE username = ? ORDER BY posted_at DESC';
  const params = [request.params.username];
  connection.query(query, params, (error, rows) => {
   response.send({
	ok: true,
	post: rows.map(rowToObject),
   });
 });
});

app.post('/post', (request, response) => {
  const query = 'INSERT INTO post(username, picture, caption) VALUES (?, ?, ?)';
        const params = [request.body.username, request.body.picture, request.body.caption];
        connection.query(query, params, (error, result) => {
                if (error) console.log(error);
                response.send({
                  ok: true,
                  id: result.insertId,
                });
        });
});




const port = 3443;
app.listen(port, () => {
    console.log(`We're live on port ${port}`);
});
