import conf from "../config/config.js"
import com from "./commonsController.js"
import fs from 'fs'

/*
 * Quick utility, transfer to number with decimal five
 */
function fix5(n) { return Number(n).toFixed(5) }

/*
 * Public
 */
const readFile = async (path, yearFrom, yearTo, isSimple, step) => {
    try {
        const data = await fs.promises.readFile(path, 'utf8')
        var dataArray = data.split(/\r?\n/);
        dataArray.shift();
        if (isSimple) return formLinesSimple(dataArray, yearFrom, yearTo, step)
        else return formLines(dataArray, yearFrom, yearTo, step)
    }
    catch (err) {
        console.log(err)
    }
}

/*
 * For lower time step
 */
function formLinesSimple(dataArray, yearFrom, yearTo, step) {
    var days = []

    dataArray.forEach( line => {
        // current line
        var lineArr = line.split(",") 

        var ts           = lineArr[0]
        var date         = com.convertDateFromUnixTimestamp(Number(ts), step)
        var time         = com.convertTimeFromUnixTimestamp(Number(ts), step)
        var currentClose = lineArr[4]
        var high         = lineArr[2]
        var low          = lineArr[3]

        if (com.dateToYear(date) >= yearFrom && com.dateToYear(date) <= yearTo) {
            days.push({ date, time, currentClose, high, low })
        }
    })

return { days }
}

/*
 * Main, 1D time step
 */
