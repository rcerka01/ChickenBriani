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

    mapper: currencies.mapper,
}
