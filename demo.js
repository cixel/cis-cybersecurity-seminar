// demo.js
const express = require('express');
const app = express();

app.get('/hi', function(req, res) {
  const name = req.query.name;
  res.send('hello, ' + encodeURIComponent(name));
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});
