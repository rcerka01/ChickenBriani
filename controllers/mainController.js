const conf             = require("../config/config");
const dataController   = require("./dataController")
const outputController   = require("./outputController")

async function getData(currency, step, yearFrom, yearTo) { 
  var path = conf.fileName.path + conf.fileName.prefix + currency + conf.fileName.join + step + ".csv"
  var currencyData = conf.mapper.find(c => c.name == currency)
  var items = await dataController.readFile(path, yearFrom, yearTo)
  return { days: items.days, currencyData }
}

module.exports = { run: function (app) {

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

    var currencyData = conf.mapper.find(c => c.name == currency)

    var data = await getData(currency, step, yearFrom, yearTo)

    var dataWithProfits = dataController.takeProfits(data, spread, tp, sl)
    var byYear = dataController.profitsByYear(dataWithProfits.arr)

    var output = outputController.outputAvaragesAndPositives(
        dataController.countAvaregesAndPositives(byYear, tp, sl), currencyData)
        + outputController.outputProfitsByYear(byYear, tp, sl, currencyData)
        + outputController.outputWithProfits(dataWithProfits)
    
    res.render("index", { output }); 
  });

}}
