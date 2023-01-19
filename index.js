var conf = require("./config/config");

var express = require('express');
var app = express();

app.set("view engine", "ejs");
app.use("/assets", express.static(__dirname + "/public"));


var mainController = require('./controllers/mainController');
mainController.run(app);

app.listen(conf.app.port);