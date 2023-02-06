import express from 'express'
import mainController from './controllers/mainController.js'

var __dirname = ""

var app = express();

app.set("view engine", "ejs");
app.use("/assets", express.static(__dirname + "/public"));

mainController.run(app);

export default app
