const conf = require("../config/config");
const com = require("./commonsController");
const fs = require('fs');
const e = require("express");

// *** FROM TRAIDING VIEW FiLES *** //

/* CONTROLLER */

function formLines(dataArray) {
    var direction = ""

    var startValue = 0
    var acc = 0

    var sums = []
    var days = []

    function addItem(date, time, prevProf, currentProf, isIncrAcc, min, max, signal) {
      //  console.log(new Date(date.substring(1, date.length-1)).getDay() + " " + date)
        if (com.dateToYear(date) >= conf.year.from && com.dateToYear(date) <= conf.year.to) {
            if (direction == "red") {
                var profit = prevProf - currentProf
                var maxProfit = prevProf - min
                var maxLose = prevProf - max
                var test = prevProf + " - " + currentProf + " : " + 
                           prevProf + " - " + min + " : " +
                           prevProf + " - " + max
                if (isIncrAcc) acc = acc + profit
            }
            else if (direction == "green") {
                var profit = currentProf - prevProf
                var maxProfit = max - prevProf
                var maxLose = min - prevProf
                var test = currentProf + " - " + prevProf + " : " + 
                                   max + " - " + prevProf + " : " +
                                   min + " - " + prevProf  
                if (isIncrAcc) acc = acc + profit
            }
            return { profit: profit, date: date, time: time, acc: acc, close: currentProf, direction: direction, test: test, maxProfit, maxLose, signal }
        }
    }

    // todo Reemove when day lagging issue resolved
    if (conf.timeGap == "1D") var lag = 86400
    else var lag = 0

    dataArray.forEach( line => {
        var lineArr = line.split(",")
        var ts = Number(lineArr[0]) + lag
        var sh1 = lineArr[7]
        var sh2 = lineArr[8]
        var min = lineArr[3]
        var max = lineArr[2]
        var convertedDate = com.convertDateFromUnixTimestamp(ts)
        var convertedTime = com.convertTimeFromUnixTimestamp(ts)
        var signal = ""

        if (com.dateToYear(convertedDate) >= conf.year.from && com.dateToYear(convertedDate) <= conf.year.to) {

            if (sh1 != "NaN") { signal = "red"; }
            if (sh2 != "NaN") { signal = "green"; }

            days.push(addItem(convertedDate, convertedTime, startValue, lineArr[4], false, min, max, signal))

            if (sh1 != "NaN") {
                sums.push(addItem(convertedDate, convertedTime, startValue, lineArr[4], true))
                direction = "red";
                startValue = lineArr[4]
            }

            if (sh2 != "NaN") {
                sums.push(addItem(convertedDate, convertedTime, startValue, lineArr[4], true))
                direction = "green";
                startValue = lineArr[4]
            }

        } 
    })
    return { sums: sums, days: days }
}

function transfearDaysArr(daysArr) {
    var result = []

    var from = new Date(conf.year.from, 0, 1, conf.closingHour);
    var to = new Date(conf.year.to, 11, 31, conf.closingHour);  

    var prevCloses = []
    var prevProfits = []
    var prevDirections = []
    var prevMaxProfits = []
    var prevMaxLoses = []

    var timeGap = com.timeGapMapper(conf.timeGap) 

    var LOOP_TIME_INDEX = 0

    function increaseDay(day) {
        if ((LOOP_TIME_INDEX + 1) == timeGap) {
            LOOP_TIME_INDEX = 0
            var result =  day.setDate(day.getDate() + 1)
        }
        else {
            LOOP_TIME_INDEX = LOOP_TIME_INDEX + 1
            var result = day
        }
        return result
    }

    for (var day = from; day <= to; increaseDay(day)) {
        var profits = []
        var closes = []
        var directions = []
        var maxProfits = []
        var maxLoses = []
        var signals = []

        var convertedDate = com.convertDateFromTimestamp(day)
        var convertedTime = com.convertTimeFromTimestamp(day)

        for (var i=0; i<daysArr.length; i++) {
            var val = daysArr[i].filter(item => item.date == convertedDate)[LOOP_TIME_INDEX]
            
            if (val !== void 0) {
                if (val.close !== void 0) { closes.push(val.close); prevCloses[i] = val.close }
                else closes.push(prevCloses[i])

                if (val.profit !== void 0) { profits.push(val.profit); prevProfits[i] = val.profit }
                else profits.push(prevProfits[i])

                if (val.direction !== void 0) { directions.push(val.direction); prevDirections[i] = val.direction }
                else directions.push(prevDirections[i])

                if (val.maxProfit !== void 0) { maxProfits.push(val.maxProfit); prevMaxProfits[i] = val.maxProfit }
                else maxProfits.push(prevMaxProfits[i])

                if (val.maxLose !== void 0) { maxLoses.push(val.maxLose); prevMaxLoses[i] = val.maxLose }
                else maxLoses.push(prevMaxLoses[i])

                if (val.signal !== void 0) { signals.push(val.signal); }
                else signals.push("")
            } else {
                closes.push(prevCloses[i])
                profits.push(prevProfits[i])
                directions.push(prevDirections[i])
                maxProfits.push(prevMaxProfits[i])
                maxLoses.push(prevMaxLoses[i])
                signals.push("")
            }
        }

        function getShortTime(timeGap, fourHindex) {
            if (timeGap == "1H") return fourHindex
            if (timeGap == "4H") return (fourHindex + 1) * 4 - 24 + conf.closingHour
            if (timeGap == "1D") return conf.closingHour
        }

        result.push({
            date: convertedDate,
            time: convertedTime,
            shotrTime: getShortTime(conf.timeGap, LOOP_TIME_INDEX) + "h",
            closes: closes,
            profits: profits,
            directions: directions,
            maxProfits,
            maxLoses,
            signals
        })
    }  
    return result
}

