// used in formLines function
// 86400000 one day in milliseconds, needed because of Team Wiever error
function convertDateFromUnixTimestamp(unixTimestamp, addDays) {
    var date = new Date(unixTimestamp * 1000 + 86400000 * addDays);
    return "[" + date.toLocaleDateString("en-UK") + "]"
}
      
function convertTimeFromUnixTimestamp(unixTimestamp, addDays) {
    var date = new Date(unixTimestamp * 1000 + 86400000 * addDays);
    return "[" + date.toLocaleTimeString("en-UK") + "]"
}

function dateToYear(date) {
    return date.split("/")[2].slice(0, -1)
}

function dateToMonth(date) {
    return date.split("/")[0].substring(1)
}

function getWeekdayFromUnixTimestamp(unixTimestamp, addDays) {
    var date = new Date(unixTimestamp * 1000 + 86400000 * addDays);
    var weekdays = ["Su","Mo","Tu","We","Th","Fr","Sa",]
    return weekdays[date.getDay()]
}

// used in rawOutput
function getMarginGbp(currency) {
    return currency.lot / currency.leverage * currency.value * currency.marginToGBP
}

function getOnePipValueGbp(currency) {
    return currency.lot * currency.value * currency.pip * currency.pipToGBP
}

function gbpToChartValue(currency, gbp) {
    return gbp / currency.pipToGBP / currency.value / currency.lot
}

// used in outputProfitsByYear
function convertToPips(val, currency) {
    return val / currency.pip
}

function toGbp(val, currency) {
    return convertToPips(val, currency) * getOnePipValueGbp(currency)
}

// used in profitsByYear
function arrSum(val) {
    if (val.length > 0) {
        return val.reduce((a, b) => Number(a) + Number(b))
    } else return 0
}

export default {
    getWeekdayFromUnixTimestamp,
    gbpToChartValue,
    arrSum,
    dateToYear,
    dateToMonth,
    getMarginGbp,
    convertToPips,
    getOnePipValueGbp,
    convertDateFromUnixTimestamp,
    convertTimeFromUnixTimestamp,
    toGbp
}
