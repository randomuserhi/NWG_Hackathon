const express = require("express");
const app = express();

app.use(express.static("static"));
app.use(express.json());

app.get("/", function(req, resp) 
{
    resp.sendFile(`${__dirname}/static/main.html`);
});

module.exports = app;