/* OUTPUTT */

/* buy year */
function formatMultipleFileTable(multArr, currencies) {
    var output = "<table>"
    for (var i=conf.year.from; i<conf.year.to + 1; i++) {
        output = output + "<tr>" + formatMultipleFileRow(multArr, i.toString(), currencies) + "</tr>"
    }
    return output + "</table>"
}

function formatMultipleFileRow(multArr, year, currencies) {
    var output = ""
    multArr.forEach( (arr, index) => {
        var currency = currencies[index]
        output = output + 
                    "<td style='text-align:center;padding:10px;vertical-align:top'>" + 
                        "<strong>" + com.createTitle(currency) + "<br>" + year + "</strong>" +
                        "</br></br>" +
                        formatYearlyOutput(com.filterByYear(arr, year), currency) + 
                    "</td>"
    })
    return output
}

function formatYearlyOutput(arr, currency) {
    var output = 
    "<table>" +
      "<tr>" +
        "<th></th><th>Date</th><th>Direction</th><th>Profit</th><th>Yearly acc</th><th>Total acc</th>" +
      "</tr>"
      
    var COUNTER = 1
    var yearlyProfit = 0
  
    arr.forEach( data => {
  
      if (Number(data.profit) < 0) var color = "coral"
      else var color = ""
  
      if (!isNaN(Number(data.profit))) yearlyProfit = yearlyProfit + Number(data.profit)

      var onePipInGBP = com.getOnePipValueGbp(currency)

      output = output + 
        "<tr>" +
          "<td style='background-color:" + color + ";white-space:nowrap;'>" + COUNTER  + "</td>" + 
          "<td style='background-color:" + color + ";white-space:nowrap;'>" + data.date + "</td>" + 
          "<td style='background-color:" + color + ";white-space:nowrap;'>" + data.direction + "</td>" +
          "<td style='background-color:" + color + ";white-space:nowrap;'>" + (com.convertToPips(data.profit, currency) * onePipInGBP).toFixed(2) + "</td>" +
          "<td style='background-color:" + color + ";white-space:nowrap;'>" + (com.convertToPips(yearlyProfit, currency) * onePipInGBP).toFixed(2) + "</td>" +
          "<td style='background-color:" + color + ";white-space:nowrap;'>" + (com.convertToPips(data.acc, currency) * onePipInGBP).toFixed(2) +  "</td>" +
        "</tr>"
  
        COUNTER = COUNTER + 1
    })
  
    output = output + "</table>"
  
    return output
  }

/* every day */ 
function rawOutput(days, currency) {
    var pipValue = com.getOnePipValueGbp(currency)

    var output = "<table><tr><th colspan=7>" + com.createTitle(currency) + "</th></tr>" +
                    "<th>Nr</th><th>Date</th><th>Time</th><th>Close</th><th>Direction</th><th>Test</th><th>Pips</th><th>GBP</th>"
    var counter = 1
    days.forEach( day => {
        var earnedPips = com.convertToPips(day.profit, currency)
        output = output + "<tr>" +
        "<td><strong>" + counter + "</strong></td>" + 
        "<td>" + day.date + "</td>" +
        "<td>" + day.time + "</td>" +
        "<td><strong>" + day.close + "</strong></td>" +
        "<td>" + day.direction + "</td>" +
        "<td>" + day.test + "</td>" +
        "<td><strong>" + (earnedPips).toFixed() + "</strong></td>" +
        "<td><strong>" + (earnedPips * pipValue).toFixed(2) + "</strong></td>" +
        "</tr>"
        counter = counter + 1
    })
    return output
}

const readFile = async path => {
    try {
        const data = await fs.promises.readFile(path, 'utf8')
        var dataArray = data.split(/\r?\n/);
        dataArray.shift();
        return  formLines(dataArray)
    }
    catch(err) {
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
