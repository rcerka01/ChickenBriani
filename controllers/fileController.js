const conf = require("../config/config");
const com = require("./commonsController");
const fs = require('fs');
const e = require("express");

// Quick utility, transfer to number with decimal five
function fix5(n) { return Number(n).toFixed(5) }

/*
* First function to read file. Returns days[]
*/

function formLines(dataArray, yearFrom, yearTo) {
    var direction     = ""
    var directionFlag = ""
    var days = []

    // inner
    function addItem(date, time, weekday, currentClose, nextClose, purchase, nextMin, nextMax) {
        var profit = 0
        var maxProf = 0
        var minProf = 0
        var test = ""

        if (directionFlag == "red") {
            profit  = purchase - nextClose
            maxProf = purchase - nextMin
            minProf = purchase - nextMax

            test = fix5(purchase) + " - " + fix5(nextClose) + " = <strong>" + fix5(profit)  + "</strong> : " +
                   fix5(purchase) + " - " + fix5(nextMin) + " = <strong>" + fix5(maxProf) + "</strong> : " +
                   fix5(purchase) + " - " + fix5(nextMax) + " = <strong>" + fix5(minProf) + "</strong>"

        } else if (directionFlag == "green") {
            profit  = nextClose - purchase
            maxProf = nextMax - purchase   
            minProf = nextMin - purchase

            test = fix5(nextClose) + " - " + fix5(purchase) + " = <strong>" + fix5(profit)  + "</strong> : " +
                   fix5(nextMax) + " - " + fix5(purchase) + " = <strong>" + fix5(maxProf) + "</strong> : " +
                   fix5(nextMin) + " - " + fix5(purchase) + " = <strong>" + fix5(minProf) + "</strong>"
        }

        return { profit, date, time, weekday, currentClose, direction, test, maxProf, minProf }
    }
    //

    // value what is constant till direction changes
    var purchase = 0

    dataArray.forEach( (line, i) => {
        // current line
        var lineArr = line.split(",") 
        
        // next line
        if (dataArray.length > i + 1) var nextLineArr = dataArray[i + 1].split(",")
        else var nextLineArr = []  

        var currentRedSignal   = lineArr[7]
        var currentGreenSignal = lineArr[8]

        var ts  = lineArr[0]
        var convertedDate = com.convertDateFromUnixTimestamp(Number(ts))
        var convertedTime = com.convertTimeFromUnixTimestamp(Number(ts))
        var weekday       = com.getWeekdayFromUnixTimestamp(Number(ts))

        if (com.dateToYear(convertedDate) >= yearFrom && com.dateToYear(convertedDate) <= yearTo) {
            // to check if last linecan be closed
            if (nextLineArr.length > 0) {
                if (currentRedSignal != "NaN") {
                        // first purchase
                        if (directionFlag.length == 0) {
                            purchase = lineArr[4]
                        }
                    if (directionFlag == "green") {
                        purchase = lineArr[4]
                    }
                    direction = "red"
                    directionFlag = "red"
                } 
                
                if (currentGreenSignal != "NaN") {
                        // first purchase
                        if (directionFlag.length == 0) {
                            purchase = lineArr[4]
                        }
                    if (directionFlag == "red") {
                        purchase = lineArr[4]
                    }
                    direction = "green"
                    directionFlag = "green"
                }

                if (currentRedSignal == "NaN" && currentGreenSignal == "NaN") { direction = "" }

                days.push(addItem(convertedDate, convertedTime, weekday, lineArr[4], nextLineArr[4], purchase, nextLineArr[3], nextLineArr[2])) 
            }
        }
    })

    return { days }
}

                

 
// function transfearDaysArr(daysArr) {
//     var result = []

//     var from = new Date(conf.year.from, 0, 1, conf.closingHour);
//     var to = new Date(conf.year.to, 11, 31, conf.closingHour);  

//     var prevCloses = []
//     var prevProfits = []
//     var prevDirections = []
//     var prevMaxProfits = []
//     var prevMaxLoses = []

//     var timeGap = com.timeGapMapper(conf.timeGap) 

//     var LOOP_TIME_INDEX = 0

//     function increaseDay(day) {
//         if ((LOOP_TIME_INDEX + 1) == timeGap) {
//             LOOP_TIME_INDEX = 0
//             var result =  day.setDate(day.getDate() + 1)
//         }
//         else {
//             LOOP_TIME_INDEX = LOOP_TIME_INDEX + 1
//             var result = day
//         }
//         return result
//     }

//     for (var day = from; day <= to; increaseDay(day)) {
//         var profits = []
//         var closes = []
//         var directions = []
//         var maxProfits = []
//         var maxLoses = []
//         var signals = []

//         var convertedDate = com.convertDateFromTimestamp(day)
//         var convertedTime = com.convertTimeFromTimestamp(day)

//         for (var i=0; i<daysArr.length; i++) {
//             var val = daysArr[i].filter(item => item.date == convertedDate)[LOOP_TIME_INDEX]

//             if (val !== void 0) {
//                 if (val.close !== void 0) { closes.push(val.close); prevCloses[i] = val.close }
//                 else closes.push(prevCloses[i])

//                 if (val.profit !== void 0) { profits.push(val.profit); prevProfits[i] = val.profit }
//                 else profits.push(prevProfits[i])

//                 if (val.direction !== void 0) { directions.push(val.direction); prevDirections[i] = val.direction }
//                 else directions.push(prevDirections[i])

//                 if (val.maxProfit !== void 0) { maxProfits.push(val.maxProfit); prevMaxProfits[i] = val.maxProfit }
//                 else maxProfits.push(prevMaxProfits[i])

