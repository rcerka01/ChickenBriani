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

    mapper: currencies.mapper,
}
