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
function toGbp(val) { return Number(com.toGbp(val, currency).toFixed(2)) }

describe("GET /GBPCHF/1D/60/2023/2023/2.5/34/-30/take", () => {
  describe("take profit returns", () => {

    test("should respond with a json", () => {
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })

    // 200 ********************** //

    test("should respond with a 200 status code", () => {
      expect(response.statusCode).toBe(200)
    }) 

    // DIRECTION CHANGE ********************** //
    test("single day, green trade swap to red, no tp or sl", async () => {
      // todo
    })

    test("single day, red trade swap to green, no tp or sl", async () => {
      // todo
    })

    // SINGLE TP ********************** //

    test("single day, green trade, with maxProfit higher than tp", async () => {
      expect(data[3].date).toBe("[05/01/2023]")
      expect(data[3].direction).toBe("green")
      expect(data[3].directionFlag).toBe("green")
      expect(data[3].isOpen).toBe(true)
      expect(data[3].slOrTp).toBe("tp")
      expect(toGbp(data[3].maxProfit)).toBeGreaterThan(tp)
      expect(toGbp(data[3].takenProfit)).toBe(tp - spread)
      expect(data[3].lowerDate).toBe("[06/01/2023]")
      expect(data[3].lowerTime).toBe("[15:00:00]")
    })

    test("single day, red trade, with maxProfit higher than tp", async () => {
      expect(data[9].direction).toBe("red")
      expect(data[9].directionFlag).toBe("red")
      expect(data[9].isOpen).toBe(true)
      expect(data[9].slOrTp).toBe("tp")
      expect(toGbp(data[9].maxProfit)).toBeGreaterThan(tp)
      expect(data[9].lowerDate).toBe("[16/01/2023]")
      expect(data[9].lowerTime).toBe("[09:00:00]")
      expect(data[10].isOpen).toBe(false)
    })

    // SINGLE SL  ********************** //
    test("single day, green trade, with minProfit lower than sl", async () => {
      // todo
    })

    test("single day, red trade, with minProfit lower than sl", async () => {
      expect(data[4].date).toBe("[06/01/2023]")
      expect(data[4].direction).toBe("red")
      expect(data[4].directionFlag).toBe("red")
      expect(data[4].isOpen).toBe(true)
      expect(data[4].slOrTp).toBe("sl")
      expect(toGbp(data[4].minProfit)).toBeLessThan(sl)
      expect(toGbp(data[4].takenProfit)).toBe(sl - spread)
      expect(data[4].lowerDate).toBe("[09/01/2023]")
      expect(data[4].lowerTime).toBe("[05:00:00]")
    })

    // SINGLE SECONDARY TP ********************** //

    test("single day, green trade, with maxProfit greater than tp, secondary opening", async () => {
      expect(data[8].date).toBe("[12/01/2023]")
      expect(data[8].direction).toBe("green")
      expect(data[7].direction).toBe("")
      expect(data[8].directionFlag).toBe("green")
      expect(data[8].isOpen).toBe(true)
      expect(data[8].slOrTp).toBe("tp")
      expect(toGbp(data[8].maxProfit - data[7].dailyProfit)).toBeGreaterThan(tp)
      expect(toGbp(data[8].takenProfit)).toBe(tp - spread)
      expect(data[8].lowerDate).toBe("[13/01/2023]")
      expect(data[8].lowerTime).toBe("[06:00:00]")
    })

    test("single day, red trade, with maxProfit greater than tp, secondary opening", async () => {
      expect(data[8].date).toBe("[12/01/2023]")
      expect(data[8].direction).toBe("green")
      expect(data[7].direction).toBe("")
      expect(data[8].directionFlag).toBe("green")
      expect(data[8].isOpen).toBe(true)
      expect(data[8].slOrTp).toBe("tp")
      expect(toGbp(data[8].maxProfit - data[7].dailyProfit)).toBeGreaterThan(tp)
      expect(toGbp(data[8].takenProfit)).toBe(tp - spread)
      expect(data[8].lowerDate).toBe("[13/01/2023]")
      expect(data[8].lowerTime).toBe("[06:00:00]")
    })

    // SINGLE SECONDARY SL ********************** //
    test("single day, green trade, with minProfit less than sl, secondary opening", async () => {
      // todo
    })

    test("single day, red trade, with minProfit less than sl, secondary opening", async () => {
      expect(data[12].date).toBe("[18/01/2023]")
      expect(data[12].direction).toBe("red")
      expect(data[11].direction).toBe("")
      expect(data[12].directionFlag).toBe("red")
      expect(data[12].isOpen).toBe(true)
      expect(data[12].slOrTp).toBe("sl")
      expect(toGbp(data[12].minProfit - data[11].dailyProfit)).toBeLessThan(sl)
      expect(toGbp(data[12].takenProfit)).toBe(sl - spread)
      expect(data[12].lowerDate).toBe("[19/01/2023]")
      expect(data[12].lowerTime).toBe("[13:00:00]")
    })

    // MULTIPLE TP ********************** //

    test("double day, green trade, with maxProfit higher than tp on second day", async () => {
      expect(data[5].date).toBe("[09/01/2023]")
      expect(data[5].direction).toBe("green")
      expect(data[5].directionFlag).toBe("green")
      expect(data[5].isOpen).toBe(true)
      expect(data[5].slOrTp).toBe("far")
      expect(toGbp(data[5].maxProfit)).toBeLessThan(tp)
      expect(toGbp(data[5].takenProfit)).toBe(0)
      expect(data[5].lowerDate).toBe(undefined)
      expect(data[5].lowerTime).toBe(undefined)

      expect(data[6].date).toBe("[10/01/2023]")
      expect(data[6].direction).toBe("")
      expect(data[6].directionFlag).toBe("green")
      expect(data[6].isOpen).toBe(true)
      expect(data[6].slOrTp).toBe("tp")
      expect(toGbp(data[6].maxProfit)).toBeGreaterThan(tp)
      expect(toGbp(data[6].takenProfit)).toBe(tp - spread)
      expect(data[6].lowerDate).toBe("[11/01/2023]")
      expect(data[6].lowerTime).toBe("[13:00:00]")

      expect(data[7].isOpen).toBe(false)
    })


    test("double day, red trade, with maxProfit higher than tp on second day", async () => {
      expect(data[19].date).toBe("[27/01/2023]")
      expect(data[19].direction).toBe("red")
      expect(data[19].directionFlag).toBe("red")
      expect(data[19].isOpen).toBe(true)
      expect(data[19].slOrTp).toBe("far")
      expect(toGbp(data[19].maxProfit)).toBeLessThan(tp)
      expect(toGbp(data[19].takenProfit)).toBe(0)
      expect(data[19].lowerDate).toBe(undefined)
      expect(data[19].lowerTime).toBe(undefined)

      expect(data[20].date).toBe("[30/01/2023]")
      expect(data[20].direction).toBe("")
      expect(data[20].directionFlag).toBe("red")
      expect(data[20].isOpen).toBe(true)
      expect(data[20].slOrTp).toBe("tp")
      expect(toGbp(data[20].maxProfit)).toBeGreaterThan(tp)
      expect(toGbp(data[20].takenProfit)).toBe(tp - spread)
      expect(data[20].lowerDate).toBe("[31/01/2023]")
      expect(data[20].lowerTime).toBe("[14:00:00]")

      expect(data[7].isOpen).toBe(false)
    })

    // MULTIPLE SEQUENCED TP  ********************** //
    test("multiple day, green trade, with maxProfit greater than tp on third time in row", async () => {
      // todo
    })
    test("multiple day, red trade, with maxProfit greater than tp on third time in row", async () => {
      // todo
    })

    // MULTIPLE SEQUENCED SL  ********************** //
    test("multiple day, green trade, with minProfit less than sl on third time in row", async () => {
      // todo
    })
    test("multiple day, red trade, with minProfit less than sl on third time in row", async () => {
      // todo
    })
    
  })
})
