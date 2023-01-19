const com = require("./commonsController");
const conf = require("../config/config");

// *** FROM data.json *** //

/* CONTROLLER */

function joinProfits(data) {
    var jsonData = JSON.parse(data)
    var currencies = com.getEnabledCurrencies()

    var arr = []
    var result = []

    var isCombined = true
    currencies.forEach( val => {
        arr.push(com.getProfits(jsonData, com.findCurrencyIndexById(val.id), conf.single.singleTp, conf.single.singleSl, val, isCombined)) 
    })

    arr[0].forEach( (val, index) => {
        var dailies = []
        var profits = []
        var directions = []
        for (var i=0; i < currencies.length; i++) {
            dailies.push(arr[i][index].profitDaily)
            profits.push(arr[i][index].profit)
            directions.push(arr[i][index].direction)
        }
        var item = { date: val.date, dailies: dailies, profits: profits, directions: directions, sum: com.arrSum(dailies) }
        result.push(item)
    })
    return result
}

function isOpensSmallerSl(closes, dailies, sl) {
    var results = []
    dailies.forEach( (val, i) => {
        if (!closes[i]) results.push(val)
    })
    if (com.arrSum(results) < sl) return true
    return false
}

function isOpensGreaterTp(closes, dailies, tp) {
    var results = []
    dailies.forEach( (val, i) => {
        if (!closes[i]) results.push(val)
    })
    if (com.arrSum(results) > tp) return true
    return false
}

function createOutputItem(val, closes, commonProfit) {
    return { 
        date: val.date, 
        dailies: val.dailies, 
        profits: val.profits, 
        directions: val.directions, 
        sum: val.sum, 
        closes: closes.map(Boolean), 
        profit: commonProfit }
}

function takeProfit(arr, tp, sl) {
    var results = []
    var closes = com.loadCurrenciesBoolArray(true)

    arr.forEach( (val, index) => {
        var profits = []
        var tpSlDoneFlag = false

        if (isOpensGreaterTp(closes, val.dailies, tp) || isOpensSmallerSl(closes, val.dailies, sl)) {
            closes.forEach( (close, i) => {
                if (!close) { 
                    closes[i] = true; 
                    profits.push(val.dailies[i])
                    tpSlDoneFlag = true
                }
            })
        } 
        
        closes.forEach( (close, i) => {
            if (arr[index + 1] !== void 0 && val.directions[i] !== arr[index + 1].directions[i]) { 
                if (close) closes[i] = false
                else {
                    if (!tpSlDoneFlag) profits.push(val.profits[i])
                } 
            }
        })

        results.push(createOutputItem(val, closes, com.arrSum(profits)))
    })

    return results
}

/* OUTPUTT */

function formTableArrHead(currencies) {
    var output = ""
    currencies.forEach( val => {
        output = output + "<th>" + val.name + "</th>"
    })
    return output
}

function formTableArrCells(arr, colors) {
    var output = ""

    arr.forEach( (val, i) => {
        if (typeof val == "boolean" && val)  output = output + "<td style='color:black;'>" + val + "</td>"
        else output = output + "<td style='color:" + colors[i] + ";'>" + val + "</td>"
    })

    return output
} 

function outputResult(arr) {
    var currencies = com.getEnabledCurrencies()
    var length = currencies.length
    var output = "<table>"
    output = output 
                + "<tr>"
                + "<th>DATE</th>"
                + "<th colspan='" + length + "'>profit</th>"
                + "<th>SUM</th>"
                + "<th colspan='" + length + "'>taken</th>"
                + "<th>PROFIT</th>"
                + "<th colspan='" + length + "'>close</th>"
                + "</tr>"

                + "<tr>"
                + "<th></th>"
                + formTableArrHead(currencies)
                + "<th></th>"
                + formTableArrHead(currencies)
                + "<th></th>"
                + formTableArrHead(currencies)
                + "</tr>"
    arr.forEach( val => {
        output = output 
            + "<tr>"
            + "<td>" + val.date + "</td>"
            + formTableArrCells(val.dailies.map(val => Number(val).toFixed(2)), val.directions)
            + "<td><strong>" + val.sum.toFixed(2) + "</strong></td>"
            + formTableArrCells(val.profits.map(val => Number(val).toFixed(2)), val.directions)
            + "<td><strong>" + val.profit.toFixed(2) + "</strong></td>"
            + formTableArrCells(val.closes, val.directions)
            + "</tr>"
    })

    output = output + "</table>"
    return output
}

