import currencies from "./currencies.js"

if (process.env.NODE_ENV === "test") var envConf = await import('./config.test.js')
else var envConf = await import('./config.prod.js')

export default {
    app: {
        port: 3000
    },

    fileName: {
        prefix: "FX_",
        join: ",\ ",
        path: envConf.default.filePath
    },

    lowerTimeSplitKey: "[10:00:00 PM]",

    lowerTimeSteps: [
        { 
            step: 60,
            position: 3,
            key: "[2:00:00 AM]"
        },
        {
            step: 120,
            position: 1,
            key: "[2:00:00 AM]"
        },
        {
            step: 240,
            position: 0,
            key: "[2:00:00 AM]"
        }

    ],

    tests: {
        enabled: false
    },

    mapper: currencies.mapper,
}
