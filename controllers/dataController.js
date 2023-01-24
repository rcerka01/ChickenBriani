const com = require("./commonsController");
const fs = require('fs');

/*
 * Quick utility, transfer to number with decimal five
 */
function fix5(n) { return Number(n).toFixed(5) }

/*
 * Public
 */
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

/*
 * 
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

        return { profit, date, time, weekday, currentClose, direction, directionFlag, test, maxProf, minProf }
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

/*
 * Public
 */
function takeProfits(data, sp, tp, sl) {
    var currency = data.currencyData
    var days     = data.days

    var dailyProfit = 0
    var takenProfit = 0
    var maxProfit = 0
    var minProfit = 0
    var resultsArr = []
    var isOpen = true

    days.forEach( (val, i) => {
        takenProfit = 0

        if (isOpen) dailyProfit = val.profit; else dailyProfit = 0
        if (isOpen) maxProfit = val.maxProf; else maxProfit = 0
        if (isOpen) minProfit = val.minProf; else minProfit = 0

        // take profit on dirction change
        if (isOpen) {
            if (days.length > i + 1 && days[i + 1].directionFlag != val.directionFlag) {
                takenProfit = val.profit
            }
        }

        resultsArr.push({
            date: val.date, 
            time: val.time,
            weekday: val.weekday,
            currentClose: fix5(val.currentClose),
            direction: val.direction,
            directionFlag: val.directionFlag,
            dailyProfit: dailyProfit,
            takenProfit: takenProfit,
            maxProfit: maxProfit,
            minProfit: minProfit,
            isOpen: isOpen
        })
    
    })

    return { arr: resultsArr, currencyData: currency }
}

// // use native tp and sl
// function takeProfitsPrev(arr, ci, tp, sl, currency) {
//     var resultsArr = []

//     var closeFlag = false
//     var midCloseFlag = true
//     var onePipValueInGbp = getOnePipValueGbp(currency)
//     var profitFix = 0

//     // deduct spread
//     if (conf.single.deductSpread)  {
//         var spreadToDeductInGbp = conf.single.spread
//         var spreadToDeductInPip = conf.single.spread / onePipValueInGbp * currency.pip
//     } else { 
//         var spreadToDeductInGbp = 0
//         var spreadToDeductInPip = 0
//     }

//     arr.forEach( (val, i) => {
//         var profit =  0

//         var tpInPips = tp / onePipValueInGbp * currency.pip
//         var slInPips = sl / onePipValueInGbp * currency.pip

//         // fix to add to profit if same direction signal appear
//         if (arr[i + 1] !== void 0 && 
//             val.directions[ci] == arr[i + 1].directions[ci] && 
//             val.directions[ci] == val.signals[ci] &&
//             closeFlag &&
//             !midCloseFlag) 
//                 { profitFix = val.profits[ci] }

//         // sl
//         if (conf.sl && !closeFlag && val.maxLoses[ci] <= slInPips) { closeFlag = true; profit = slInPips - spreadToDeductInPip; profitFix = 0  } 
//         // tp
//         if (conf.tp && !midCloseFlag && val.maxProfits[ci] >= tpInPips) { midCloseFlag = true; profit = tpInPips - spreadToDeductInPip; profitFix = 0 } 
//         if (conf.tp && !closeFlag && val.maxProfits[ci] >= tpInPips) { closeFlag = true; profit = tpInPips - spreadToDeductInPip; profitFix = 0 }
//         // norm
//         if      (arr[i + 1] !== void 0 && val.directions[ci] != arr[i + 1].directions[ci] && (!closeFlag || !midCloseFlag)) { profit = val.profits[ci] + profitFix - spreadToDeductInPip; profitFix = 0 }
//         else if (arr[i + 1] !== void 0 && val.directions[ci] != arr[i + 1].directions[ci])               { closeFlag = false; }

//         if (val.signals[ci] !== null && val.signals[ci] !== void 0 && val.signals[ci].length > 0) { midCloseFlag = false; }

//         resultsArr.push(
//             {
//                 date: val.date, 
//                 shotrTime: val.shotrTime,
//                 profitDaily: val.profits[ci],
//                 profitMax: val.maxProfits[ci],
//                 loseMax: val.maxLoses[ci],
//                 profit: profit, 
//                 direction: val.directions[ci],
//                 signal: val.signals[ci], 
//                 close: closeFlag,
//                 midClose: midCloseFlag
//             })
        
//     });  

//     return resultsArr
// }

module.exports = {
    readFile,
    takeProfits
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
