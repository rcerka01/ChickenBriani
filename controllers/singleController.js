const com = require("./commonsController");
const conf = require("../config/config");

// *** FROM data.json *** //

/* OUTPUT */

function outputProfits(arr, currency) {
    var output = "<table><tr><th></th><th></th><th></th><th>Daily PIPs</th><th>Max PIPs</th><th>Min PIPs</th><th>Daily GBP</th><th>Max GBP</th><th>Min GBP</th><th>Profit PIPs</th><th>Profit GBP</th><th>close</th><th> mid close</th>" +
        "<th>Signal</th></tr>"

    var day = 0
    var dayColor = "#ddd"

    var dayProfits = []

    arr.forEach( (element, i) => {
        if (!element.close) var color = element.direction 
        else var color = "black"

        if (!element.midClose) var midColor = element.direction 
        else var midColor = "black"

        var currentDay = element.date.split("/")[1]
        if (day != currentDay && dayColor == "#ddd") dayColor = "#eee"
        else if (day != currentDay && dayColor == "#eee") dayColor = "#ddd"

        var onePip = com.getOnePipValueGbp(currency)

        var dailyProfitInPips = com.convertToPips(element.profitDaily, currency)
        var dailyProfitInGBP = dailyProfitInPips * onePip

        var dailyMaxProfitInPips = com.convertToPips(element.profitMax, currency)
        var dailyMaxProfitInGBP = dailyMaxProfitInPips * onePip

        var dailyMaxLoseInPips = com.convertToPips(element.loseMax, currency)
        var dailyMaxLoseInGBP = dailyMaxLoseInPips * onePip

        var profitInPips = com.convertToPips(element.profit, currency)
        var profitInGBP = profitInPips * onePip

        if (conf.timeGap == "1H") {
            if (day != currentDay) {
                var dayProfitRow = "<tr bgcolor='white'><td align='center' valign='center' colspan='14'>"
                dayProfits.forEach( item => {
                    dayProfitRow = dayProfitRow + item.h + ", " + item.p + "<br>"
                })
                dayProfitRow = dayProfitRow + dayProfits.length + "<br>"
                dayProfitRow = dayProfitRow + "<strong>" + dayProfits.map(i=>Number(i.p)).reduce((a, b) => a + b, 0).toFixed(2) + "</strong>"
                dayProfitRow = dayProfitRow + "</td></tr>"
                dayProfits = []
            } else { var dayProfitRow = "" }
        } else { var dayProfitRow = "" }
        
        if (profitInGBP != 0) dayProfits.push({ h: element.shotrTime ,p: profitInGBP.toFixed(2) })

        output = output + dayProfitRow + "<tr bgcolor=" + dayColor + ">" +
        "<td>" + i + "</td>" +
        "<td>" + element.date + "</td>" +
        "<td>" + element.shotrTime + "</td>" +
        "<td><span style='color:" + element.direction + ";font-weight:bold;'>" + dailyProfitInPips.toFixed() + "</span></td>" +
        "<td><span style='color:" + element.direction + ";'>" + dailyMaxProfitInPips.toFixed() + "</span></td>" +
        "<td><span style='color:" + element.direction + ";'>" + dailyMaxLoseInPips.toFixed() + "</span></td>" +
        "<td><span style='color:" + element.direction + ";font-weight:bold;'>" + dailyProfitInGBP.toFixed(2) + "</span></td>" +
        "<td><span style='color:" + element.direction + ";'>" + dailyMaxProfitInGBP.toFixed(2) + "</span></td>" +
        "<td><span style='color:" + element.direction + ";'>" + dailyMaxLoseInGBP.toFixed(2) + "</span></td>" +
        "<td>" + profitInPips.toFixed()  + "</td>" +
        "<td>" + profitInGBP.toFixed(2)  + "</td>" +
        "<td><span style='color:" + color + ";'>" + element.close + "</td>" +
        "<td><span style='color:" + midColor + ";'>" + element.midClose + "</td>" +
        "<td>" + element.signal + "</td>" +
        "</tr>"

        day = currentDay
    })
    output = output + "</table>"
    return output
}

