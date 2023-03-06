if (process.env.NODE_ENV === "test") {
    var envConf = await import('./config.test.js')
    var envCurrencies = await import('./currencies.test.js')
}
else {
    var envConf = await import('./config.prod.js')
    var envCurrencies = await import('./currencies.prod.js')
}

export default {
    app: {
        port: 3000
    },

    fileName: {
        prefix: "FX_",
        join: ",\ ",
        path: envConf.default.filePath
    },

    lowerTimeSplitKey: "[22:00:00]",
    secondaryLowerTimeSplitKey: "[21:00:00]",

    lowerTimeSteps: [
        { 
            step: 60,
            position: 3,
            key: "[02:00:00]",
            secondaryKey: "[01:00:00]"
        },
        {
            step: 120,
            position: 1,
            key: "[02:00:00]",
            secondaryKey: "[01:00:00]"
            
        },
        {
            step: 240,
            position: 0,
            key: "[02:00:00]",
            secondaryKey: "[01:00:00]"
        }

    ],

    tests: {
        enabled: true
    },

    extendedInfo: {
        enabled: true
    },

    mapper: envCurrencies.default.mapper,
}
