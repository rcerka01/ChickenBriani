import com from "./commonsController.js"
import dataController from "./dataController.js"
import conf from "../config/config.js"

/*
 * Inner. Used in rawOutput and outputProfitsByYear
 */
function createTitle(currency) {
    return currency.name + "<br> margin: " + com.getMarginGbp(currency).toFixed(2) + 
        " pip: "    + currency.pip + " or " + com.getOnePipValueGbp(currency).toFixed(2) + " gbp"
}

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

    var output = "<table><tr style='color: brown;'><th colspan=7>" + createTitle(currency) + "</th>" +
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

    var output = "<table><tr>" +
    "<th colspan=4></th>" +
    "<th>Close         </th><th>Direction     </th>" +
    "<th>Daily<br> PIPs</th><th>Max<br> PIPs  </th><th>Min<br> PIPs</th>"  +
    "<th>Daily<br> GBP </th><th>Max<br> GBP   </th><th>Min<br> GBP </th>"  +
    "<th>Taken<br> PIPs</th><th>Taken<br> GBP </th>" +
    "<th>Open          </th><th>SL<br>TP      </th><th>Test        </th>"
    "</tr>"

    arr.forEach( (element, i) => {

        // colors
        if (i % 2 == 0) trColor = "#eee"; else trColor = "#fff";

        if (element.isOpen) isOpenColor = "#000"
        else isOpenColor = "#fff"; 

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
            "<td>" + element.time + "</td>" +
            "<td>" + element.date + "</td>" +
            "<td><strong>" + element.weekday + "</strong></td>" +

            "<td><span>" + Number(element.currentClose).toFixed(5) + "</span></td>" +
            "<td><span>" + element.direction + "</span></td>" +

            "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyProfitInPips.toFixed() + "</td>" +
            "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMaxProfitInPips.toFixed() + "</td>" +
            "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMinProfitInPips.toFixed() + "</td>" +
            
            "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";font-weight:bold;'>" + dailyProfitInGBP.toFixed(2) + "</td>" +
            "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";'>" + dailyMaxProfitInGBP.toFixed(2) + "</td>" +
            "<td style='color:" + isOpenColor + ";background-color:" + redgreen + ";font-weight:bold;'>" + dailyMinProfitInGBP.toFixed(2) + "</td>" +

            "<td>" + takenProfitInPips.toFixed()  + "</td>" +
            "<td " + takenProfitStyle + ">" + takenProfitInGBP.toFixed(2)  + "</td>" +
            "<td>" + element.isOpen  + "</td>" +
            "<td>" + element.slOrTp  + "</td>" +
            "<td>" + element.test + "</td>" +
        "</tr>"
    })

    output = output + "</table>"

    return output
}

/*
 *
 */
function outputProfitsByYear(arr, tp, sl, currency) {
    if (tp != undefined) var outputTp = "TP: " + tp + "<br>"; else var outputTp = ""
    if (sl != undefined) var outputSl = "SL: " + sl; else var outputSl = ""

    var onePipvalue = com.getOnePipValueGbp(currency)
    var margin = com.getMarginGbp(currency)
    
    var output = "<table style='border: 1px solid black;'>"
    output = output + "<tr>"
    arr.result.forEach( val => {
        output = output + "<th>" + val.year + "<br>" + outputTp + " " + outputSl + "</th>"
    })
    output = output + "</tr><tr>"

    arr.result.forEach( (val) => {

        var pips0 = com.convertToPips(val.profits[0], currency)
        var pips1 = com.convertToPips(val.profits[1], currency)
        var pips2 = com.convertToPips(val.profits[2], currency)
        var pips3 = com.convertToPips(val.profits[3], currency)
        var pips4 = com.convertToPips(val.profits[4], currency)
        var pips5 = com.convertToPips(val.profits[5], currency)
        var pips6 = com.convertToPips(val.profits[6], currency)
        var pips7 = com.convertToPips(val.profits[7], currency)
        var pips8 = com.convertToPips(val.profits[8], currency)
        var pips9 = com.convertToPips(val.profits[9], currency)
        var pips10 = com.convertToPips(val.profits[10], currency)
        var pips11 = com.convertToPips(val.profits[11], currency)

        output = output + "<td>" + 
        "January: " + pips0.toFixed() + " / <strong>" + (pips0 * onePipvalue).toFixed(2) + "</strong><br>" +
        "February: " + pips1.toFixed() + " / <strong>" + (pips1 * onePipvalue).toFixed(2) + "</strong><br>" +
        "March: " + pips2.toFixed() + " / <strong>" + (pips2 * onePipvalue).toFixed(2)+ "</strong><br>" + 
        "April: " + pips3.toFixed() + " / <strong>" + (pips3 * onePipvalue).toFixed(2) + "</strong><br>" + 
        "May: " + pips4.toFixed() + " / <strong>" + (pips4 * onePipvalue).toFixed(2) + "</strong><br>" + 
        "June: " + pips5.toFixed() + " / <strong>" + (pips5 * onePipvalue).toFixed(2) + "</strong><br>" + 
        "July: " + pips6.toFixed() + " / <strong>" + (pips6 * onePipvalue).toFixed(2) + "</strong><br>" + 
        "August: " + pips7.toFixed() + " / <strong>" + (pips7 * onePipvalue).toFixed(2) + "</strong><br>" + 
        "September: " + pips8.toFixed() + " / <strong>" + (pips8 * onePipvalue).toFixed(2) + "</strong><br>" +
        "October: " + pips9.toFixed() + " / <strong>" + (pips9 * onePipvalue).toFixed(2) + "</strong><br>" +
        "November: " + pips10.toFixed() + " / <strong>" + (pips10 * onePipvalue).toFixed(2) + "</strong><br>" +
        "December: " + pips11.toFixed() + " / <strong>" + (pips11 * onePipvalue).toFixed(2) + "</strong><br>" +
      "</td>"
    })

    output = output + "</tr><tr>"

    arr.result.forEach( val => {
        var sum = com.convertToPips(val.sum, currency) * onePipvalue
        output = output + "<th>" + sum.toFixed(2) + " (" + (sum * 100 / margin).toFixed(0) + "%)</th>"
    })

    output = output + "</tr>"
    output = output + "</table>"
    output = output + "<br>"

    return output
}