function formLines(dataArray, yearFrom, yearTo, step) {
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

            if (conf.tests.enabled) {
                test = fix5(purchase) + " - " + fix5(nextClose) + " = <strong>" + fix5(profit)  + "</strong> : " +
                    fix5(purchase) + " - " + fix5(nextMin) + " = <strong>" + fix5(maxProf) + "</strong> : " +
                    fix5(purchase) + " - " + fix5(nextMax) + " = <strong>" + fix5(minProf) + "</strong>"
            }

        } else if (directionFlag == "green") {
            profit  = nextClose - purchase
            maxProf = nextMax - purchase   
            minProf = nextMin - purchase

            if (conf.tests.enabled) {
                test = fix5(nextClose) + " - " + fix5(purchase) + " = <strong>" + fix5(profit)  + "</strong> : " +
                    fix5(nextMax) + " - " + fix5(purchase) + " = <strong>" + fix5(maxProf) + "</strong> : " +
                    fix5(nextMin) + " - " + fix5(purchase) + " = <strong>" + fix5(minProf) + "</strong>"
            }
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
        var convertedDate = com.convertDateFromUnixTimestamp(Number(ts), step)
        var convertedTime = com.convertTimeFromUnixTimestamp(Number(ts), step)
        var weekday       = com.getWeekdayFromUnixTimestamp(Number(ts), step)

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
true
/*
 * Public
 */
function takeProfits(data, lowerData, lowerStep, sp, tp, sl) {
    var currency  = data.currencyData
    var days      = data.days
    var lowerDays = lowerData.days

    // quick utils
    // todo move up at beggining
    function toGbp(val) { return com.toGbp(val, currency).toFixed(2) }
    function toPip(val) { return com.convertToPips(val, currency).toFixed(1) }
    function toTest(val) { return toPip(val) + "<strong>(" + toGbp(val) + ")</strong>" }

    // quick util function
    function gbp(val) { return com.toGbp(val, currency).toFixed(2) }

    var dailyProfit = 0
    var takenProfit = 0
    var maxProfit = 0
    var minProfit = 0
    var secondaryOpenSubtractor = 0
    var resultsArr = []
    var isOpen = true
    var openNext = false
    var closeNext = false
    var test = ""

    sp = com.gbpToChartValue(currency, sp)
    tp = com.gbpToChartValue(currency, tp)
    sl = com.gbpToChartValue(currency, sl)

    // inner 
    // create array of arrays for one day with lower timestep data
    function splitIntoDays(arr) {
        var result = []
        var subArr = []
        arr.forEach( val => {
            subArr.push(val)
            if (val.time == conf.lowerTimeSplitKey) { result.push(subArr); subArr = []; return }
            // summertime
            if (val.time == conf.secondaryLowerTimeSplitKey) { result.push(subArr); subArr = []; return }
        })
        return result
    }

    // get lowertimestep data
    var lowerDaysSplit = splitIntoDays(lowerDays)
     
    //
    // --- loop begins ---
    //
    days.forEach( (val, i) => {
        test = ""

        if (closeNext) isOpen = false
        if (openNext) isOpen = true
        closeNext = false
        openNext = false

        // dailies
        maxProfit = val.maxProf
        minProfit = val.minProf
        dailyProfit = val.profit

        // on second opening in same direction
        if (!isOpen && val.direction == val.directionFlag) {
            isOpen = true
            secondaryOpenSubtractor = days[i - 1].profit + secondaryOpenSubtractor
        }

        // set zero if trade was close before direction change
        if (i - 1 > 0 && !days[i - 1].isOpen && days[i - 1].directionFlag != val.directionFlag) { secondaryOpenSubtractor = 0 }

        // set takenProfit to zero or secondary open
        takenProfit = 0 
       
        //
        // --- join with data from lower time step ---
        //

        // is sl or tp happen first, or day is closed
        var slOrTp = "close"

        // look for tp or sl only if day is open
        if (isOpen) {

            // find key parameters to correctly split lower data array
            var keyParam = conf.lowerTimeSteps.find(p => p.step == lowerStep)

            // find lower data for the day
            var forTheDayArr = []
            if (i + 1 < days.length) {
                forTheDayArr = lowerDaysSplit.find(ld => ld[keyParam.position] !== void 0 && ld[keyParam.position].time == keyParam.key && ld[keyParam.position].date == days[i + 1].date)
                // for summertime
                if (forTheDayArr === void 0) {
                    forTheDayArr = lowerDaysSplit.find(ld => ld[keyParam.position] !== void 0 && ld[keyParam.position].time == keyParam.secondaryKey && ld[keyParam.position].date == days[i + 1].date)
                }
            }

            // if previous trade is open, but tp or sl is not riched. Get as last item of now generated results array
            var prevDayItem = resultsArr[resultsArr.length - 1]
            // if prev day was open and profit was not taken
            if (resultsArr.length > 0 && prevDayItem.takenProfit == 0) var previousProfit = prevDayItem.dailyProfit
            else {
                if (resultsArr.length > 0 && prevDayItem.isOpen && prevDayItem.directionFlag == val.directionFlag) { 
                    var previousProfit = prevDayItem.dailyProfit 
                }
                else { 
                    var previousProfit = 0 
                }
            }
            if (resultsArr.length > 0 && !prevDayItem.isOpen && prevDayItem.directionFlag != val.directionFlag) { 
                var previousProfit = 0 
            }

            // loop  to find tp or sl in lower step datas
            if (forTheDayArr !== undefined) {
                for (var ii = 0; ii < forTheDayArr.length; ii++) {
                    if (forTheDayArr[ii] !== void 0 && i > 0) {

                        // each step low and high
                        var high = Number(forTheDayArr[ii].high)
                        var low  = Number(forTheDayArr[ii].low)

                        // red green
                        if (val.directionFlag == "green") {
                            var highDiff    = high - Number(val.currentClose) + previousProfit - secondaryOpenSubtractor
                            var lowDiff     = low  - Number(val.currentClose) + previousProfit - secondaryOpenSubtractor

                        } else if (val.directionFlag == "red") {
                            var highDiff    = Number(val.currentClose) - low  + previousProfit - secondaryOpenSubtractor
                            var lowDiff     = Number(val.currentClose) - high + previousProfit - secondaryOpenSubtractor
                        }

                        // add tp and sl to takenProfit
                        if (highDiff >= tp) {
                            // output
                            slOrTp = "tp";

                            // test
                            if (conf.tests.enabled) {
                                var date    = forTheDayArr[ii].date
                                var time    = forTheDayArr[ii].time

                                if (val.directionFlag == "green") {
                                    test = date + " " + time + 
                                        "green: " + toTest(highDiff) + 
                                        " = (h:  " + Number(high).toFixed(5) + " - c: " + Number(val.currentClose).toFixed(5) + ") " + toTest(Number(Number(high).toFixed(5)) - Number(Number(val.currentClose).toFixed(5))) +
                                        " + pp: " + toTest(previousProfit) +
                                        " - ss: " + toTest(secondaryOpenSubtractor)


                                } else if (val.directionFlag == "red") {
                                    test = date + " " + time + 
                                        " red: "  + toTest(highDiff) + 
                                        " = (c: "  + Number(val.currentClose).toFixed(5) + " - l: " + Number(low).toFixed(5) + ") " + toTest(Number(Number(val.currentClose).toFixed(5)) - Number(Number(low).toFixed(5))) +
                                        " + pp: " + toTest(previousProfit) +
                                        " - ss: " + toTest(secondaryOpenSubtractor)
                                }
                            }     

                            // vip
                            closeNext = true
                            takenProfit = tp - sp
                            secondaryOpenSubtractor = 0
                            break; 
                        }

                        // add sl
                        if (lowDiff <= sl) {
                            // output
                            slOrTp      = "sl"; 

                            // test
                            if (conf.tests.enabled) {
                                var date    = forTheDayArr[ii].date
                                var time    = forTheDayArr[ii].time

                                if (val.directionFlag == "green") {
                                    test = date + " " + time + 
                                        "green: " + toTest(lowDiff) + 
                                        " = (h: "  + Number(low).toFixed(5) + " - c: " + Number(val.currentClose).toFixed(5) + ") " + toTest(Number(Number(low).toFixed(5)) - Number(Number(val.currentClose).toFixed(5))) +
                                        " + pp: " + toTest(previousProfit) +
                                        " - ss: " + toTest(secondaryOpenSubtractor)

                                } else if (val.directionFlag == "red") {
                                    test = date + " " + time + 
                                        " red: "  + toTest(lowDiff) + 
                                        " = (c: "  + Number(val.currentClose).toFixed(5) + " - l: " + Number(high).toFixed(5) + ") " + toTest(Number(Number(val.currentClose).toFixed(5)) - Number(Number(high).toFixed(5)))
                                        " + pp: " + toTest(previousProfit) +
                                        " - ss: " + toTest(secondaryOpenSubtractor)
                                }
                            }

                            // vip
                            closeNext = true
                            takenProfit = sl - sp
                            secondaryOpenSubtractor = 0
                            break;                        
                        }
                    }

                    // output
                    slOrTp = "far"
                    // test
                    if (conf.tests.enabled) {
                        test = "secondary open subtractor: " + toGbp(secondaryOpenSubtractor)
                    }
                }
            }
        // is open
        }

        // 
        // --- btake profit on dirction change ---
        //
        if (isOpen && i + 1 < days.length && days[i + 1].directionFlag != val.directionFlag && val.directionFlag.length > 0) {
            if ( ! closeNext) {
                if (val.profit - sp - secondaryOpenSubtractor < tp) {
                    if (conf.tests.enabled) {
                        test = test + " DIRECTION: " + gbp(val.profit) + " - " + gbp(sp) + " - " + gbp(secondaryOpenSubtractor) + " < " + gbp(tp)
                    }
                    takenProfit = val.profit - sp - secondaryOpenSubtractor
                } else {
                    if (conf.tests.enabled) {
                        test = test + " DIRECTION (TP): " + gbp(val.profit) + " - " + gbp(sp) + " - " + gbp(secondaryOpenSubtractor) + " < " + gbp(tp)
                    }
                    takenProfit = tp - sp;
                }
            } else {
                openNext = true
            }
            secondaryOpenSubtractor = 0
        }
        
        // fix all takenProfits to zero if close
        if (!isOpen) { takenProfit = 0 }

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
            slOrTp: slOrTp,
            lowerDate: date,
            lowerTime: time,
            test: test,
        })
    
    })

    return { arr: resultsArr, currencyData: currency }
}