//                 if (val.maxLose !== void 0) { maxLoses.push(val.maxLose); prevMaxLoses[i] = val.maxLose }
//                 else maxLoses.push(prevMaxLoses[i])

//                 if (val.signal !== void 0) { signals.push(val.signal); }
//                 else signals.push("")
//             } else {
//                 closes.push(prevCloses[i])
//                 profits.push(prevProfits[i])
//                 directions.push(prevDirections[i])
//                 maxProfits.push(prevMaxProfits[i])
//                 maxLoses.push(prevMaxLoses[i])
//                 signals.push("")
//             }
//         }

//         function getShortTime(timeGap, fourHindex) {
//             if (timeGap == "1H") return fourHindex
//             if (timeGap == "4H") return (fourHindex + 1) * 4 - 24 + conf.closingHour
//             if (timeGap == "1D") return conf.closingHour
//         }

//         result.push({
//             date: convertedDate,
//             time: convertedTime,
//             shotrTime: getShortTime(conf.timeGap, LOOP_TIME_INDEX) + "h",
//             closes: closes,
//             profits: profits,
//             directions: directions,
//             maxProfits,
//             maxLoses,
//             signals
//         })
//     }  
//     return result
// }

// /* OUTPUTT */

// /* buy year */
// function formatMultipleFileTable(multArr, currencies) {
//     var output = "<table>"
//     for (var i=conf.year.from; i<conf.year.to + 1; i++) {
//         output = output + "<tr>" + formatMultipleFileRow(multArr, i.toString(), currencies) + "</tr>"
//     }
//     return output + "</table>"
// }

// function formatMultipleFileRow(multArr, year, currencies) {
//     var output = ""
//     multArr.forEach( (arr, index) => {
//         var currency = currencies[index]
//         output = output + 
//                     "<td style='text-align:center;padding:10px;vertical-align:top'>" + 
//                         "<strong>" + com.createTitle(currency) + "<br>" + year + "</strong>" +
//                         "</br></br>" +
//                         formatYearlyOutput(com.filterByYear(arr, year), currency) + 
//                     "</td>"
//     })
//     return output
// }

// function formatYearlyOutput(arr, currency) {
//     var output = 
//     "<table>" +
//       "<tr>" +
//         "<th></th><th>Date</th><th>Direction</th><th>Profit</th><th>Yearly acc</th><th>Total acc</th>" +
//       "</tr>"

//     var COUNTER = 1
//     var yearlyProfit = 0

//     arr.forEach( data => {

//       if (Number(data.profit) < 0) var color = "coral"
//       else var color = ""

//       if (!isNaN(Number(data.profit))) yearlyProfit = yearlyProfit + Number(data.profit)

//       var onePipInGBP = com.getOnePipValueGbp(currency)

//       output = output + 
//         "<tr>" +
//           "<td style='background-color:" + color + ";white-space:nowrap;'>" + COUNTER  + "</td>" + 
//           "<td style='background-color:" + color + ";white-space:nowrap;'>" + data.date + "</td>" + 
//           "<td style='background-color:" + color + ";white-space:nowrap;'>" + data.direction + "</td>" +
//           "<td style='background-color:" + color + ";white-space:nowrap;'>" + (com.convertToPips(data.profit, currency) * onePipInGBP).toFixed(2) + "</td>" +
//           "<td style='background-color:" + color + ";white-space:nowrap;'>" + (com.convertToPips(yearlyProfit, currency) * onePipInGBP).toFixed(2) + "</td>" +
//           "<td style='background-color:" + color + ";white-space:nowrap;'>" + (com.convertToPips(data.acc, currency) * onePipInGBP).toFixed(2) +  "</td>" +
//         "</tr>"

//         COUNTER = COUNTER + 1
//     })

//     output = output + "</table>"

//     return output
//   }

/* every day */
function rawOutput(days, currency) {
    var pipValue = com.getOnePipValueGbp(currency)

    var trColor = "#fff"
    var redgreen = "#fff"

    var output = "<table><tr style='color: brown;'><th colspan=7>" + com.createTitle(currency) + "</th><th colspan=2>Profit</th><th colspan=2>Max profit</th><th colspan=2>Max loss</th></tr>" +
        "<th>Nr</th><th>Time</th><th>Date</th><th>Day</th><th>Current<br>close</th><th>Next<br>close</th><th>Open</th>" +
        "<th>Direction</th><th>Test</th><th>Pips</th><th>GBP</th><th>Pips</th><th>GBP</th><th>Pips</th><th>GBP</th></tr>"
    var counter = 1
    days.forEach(day => {
        var earnedPipsProfit = com.convertToPips(day.profit, currency)
        var earnedPipsMaxProfit = com.convertToPips(day.maxProf, currency)
        var earnedPipsMaxLoss = com.convertToPips(day.minProf, currency)

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

const readFile = async (path, yearFrom, yearTo) => {
    try {
        const data = await fs.promises.readFile(path, 'utf8')
        var dataArray = data.split(/\r?\n/);
        dataArray.shift();
        return formLines(dataArray, yearFrom, yearTo)
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    rawOutput,
    readFile

    //     switch (conf.read.switch) {
    //         case 1:
    //             var output = rawOutput(data.map(val => val.days)[0], currency)
    //         break
    //         case 2:
    //             var output = formatMultipleFileTable(data.map(val => val.sums), currencies)
    //         break
    //         case 3: 
    //             com.saveJson(transfearDaysArr(data.map(val => val.days), currencies))
    //             var output = "OK"
    //         break
    //     }

    //     return output
    // }
}
