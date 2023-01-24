const conf             = require("../config/config");
const fs               = require('fs')
const singleController = require("./singleController")
const dataController   = require("./dataController")
const outputController   = require("./outputController")

async function getData(currency, step, yearFrom, yearTo) { 
  var path = conf.fileName.path + conf.fileName.prefix + currency + conf.fileName.join + step + ".csv"
  var currencyData = conf.mapper.find(c => c.name == currency)
  var items = await dataController.readFile(path, yearFrom, yearTo)
  return { days: items.days, currencyData }
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

app.get("/", async function(req, res) {
  var output = 
    "<p style = 'padding:20px;'>" +
    "http://localhost:3000/GBPCHF/1D/2023/2023/raw <br>" +
    "/:currency/:step/:yearfrom/:yearto/raw <br><br>" +

    "http://localhost:3000/GBPCHF/1D/2023/2023/0/10000/-10000/take" +
    "/:currency/:step/:yearfrom/:yearto/:spread/:tp/:sl/take" +
    "</p>"
  res.render("index", { output });
});

app.get("/:currency/:step/:yearfrom/:yearto/raw", async function(req, res) {
    var currency = req.params.currency;
    var step     = req.params.step;
    var yearFrom = req.params.yearfrom;
    var yearTo   = req.params.yearto;

    var data = await getData(currency, step, yearFrom, yearTo)
    var output = outputController.rawOutput(data)
    res.render("index", { output });
 });


app.get("/:currency/:step/:yearfrom/:yearto/:spread/:tp/:sl/take", async function(req, res) {
  var currency = req.params.currency;
  var step     = req.params.step;
  var yearFrom = req.params.yearfrom;
  var yearTo   = req.params.yearto;
  var spread   = Number(req.params.spread);
  var tp       = Number(req.params.tp);
  var sl       = Number(req.params.sl);

  var data = await getData(currency, step, yearFrom, yearTo)

  console.log(data.currencyData)
  console.log(data.days[5])

  var dataWithProfits = dataController.takeProfits(data, spread, tp, sl)
  var output = outputController.outputWithProfits(dataWithProfits)

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
