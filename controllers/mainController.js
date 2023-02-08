import conf from "../config/config.js"
import dataController from "./dataController.js"
import outputController from "./outputController.js"
import com from "./commonsController.js"

async function getData(currency, step, yearFrom, yearTo, isSimple) { 
  var path = conf.fileName.path + conf.fileName.prefix + currency + conf.fileName.join + step + ".csv"
  var currencyData = conf.mapper.find(c => c.name == currency)
  var items = await dataController.readFile(path, yearFrom, yearTo, isSimple)
  return { days: items.days, currencyData }
}

function toOutput(res, html, json) {
  if (process.env.NODE_ENV === "test") res.json(json)
  else res.render("index", { html });
}

export default { run: function (app) {

  app.get("/", async function(req, res) {
    var html = 
      "<p style = 'padding:20px;'>" +
      "<a target='_blank' href='http://localhost:3000/GBPCHF/1D/2023/2023/raw'>http://localhost:3000/GBPCHF/1D/2023/2023/raw</a><br>" +
      "/:currency/:step/:yearfrom/:yearto/raw <br><br>" +

      "<a target='_blank' href='http://localhost:3000/GBPCHF/1D/60/2021/2023/0/34/-30/take'>http://localhost:3000/GBPCHF/1D/60/2021/2023/0/34/-30/take</a><br>" +
      "/:currency/:step/:lowerstep/:yearfrom/:yearto/:spread/:tp/:sl/take<br><br>" +

      "<a target='_blank' href='http://localhost:3000/EURUSD/1D/240/2016/2023/1/0/80/2/-200/-10/5/multiple'>http://localhost:3000/EURUSD/1D/240/2016/2023/1/0/80/2/-200/-10/5/multiple</a><br>" +
      "/:currency/:step/:lowerstep/:yearfrom/:yearto/:spread/:tpfrom/:tptill/:tpstep/:slfrom/:sltill/:slstep/multiple<br><br>" +
      "</p>"

      toOutput(res, html, {})
    });

  app.get("/:currency/:step/:yearfrom/:yearto/raw", async function(req, res) {
      var currency = req.params.currency;
      var step     = req.params.step;
      var yearFrom = req.params.yearfrom;
      var yearTo   = req.params.yearto;

      var data = await getData(currency, step, yearFrom, yearTo)
      var html = outputController.rawOutput(data)

      toOutput(res, html, data)
  });

  app.get("/:currency/:step/:lowerstep/:yearfrom/:yearto/:spread/:tp/:sl/take", async function(req, res) {
    var currency  = req.params.currency;
    var step      = req.params.step;
    var lowerStep = req.params.lowerstep;
    var yearFrom  = req.params.yearfrom;
    var yearTo    = req.params.yearto;
    var spread    = Number(req.params.spread);
    var tp        = Number(req.params.tp);
    var sl        = Number(req.params.sl);

    var currencyData = conf.mapper.find(c => c.name == currency)
    // uses readLine
    var data =      await getData(currency, step,      yearFrom, yearTo)
    // uses readLineSmple
    var lowerData = await getData(currency, lowerStep, yearFrom, yearTo, true)

    var dataWithProfits = dataController.takeProfits(data, lowerData, lowerStep, spread, tp, sl)
    var byYear = dataController.profitsByYear(dataWithProfits.arr, yearFrom, yearTo)

    var html = outputController.outputAvaragesAndPositives(
        dataController.countAvaregesAndPositives(byYear, tp, sl), currencyData)
        + outputController.outputProfitsByYear(byYear, tp, sl, currencyData)
        + outputController.outputWithProfits(dataWithProfits)
    
    toOutput(res, html, { dataWithProfits, byYear })
  })

  app.get("/:currency/:step/:lowerstep/:yearfrom/:yearto/:spread/:tpfrom/:tptill/:tpstep/:slfrom/:sltill/:slstep/multiple", async function(req, res) {
    var currency  = req.params.currency;
    var step      = req.params.step;
    var lowerStep = req.params.lowerstep;
    var yearFrom  = req.params.yearfrom;
    var yearTo    = req.params.yearto;
    var spread    = Number(req.params.spread);
    var tpfrom    = Number(req.params.tpfrom);
    var tptill    = Number(req.params.tptill);
    var tpstep    = Number(req.params.tpstep);
    var slfrom    = Number(req.params.slfrom);
    var sltill    = Number(req.params.sltill);
    var slstep    = Number(req.params.slstep);

    var currencyData = conf.mapper.find(c => c.name == currency)
    // uses readLine
    var data =      await getData(currency, step,      yearFrom, yearTo)
    // uses readLineSmple
    var lowerData = await getData(currency, lowerStep, yearFrom, yearTo, true)

    var outputs = []
    var html  = ""

    for (var i=tpfrom; i<=tptill; i=i+tpstep) {
      for (var ii=slfrom; ii<=sltill; ii=ii+slstep) {

        var dataWithProfits = dataController.takeProfits(data, lowerData, lowerStep, spread, i, ii)
        var byYear = dataController.profitsByYear(dataWithProfits.arr, yearFrom, yearTo)

        outputs.push(dataController.countAvaregesAndPositives(byYear, i, ii))
      }
    }

    outputs.sort((a,b) => com.arrSum(b.sums) - com.arrSum(a.sums))

    outputs.forEach( item => html = html + outputController.outputAvaragesAndPositives(item, currencyData))

    toOutput(res, html, {})
  });

}}