/*
 * Public
 */
function profitsByYear(arr, from, to) {
    var result = []

    for (var i=from; i<=to; i++) {
        var yearlyArr = []
        var byYear = arr.filter(val => com.dateToYear(val.date) == i)
        for (var ii=1; ii<=12; ii++) {
            var byMonth = byYear.filter(val => com.dateToMonth(val.date) == ii)
            yearlyArr.push(com.arrSum(byMonth.map(val => val.takenProfit)))
        }
        result.push({ year: i, profits: yearlyArr, sum: com.arrSum(yearlyArr.filter(val => val != undefined)) })
    }

    return { result, arr }
}

/*
 * Public
 */
function countMaxNegativeSequence(arr) {
    var lowest = 0
    var temp = 0
    var date = []
    var dateTemp = []
    var tArr = []
    var counter = 0

    arr.forEach( val => {
        var tPr = val.takenProfit
        if (tPr < 0 ) { 
            temp = temp + tPr
            counter = counter + 1
            dateTemp.push(val.date)
        }
        else if (tPr > 0) { 
            if (lowest > temp) { 
                lowest = temp 
                date = dateTemp
                tArr[counter] = 1
            } else {
                if (tArr[counter] === undefined) tArr[counter] = 1
                else tArr[counter] = tArr[counter] + 1
            }
            temp = 0
            counter = 0
            dateTemp = []
         }
    })

    return { lowest, date, tArr }
}


/*
 * Public
 */
function countAvaregesAndPositives(data, tp, sl) {
    var positives = 0
    var total = 0
    var sums = []
    var monthlyProfits = []

    data.result.forEach( val => {
        sums.push(val.sum)

        monthlyProfits.push(val.profits)

        val.profits.forEach( prof => {
            if (prof != 0) total = total + 1
            if (prof > 0) positives = positives + 1
        })
    })

    monthlyProfits = monthlyProfits.flatMap(val => val)

    return { tp, sl, monthlyProfits, positives, total, sums, arrCountMinProfit: data.arr }
}

export default {
    readFile,
    takeProfits,
    profitsByYear,
    countAvaregesAndPositives,
    countMaxNegativeSequence
}
