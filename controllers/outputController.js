const com = require("./commonsController");

function rawOutput(days, currency) {
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

module.exports = {
    rawOutput,
}


