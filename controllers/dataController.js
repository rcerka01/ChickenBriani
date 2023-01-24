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
    var secondaryOpenSubtractor = 0
    var resultsArr = []
    var isOpen = true
    var openNext = false
    var closeNext = false

    sp = com.gbpToChartValue(currency, sp)
    tp = com.gbpToChartValue(currency, tp)
    sl = com.gbpToChartValue(currency, sl)

    days.forEach( (val, i) => {

        // todo ugly
        if (closeNext) isOpen = false
        if (openNext) isOpen = true
        closeNext = false
        openNext = false

        // on second opening in same direction
        if (!isOpen && val.direction == val.directionFlag) {
            isOpen = true
            secondaryOpenSubtractor = days[i - 1].profit + secondaryOpenSubtractor
        }
        takenProfit = 0 - secondaryOpenSubtractor

        // take profit on dirction change
        if (i + 1 < days.length && days[i + 1].directionFlag != val.directionFlag && val.directionFlag.length > 0) {
            if (isOpen) {
                if (val.profit - sp - secondaryOpenSubtractor < tp) { 
                    takenProfit = val.profit - sp - secondaryOpenSubtractor
                    secondaryOpenSubtractor = 0
                } else {
                    takenProfit = tp - sp;
                    secondaryOpenSubtractor = 0
                }
            } else {
                openNext = true
                secondaryOpenSubtractor = 0
            }
        }
        
        // if tp defind
        else if (tp != 0 && isOpen) {
            if (val.profit - sp - secondaryOpenSubtractor >= tp) {
                takenProfit = tp - sp
                closeNext = true
            }
        }

        // if sl defind
        else if (sl != 0 && isOpen) {
            if (val.profit - sp - secondaryOpenSubtractor <= sl) {
                takenProfit = sl - sp
                closeNext = true
            }
        }

        // dailies
        if (isOpen) maxProfit   = val.maxProf; else maxProfit = 0
        if (isOpen) minProfit   = val.minProf; else minProfit = 0
        dailyProfit = val.profit

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
            isOpen: isOpen,
        })
    
    })

    return { arr: resultsArr, currencyData: currency }
}

module.exports = {
    readFile,
    takeProfits
}
