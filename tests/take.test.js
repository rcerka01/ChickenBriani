import request from 'supertest'
import app from '../app.js'
import com from "../controllers/commonsController.js"

const tp = 34
const sl = -30
const spread = 2.5
const response = await request(app).get("/GBPCHF/1D/60/2023/2023/" + spread + "/" + tp + "/" + sl + "/take").send()
const data = response.body.dataWithProfits.arr
const currency = response.body.dataWithProfits.currencyData

// quick util
function toGbp(val) { return com.toGbp(val, currency) }

describe("GET /GBPCHF/1D/60/2023/2023/2.5/34/-30/take", () => {
  describe("take profit returns", () => {

    test("should respond with a json", () => {
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    }) 

    test("should respond with a 200 status code", () => {
      expect(response.statusCode).toBe(200)
    }) 

    //console.log(data[3])

    test("single day, green trade, with maxProfit higher than tp", async () => {
      expect(data[3].direction).toBe("green")
      expect(data[3].directionFlag).toBe("green")
      expect(data[3].isOpen).toBe(true)
      expect(data[3].slOrTp).toBe("tp")
      expect(toGbp(data[3].maxProfit)).toBeGreaterThan(tp)
      expect(data[3].lowerDate).toBe("[06/01/2023]")
      expect(data[3].lowerTime).toBe("[15:00:00]")
    })

  })
})
