const singleController = require("./singleController")
const fileController   = require("./fileController")
const conf             = require("../config/config");
const fs               = require('fs')

async function getData(currency, step) { 
  var path = conf.fileName.path + conf.fileName.prefix + currency + conf.fileName.join + step + ".csv"
  var currencyData = conf.mapper.find(c => c.name == currency)
  var items = await fileController.readFile(path)
  return { items, currencyData }
}

module.exports = { run: function (app) {
  // app.get("/combined", function(req, res) {
  //   fs.readFile('data.json', 'utf8', (err, data) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }
  //     var output = combinedController.run(data)
  //     res.render("index", { output });
  //   });
  // })

  app.get("/single", function(req, res) {
    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      var output = singleController.run(data)
      res.render("index", { output });
    });
  })
    
  // app.get("/read", async function(req, res) {
  //    var output = await fileController.readFiles()
  //    res.render("index", { output });
  // });

  app.get("/:currency/:step/raw", async function(req, res) {
    var currency = req.params.currency;
    var step = req.params.step;

    var data = await getData(currency, step)
    var output = fileController.rawOutput(data.items.days, data.currencyData)
    res.render("index", { output });

 });




 app.get("/:currency/:step/profits", async function(req, res) {
    var currency = req.params.currency;
    var step = req.params.step;

    var data = await getData(currency, step)

   // console.log(JSON.stringify(data.currencyData))

    res.statusCode = 200;
    res.send('Done ');

    // res.render("index", { output });
  });

}}