module.exports = { run: function (data) {
    var jsonData = JSON.parse(data)

    var ci = com.findCurrencyIndexById(conf.single.currencyId)

    var currency = conf.mapper.find(currency => currency.id == conf.single.currencyId)

    var output = currency.name + "<br>"

    switch (conf.single.switch) {
        // todo to open SL mut be fixed in takeProfits()
        // case 1:
        //     var tp = conf.single.singleTp
        //     var sl = conf.single.singleSl

        //     var avAndPos = []

        //     var profits = com.getProfits(jsonData, ci, tp, sl, currency)
        //     var profitsByYear = com.profitsByYearArr(profits)
        //     avAndPos.push(com.countAvaregesAndPositives(profitsByYear, tp, sl))

        //     output = com.outputAvaragesAndPositives(com.sortAvaragesAndPositives(avAndPos), currency)
        //            +com.outputProfitsByYear(profitsByYear, tp, sl, currency) 
        //            + outputProfits(profits, currency)
        // break

        // case 2:
        //     var startTp = conf.single.multipleTP.start
        //     var stopTp = conf.single.multipleTP.stop
        //     var stepTp = conf.single.multipleTP.step
           
        //     var startSl = conf.single.multipleSL.start
        //     var stopSl = conf.single.multipleSL.stop
        //     var stepSl = conf.single.multipleSL.step

        //     var avAndPos = []
        //     var outputProfitsByYear = ""
        //     for (var i=startTp; i<=stopTp; i=i+stepTp) {
        //         for (var ii=startSl; ii<=stopSl; ii=ii+stepSl) {

        //             var profits = com.getProfits(jsonData, ci, i, ii, currency)
        //             var profitsByYear = com.profitsByYearArr(profits)

        //             avAndPos.push(com.countAvaregesAndPositives(profitsByYear, i, ii))

        //             outputProfitsByYear = outputProfitsByYear + "<br>" +  com.outputProfitsByYear(profitsByYear, i, ii, currency) 
        //         }
        //     }

        //     output = output + com.outputAvaragesAndPositives(com.sortAvaragesAndPositives(avAndPos), currency) + outputProfitsByYear
        // break

        case 3:
            var tp = conf.single.singleTp
            var sl = conf.single.singleSl

            var avAndPos = []

            var profits = com.getProfits2(jsonData, ci, tp, sl, currency)
            var profitsByYear = com.profitsByYearArr(profits)
            avAndPos.push(com.countAvaregesAndPositives(profitsByYear, tp, sl))

            output = com.outputAvaragesAndPositives(com.sortAvaragesAndPositives(avAndPos), currency)
                   +com.outputProfitsByYear(profitsByYear, tp, sl, currency) 
                   + outputProfits(profits, currency)
        break

        case 4:
            var startTp = conf.single.multipleTP.start
            var stopTp = conf.single.multipleTP.stop
            var stepTp = conf.single.multipleTP.step
           
            var startSl = conf.single.multipleSL.start
            var stopSl = conf.single.multipleSL.stop
            var stepSl = conf.single.multipleSL.step

            var avAndPos = []
            var outputProfitsByYear = ""
            for (var i=startTp; i<=stopTp; i=i+stepTp) {
                for (var ii=startSl; ii<=stopSl; ii=ii+stepSl) {

                    var profits = com.getProfits2(jsonData, ci, i, ii, currency)
                    var profitsByYear = com.profitsByYearArr(profits)

                    avAndPos.push(com.countAvaregesAndPositives(profitsByYear, i, ii))

                    outputProfitsByYear = outputProfitsByYear + "<br>" +  com.outputProfitsByYear(profitsByYear, i, ii, currency) 
                }
            }

            output = output + com.outputAvaragesAndPositives(com.sortAvaragesAndPositives(avAndPos), currency) + outputProfitsByYear
        break
    }
    return output
}}