/*
 *
 */
function outputAvaragesAndPositives(val, currency) {
    var onePipvalue = com.getOnePipValueGbp(currency)

    var output = "<h4 style='color:brown;'>" + createTitle(currency) + "</h4>"
    output = output + "<stable>"

    var period = (val.total / 12).toFixed(0) + " years, " + (val.total % 12).toFixed(0) + " month (" + val.total + " total month)"
    var positivesPercent = (val.positives / val.total * 100).toFixed() 
    var total = (com.convertToPips(com.arrSum(val.sums), currency) * onePipvalue)
    var margin = com.getMarginGbp(currency)
    var yearlyRow = val.sums.map(val => " " + (com.convertToPips(val, currency) * onePipvalue).toFixed(2))  
    
    if (conf.extendedInfo.enabled) {
        var maxNeg = dataController.countMaxNegativeSequence(val.arrCountMinProfit.map(val => ({ takenProfit: Number(val.takenProfit), date: val.date }) ))
        var seqNegOut = maxNeg.tArr.map( (val, i) => " " + i + "x-" + val + "x")
        var maxNegOut = "<span style='color:red;'>" +com.toGbp(maxNeg.lowest, currency).toFixed(2) + "</span> " + maxNeg.date + " " + seqNegOut
        var lowest = com.toGbp(Math.min.apply(Math, val.arrCountMinProfit.map(val => Number(val.minProfit))), currency).toFixed(2)  
        var totalPercents = 100 * total / margin
        var maxNegGbp = com.toGbp(maxNeg.lowest, currency)
        var totalWithRiskPercents = 100 * total / (margin - maxNegGbp) // minus minus
        var totalWIthRiskPercentsFull = totalWithRiskPercents.toFixed(2) + "%, anual: " + (totalWithRiskPercents / val.total * 12).toFixed(2) + "%, monthly: " + (totalWithRiskPercents / val.total).toFixed(2) + "%"
        var totalPercentsFull = totalPercents.toFixed(2) + "%, anual: " + (totalPercents / val.total * 12).toFixed(2) + "%, monthly: " + (totalPercents / val.total).toFixed(2) + "%"
        var monthlyRow = val.monthlyProfits.sort((a, b) => b - a).map(val => (com.convertToPips(val, currency) * onePipvalue).toFixed(2))  
    } else {
        var maxNeg
        var seqNegOut 
        var maxNegOut
        var lowest 
        var totalPercents
        var maxNegGbp 
        var totalWithRiskPercents 
        var totalWIthRiskPercentsFull 
        var totalPercentsFull
        var monthlyRow 
    }

    var output = 
        "<table>" +
            "<tr><td><strong>TP: </strong></td><td>" + val.tp.toFixed(2) + " (" + com.GbpToPip(val.tp, currency).toFixed(2) + ")</td></tr>" +
            "<tr><td><strong>Sl: </strong></td><td>" + val.sl.toFixed(2) + " (" + com.GbpToPip(val.sl, currency).toFixed(2) + ")</td></tr>" +
            "<tr><td><strong>Period: </strong></td><td>" + period + "</td></tr>" +
            "<tr><td><strong>Positives: </strong></td><td>" + val.positives + " (<span style='color:red;'>" + positivesPercent + "%</span>)</td></tr>" +
            "<tr><td><strong>Lowest possible: </strong></td><td>" + lowest + "</td></tr>" +

            "<tr><td><strong>Total gain: </strong></td><td><span style='color:red;'>" + total.toFixed(2) + "</span></td></tr>" +
            "<tr><td><strong>Total gain %: </strong></td><td><span style='color:red;'>" + totalPercentsFull + "</span></td></tr>" +
            "<tr><td><strong>Margin: </strong></td><td><span style='color:red;'>" + margin.toFixed(2) + "</span></td></tr>" +
            "<tr><td><strong>Lowest sequential: </strong></td><td>" + maxNegOut + "</td></tr>" +
            "<tr><td><strong>Total min locked: </strong></td><td><span style='color:red;'>" + (margin - maxNegGbp).toFixed(2) + "</span></td></tr>" +
            "<tr><td><strong>Total % with risk: </strong></td><td><span style='color:red;'>" + totalWIthRiskPercentsFull + "</span></td></tr>" +
        "</table>" +    

        "<strong>Yearly profits: </strong><br>" + yearlyRow + "<br>" +
        "<strong>Monthly profits, descending: </strong><br>" + monthlyRow + "<br><br>"

    return output
}

export default {
    rawOutput,
    outputWithProfits,
    outputProfitsByYear,
    outputAvaragesAndPositives
}


