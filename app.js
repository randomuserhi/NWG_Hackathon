const express = require("express");
const app = express();

//https://stackoverflow.com/questions/57009371/access-to-xmlhttprequest-at-from-origin-localhost3000-has-been-blocked
const cors = require('cors');
app.use(cors());

app.use(express.static("static"));
app.use(express.json());

app.get("/", function(req, resp) {
    resp.sendFile(`${__dirname}/client-page/index.html`);
});

app.use(express.static("client-page"));
app.use(express.json());

app.get("/client-page/", function(req, resp) {
    resp.sendFile(`${__dirname}/static/main.html`);
});

let data = [];

app.post("/report", function(req, resp){
    console.log("report called")
    try{
        data.push(req.body);
        resp.send(JSON.stringify("Report successfully sent."));
    } catch(e) {
        console.log(e)
        resp.send(JSON.stringify("Error submitting report, please try again later."));
    }    
});

app.get("/refresh", function(req, resp){
    
    try{
        resp.send(JSON.stringify(data));
        data = [];
    } catch(e) {
        console.log(e);
        resp.send(JSON.stringify("Error sending heatmap data. please try again later."));
    }
});

module.exports = app;