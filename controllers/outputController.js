const com = require("./commonsController");

/*
 * Direct output with direction turnings and test
 */
function rawOutput(data) {
    var days = data.days
    var currency = data.currencyData

    var pipValue = com.getOnePipValueGbp(currency)

    // init
    var trColor = "#fff"
    var redgreen = "#fff"
    var counter = 1

    var output = "<table><tr style='color: brown;'><th colspan=7>" + com.createTitle(currency) + "</th>" +
        "<th colspan=2>Profit</th><th colspan=2>Max profit</th><th colspan=2>Max loss</th></tr>" +
        "<th>Nr</th><th>Time</th><th>Date</th><th>Day</th><th>Close</th><th>Direction</th><th>Test</th>" +
        "<th>Pips</th><th>GBP</th><th>Pips</th><th>GBP</th><th>Pips</th><th>GBP</th></tr>"
    
    days.forEach(day => {
        var earnedPipsProfit = com.convertToPips(day.profit, currency)
        var earnedPipsMaxProfit = com.convertToPips(day.maxProf, currency)
        var earnedPipsMaxLoss = com.convertToPips(day.minProf, currency)

        // colors
        if (counter % 2 == 0) trColor = "#eee"; else trColor = "#fff";
        if (day.direction == "red") redgreen = "#FFCCCB" 
        else if (day.direction == "green") redgreen = "#90EE90"

        output = output + "<tr bgcolor=" + trColor + ">" +
            "<td ><strong>" + counter + "</strong></td>" +
            "<td>" + day.time + "</td>" +
            "<td>" + day.date + "</td>" +
            "<td>" + day.weekday + "</td>" +
            "<td><strong>" + Number(day.currentClose).toFixed(5) + "</strong></td>" +
            "<td>" + day.direction + "</td>" +
            "<td bgcolor=" + redgreen + ">" + day.test + "</td>" +
            "<td><strong>" + (earnedPipsProfit).toFixed() + "</strong></td>" +
            "<td><strong>" + (earnedPipsProfit * pipValue).toFixed(2) + "</strong></td>" +
            "<td style='color:green'>" + (earnedPipsMaxProfit).toFixed() + "</td>" +
            "<td style='color:green'>" + (earnedPipsMaxProfit * pipValue).toFixed(2) + "</td>" +
            "<td style='color:coral'>" + (earnedPipsMaxLoss).toFixed() + "</td>" +
            "<td style='color:coral'>" + (earnedPipsMaxLoss * pipValue).toFixed(2) + "</td>" +
            "</tr>"

        counter = counter + 1

    })
    return output
}

/*
 *
 */
function outputWithProfits(data) {
    // init
    var arr = data.arr
    var currency = data.currencyData
    var onePip = com.getOnePipValueGbp(currency)

    var isOpenColor = "#000"
    var trColor = "#fff"
    var redgreen = "#fff"
    var takenProfitStyle = ""

    var output = "<table><tr><th colspan=4></th>" +
    "<th>Close</th><th>Direction</th>" +
    "<th>Daily<br> PIPs</th><th>Max<br> PIPs</th><th>Min<br> PIPs</th>" +
    "<th>Daily<br> GBP</th><th>Max<br>  GBP</th><th>Min<br>  GBP</th>" +
    "<th>Taken<br>  PIPs</th><th>Taken<br> GBP</th></tr>"

    arr.forEach( (element, i) => {

        // colors
        if (i % 2 == 0) trColor = "#eee"; else trColor = "#fff";

        if (element.isOpen) isOpenColor = "#000"
        else isOpenColor = "grey"; 

        if (element.directionFlag == "red") redgreen = "#FFCCCB" 
        else if (element.directionFlag == "green") redgreen = "#90EE90";

        // daily profit
        var dailyProfitInPips = com.convertToPips(element.dailyProfit, currency)
        var dailyProfitInGBP = dailyProfitInPips * onePip

        // taken profit
        var takenProfitInPips = com.convertToPips(element.takenProfit, currency)
        var takenProfitInGBP = takenProfitInPips * onePip

        // maxProfit
        var dailyMaxProfitInPips = com.convertToPips(element.maxProfit, currency)
        var dailyMaxProfitInGBP = dailyMaxProfitInPips * onePip

        // minProfit
        var dailyMinProfitInPips = com.convertToPips(element.minProfit, currency)
        var dailyMinProfitInGBP = dailyMinProfitInPips * onePip

        // taken in bold
        if (Number(takenProfitInPips) != 0) takenProfitStyle = "style='font-weight:bold;'"; else takenProfitStyle = ""

        output = output + "<tr bgcolor=" + trColor + ">" +
        "<td>" + i + "</td>" +
        "<td>" + element.date + "</td>" +
        "<td>" + element.time + "</td>" +
        "<td><strong>" + element.weekday + "</strong></td>" +

        "<td><span>" + Number(element.currentClose).toFixed(5) + "</span></td>" +
        "<td><span>" + element.direction + "</span></td>" +

        "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyProfitInPips.toFixed() + "</td>" +
        "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMaxProfitInPips.toFixed() + "</td>" +
        "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMinProfitInPips.toFixed() + "</td>" +
        
        "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyProfitInGBP.toFixed(2) + "</td>" +
        "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMaxProfitInGBP.toFixed(2) + "</td>" +
        "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMinProfitInGBP.toFixed(2) + "</td>" +

        "<td>" + takenProfitInPips.toFixed()  + "</td>" +
        "<td " + takenProfitStyle + ">" + takenProfitInGBP.toFixed(2)  + "</td>" +
        "</tr>"
    })
    output = output + "</table>"

    return output
}

module.exports = {
    rawOutput,
    outputWithProfits
}


