const currencies = require("./currencies");

module.exports = {
    app: {
        port: 3000
    },

    fileName: {
        path: "/home/ray/Downloads/",
        prefix: "FX_",
        join: ",\ "
    },

    // year: {
    //     from: 2023,
    //     to: 2023
    // },

    // closingHour: 22,

    // // 1D 4H 1H
    // timeGap: "1D",

    mapper: currencies.mapper,

    // ALLWAYS FALSE FOR COMBINED !!!
    tp: true,
    sl: true,
    
    // Directly from TV files
    // 1 - every day
    // 2 - by year
    // 3 - read intermediate file
    read: {
        switch: 2,
       // everyDayCurrency: 9
    },

    // From data.json
    // 1 - single TP and SL and every day output
    // 2 - multiple TP and SL combinations
    // 3 - single TP and SL and every day output, ordinary tp and sl (takeProfits2())
    // 4 - multiple TP and SL combinations, ordinary tp and sl (takeProfits2())
    single: {
        switch: 3,

        currencyId: 9,

        tpSlInGBP: true,

        deductSpread: false,
        // in GBP
        spread: 2.8,

        singleTp: 58.8,
        singleSl: -500,

        // multipleTP: {
        //     start: 0,
        //     stop: 120,
        //     step: 10,
        // },
        // multipleSL: {
        //     start: -600,
        //     stop: -50,
        //     step: 50
        // },
        multipleTP: {
            start: 1,
            stop: 30,
            step: 1,
        },
        multipleSL: {
            start: -300,
            stop: -10,
            step: 10
        },
    },

    // From data.json
    // 1 - single tp
    // 2 - multiple tp
    combined: {
        switch: 1,

        tp: 100,
        sl: -100,

        multipleTP: {
            start: 10,
            stop: 50,
            step: 20
        },

        multipleSL: {
            start: -320,
            stop: -120,
            step: 20
        }
    }
}
