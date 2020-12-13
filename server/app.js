const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const mkdir = require('mkdirp');

const app = express();
const imageDirectory = '/home/handcg/image-uploads';
const fileupload = require('express-fileupload');

app.use(cors());
app.use(express.json());
app.use(fileupload());

let credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
let connection = mysql.createConnection(credentials);
connection.connect();

function rowToObject(row) {
  return {
   username: row.username,
   picture: row.picture,
   caption: row.caption,
   id: row.id,
  };
}

// load all posts when home page is loaded
app.get('/load-posts', (request, response) => {
  const query = 'SELECT username, picture, caption, id FROM post WHERE display_post_at <= now() ORDER BY posted_at DESC';
  connection.query(query, (error, rows) => {
  response.send({
        ok: true,
        post: rows.map(rowToObject),
   });
});
});

// get all posts associated with a single user
// can be used for profile page
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

// retrieve the image from the image-uploads directory
app.get('/image/:username/:filename', (request, response) => {
  response.sendFile(`${imageDirectory}/${request.params.username}/${request.params.filename}`);
});


//post to the database
app.post('/upload-post', (request, response) => {

  const image = request.files.image;
  const username = request.body.username;
  const path = `${imageDirectory}/${username}/${image.name}`;

  if (!fs.existsSync(`${imageDirectory}/${username}`)) {

    fs.mkdir(`${imageDirectory}/${username}`, error => {
    if (error) {
      console.log(error);
      response.sendStatus(500);
    }
    });

  }
  const picture = image.name;
  const caption = request.body.caption;
  const params = [username, picture, caption];

  const query = 'INSERT INTO post(username, picture, caption, display_post_at) VALUES (?, ?, ?,  date_add(now(), interval 2 minute))';
      connection.query(query, params, (error, result) => {
               if (error) console.log(error);
      });


  image.mv(path, error => {
    if (error) {
      response.sendStatus(500);
    } else {
      response.header('Access-Control-Allow-Origin', '*');
      response.send(":)");
    }
  });

});


const port = 3443;
app.listen(port, () => {
    console.log(`We're live on port ${port}`);
});