function outputProfitsByYearCombined(arr, tp, sl) {
    if (tp != undefined) var outputTp = "TP: " + tp + "<br>"; else var outputTp = ""
    if (sl != undefined) var outputSl = "SL: " + sl; else var outputSl = ""
    var output = "<table style='border: 1px solid black;'>" +
                    "<tr>"
    arr.forEach( val => {
        output = output + "<th>" + val.year + "<br>" + outputTp + " " + outputSl + "</th>"
    })
    output = output + "</tr><tr>"
    arr.forEach( val => {
        output = output + "<td>" + 
        "January: " + val.profits[0].toFixed(2) + "<br>" +
        "February: " + val.profits[1].toFixed(2) + "<br>" +
        "March: " + val.profits[2].toFixed(2) + "<br>" + 
        "April: " + val.profits[3].toFixed(2) + "<br>" + 
        "May: " + val.profits[4].toFixed(2) + "<br>" + 
        "June: " + val.profits[5].toFixed(2) + "<br>" + 
        "July: " + val.profits[6].toFixed(2) + "<br>" + 
        "August: " + val.profits[7].toFixed(2) + "<br>" + 
        "September: " + val.profits[8].toFixed(2) + "<br>" +
        "October: " + val.profits[9].toFixed(2) + "<br>" +
        "November: " + val.profits[10].toFixed(2) + "<br>" +
        "December: " + val.profits[11].toFixed(2) + "<br>" +
      "</td>"
    })
    output = output + "</tr><tr>"
    arr.forEach( val => {
        output = output + "<th>" + val.sum.toFixed(2) + "</th>"
    })
    output = output + "</tr>"

    return output
}

function outputAvaragesAndPositivesCombined(arr) {
    var positives = arr.map(val => val.positives)
    var maxPositives = Math.max.apply(Math, positives)

    var output = "<table>"

    arr.forEach( (val, i) => {
        output = output + 
            "<tr>" + 
                "<td>TP: " + val.tp + "</td>" +
                "<td>SL: " + val.sl + "</td>" +
                "<td>" + val.positives + "/" + val.total + "</td>" +
                "<td><strong>" + val.sums.map(val => " " + val.toFixed(2)) + "</strong></td>" +
            "</tr>" + 
            "<tr>" + 
               "<td>max: " + maxPositives + " / </td>" +
                "<td>" + (val.positives / val.total * 100).toFixed() + "%</td>" +
                "<td style='color:red;'>" + com.arrSum(val.sums).toFixed(2)  + "</td>" +
                "<td>" + val.sums.sort((a,b) => Number(a) - Number(b)).map(val => " " + val.toFixed(2))  + "</td>" +
            "</tr>" +
            "<tr>" + 
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<td>" + val.monthlyProfits.sort((a,b) => a - b).map(val => val.toFixed(2))  + "</td>" +
            "</tr>" 
    })
    output = output + "</table>"
    return output
}

module.exports = { run: function (data) {
    var joined = joinProfits(data)

    var output = ""

    var startTp = conf.combined.multipleTP.start
    var stopTp = conf.combined.multipleTP.stop
    var stepTp = conf.combined.multipleTP.step

    var startSl = conf.combined.multipleSL.start
    var stopSl = conf.combined.multipleSL.stop
    var stepSl = conf.combined.multipleSL.step

    switch (conf.combined.switch) {
        case 1:
            var result = takeProfit(joined, conf.combined.tp, conf.combined.sl)
            var profitsByYear = com.profitsByYearArr(result)
        
            output = output + outputProfitsByYearCombined(profitsByYear, conf.combined.tp, conf.combined.sl) + "<br>" + outputResult(result)
        break

        case 2:
            var avAndPos = []
            var outputProfitsByYear = ""
            for (var i=startTp; i<=stopTp; i=i+stepTp) {

                for (var ii=startSl; ii<=stopSl; ii=ii+stepSl) {
                    var result = takeProfit(joined, i, ii)
                    var profitsByYear = com.profitsByYearArr(result)

                    avAndPos.push(com.countAvaregesAndPositives(profitsByYear, i, ii))

                    outputProfitsByYear = outputProfitsByYear + "<br>" +  outputProfitsByYearCombined(profitsByYear, i, ii)
                }
            }

            output = output + outputAvaragesAndPositivesCombined(com.sortAvaragesAndPositives(avAndPos)) + outputProfitsByYear
        break
    }

    return output
}}
