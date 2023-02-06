import conf from "./config/config.js"
import app from "./app.js"

process.env.NODE_ENV = "prod"

app.listen(conf.app.port);
