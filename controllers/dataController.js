const com = require("./commonsController");
const fs = require('fs');

// Quick utility, transfer to number with decimal five
function fix5(n) { return Number(n).toFixed(5) }

// public
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

module.exports = {
    readFile
}




    //     switch (conf.read.switch) {
    //         case 1:
    //             var output = rawOutput(data.map(val => val.days)[0], currency)
    //         break
    //         case 2:
    //             formatMultipleFileTable(data.map(val => val.sums), currencies)
    //         break
    //         case 3: 
    //             com.saveJson(transfearDaysArr(data.map(val => val.days), currencies))
    //             var output = "OK"
    //         break
    //     }

    //     return output
    // }
