import request from 'supertest'
import app from '../app.js'
import com from "../controllers/commonsController.js"

const tp1 = 34
const sl1 = -30
const spread1 = 2.5
const response1 = await request(app).get("/GBPCHF/1D/60/2023/2023/" + spread1 + "/" + tp1 + "/" + sl1 + "/take").send()
const data1 =response1.body.dataWithProfits.arr
const currency1 =response1.body.dataWithProfits.currencyData

const tp2 = 34
const sl2 = -10
const spread2 = 2.5
const response2 = await request(app).get("/GBPCHF/1D/60/2023/2023/" + spread2 + "/" + tp2 + "/" + sl2 + "/take").send()
const data2 =response2.body.dataWithProfits.arr
const currency2 =response2.body.dataWithProfits.currencyData


// quick util
function toGbp(val) { return Number(com.toGbp(val, currency1).toFixed(2)) }

describe("GET /GBPCHF/1D/60/2023/2023/2.5/34/-30/take", () => {
  describe("take profit returns", () => {

    test("should respond with a json", () => {
      expect(response1.headers['content-type']).toEqual(expect.stringContaining("json"))
    })

    // 200 ********************** //

    test("should respond with a 200 status code", () => {
      expect(response1.statusCode).toBe(200)
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
      expect(data1[3].date).toBe("[05/01/2023]")
      expect(data1[3].direction).toBe("green")
      expect(data1[3].directionFlag).toBe("green")
      expect(data1[3].isOpen).toBe(true)
      expect(data1[3].slOrTp).toBe("tp")
      expect(toGbp(data1[3].maxProfit)).toBeGreaterThan(tp1)
      expect(toGbp(data1[3].takenProfit)).toBe(tp1 - spread1)
      expect(data1[3].lowerDate).toBe("[06/01/2023]")
      expect(data1[3].lowerTime).toBe("[15:00:00]")
    })

    test("single day, red trade, with maxProfit higher than tp", async () => {
      expect(data1[9].direction).toBe("red")
      expect(data1[9].directionFlag).toBe("red")
      expect(data1[9].isOpen).toBe(true)
      expect(data1[9].slOrTp).toBe("tp")
      expect(toGbp(data1[9].maxProfit)).toBeGreaterThan(tp1)
      expect(data1[9].lowerDate).toBe("[16/01/2023]")
      expect(data1[9].lowerTime).toBe("[09:00:00]")
      expect(data1[10].isOpen).toBe(false)
    })

    // SINGLE SL  ********************** //
    test("single day, green trade, with minProfit lower than sl", async () => {
      expect(data2[3].date).toBe("[05/01/2023]")
      expect(data2[3].direction).toBe("green")
      expect(data2[3].directionFlag).toBe("green")
      expect(data2[3].isOpen).toBe(true)
      expect(data2[3].slOrTp).toBe("sl")
      expect(toGbp(data2[3].minProfit)).toBeLessThan(sl2)
      expect(toGbp(data2[3].takenProfit)).toBe(sl2 - spread2)
      expect(data2[3].lowerDate).toBe("[06/01/2023]")
      expect(data2[3].lowerTime).toBe("[11:00:00]")
    })

    test("single day, red trade, with minProfit lower than sl", async () => {
      expect(data1[4].date).toBe("[06/01/2023]")
      expect(data1[4].direction).toBe("red")
      expect(data1[4].directionFlag).toBe("red")
      expect(data1[4].isOpen).toBe(true)
      expect(data1[4].slOrTp).toBe("sl")
      expect(toGbp(data1[4].minProfit)).toBeLessThan(sl1)
      expect(toGbp(data1[4].takenProfit)).toBe(sl1 - spread1)
      expect(data1[4].lowerDate).toBe("[09/01/2023]")
      expect(data1[4].lowerTime).toBe("[05:00:00]")
    })

    // SINGLE SECONDARY TP ********************** //

    test("single day, green trade, with maxProfit greater than tp, secondary opening", async () => {
      expect(data1[8].date).toBe("[12/01/2023]")
      expect(data1[8].direction).toBe("green")
      expect(data1[7].direction).toBe("")
      expect(data1[8].directionFlag).toBe("green")
      expect(data1[8].isOpen).toBe(true)
      expect(data1[8].slOrTp).toBe("tp")
      expect(toGbp(data1[8].maxProfit - data1[7].dailyProfit)).toBeGreaterThan(tp1)
      expect(toGbp(data1[8].takenProfit)).toBe(tp1 - spread1)
      expect(data1[8].lowerDate).toBe("[13/01/2023]")
      expect(data1[8].lowerTime).toBe("[06:00:00]")
    })

    test("single day, red trade, with maxProfit greater than tp, secondary opening", async () => {
      expect(data1[8].date).toBe("[12/01/2023]")
      expect(data1[8].direction).toBe("green")
      expect(data1[7].direction).toBe("")
      expect(data1[8].directionFlag).toBe("green")
      expect(data1[8].isOpen).toBe(true)
      expect(data1[8].slOrTp).toBe("tp")
      expect(toGbp(data1[8].maxProfit - data1[7].dailyProfit)).toBeGreaterThan(tp1)
      expect(toGbp(data1[8].takenProfit)).toBe(tp1 - spread1)
      expect(data1[8].lowerDate).toBe("[13/01/2023]")
      expect(data1[8].lowerTime).toBe("[06:00:00]")
    })

    // SINGLE SECONDARY SL ********************** //
    test("single day, green trade, with minProfit less than sl, secondary opening", async () => {
      // todo
    })

    test("single day, red trade, with minProfit less than sl, secondary opening", async () => {
      expect(data1[12].date).toBe("[18/01/2023]")
      expect(data1[12].direction).toBe("red")
      expect(data1[11].direction).toBe("")
      expect(data1[12].directionFlag).toBe("red")
      expect(data1[12].isOpen).toBe(true)
      expect(data1[12].slOrTp).toBe("sl")
      expect(toGbp(data1[12].minProfit - data1[11].dailyProfit)).toBeLessThan(sl1)
      expect(toGbp(data1[12].takenProfit)).toBe(sl1- spread1)
      expect(data1[12].lowerDate).toBe("[19/01/2023]")
      expect(data1[12].lowerTime).toBe("[13:00:00]")
    })

    // MULTIPLE TP ********************** //

    test("double day, green trade, with maxProfit higher than tp on second day", async () => {
      expect(data1[5].date).toBe("[09/01/2023]")
      expect(data1[5].direction).toBe("green")
      expect(data1[5].directionFlag).toBe("green")
      expect(data1[5].isOpen).toBe(true)
      expect(data1[5].slOrTp).toBe("far")
      expect(toGbp(data1[5].maxProfit)).toBeLessThan(tp1)
      expect(toGbp(data1[5].takenProfit)).toBe(0)
      expect(data1[5].lowerDate).toBe(undefined)
      expect(data1[5].lowerTime).toBe(undefined)

      expect(data1[6].date).toBe("[10/01/2023]")
      expect(data1[6].direction).toBe("")
      expect(data1[6].directionFlag).toBe("green")
      expect(data1[6].isOpen).toBe(true)
      expect(data1[6].slOrTp).toBe("tp")
      expect(toGbp(data1[6].maxProfit)).toBeGreaterThan(tp1)
      expect(toGbp(data1[6].takenProfit)).toBe(tp1 - spread1)
      expect(data1[6].lowerDate).toBe("[11/01/2023]")
      expect(data1[6].lowerTime).toBe("[13:00:00]")

      expect(data1[7].isOpen).toBe(false)
    })


    test("double day, red trade, with maxProfit higher than tp on second day", async () => {
      expect(data1[19].date).toBe("[27/01/2023]")
      expect(data1[19].direction).toBe("red")
      expect(data1[19].directionFlag).toBe("red")
      expect(data1[19].isOpen).toBe(true)
      expect(data1[19].slOrTp).toBe("far")
      expect(toGbp(data1[19].maxProfit)).toBeLessThan(tp1)
      expect(toGbp(data1[19].takenProfit)).toBe(0)
      expect(data1[19].lowerDate).toBe(undefined)
      expect(data1[19].lowerTime).toBe(undefined)

      expect(data1[20].date).toBe("[30/01/2023]")
      expect(data1[20].direction).toBe("")
      expect(data1[20].directionFlag).toBe("red")
      expect(data1[20].isOpen).toBe(true)
      expect(data1[20].slOrTp).toBe("tp")
      expect(toGbp(data1[20].maxProfit)).toBeGreaterThan(tp1)
      expect(toGbp(data1[20].takenProfit)).toBe(tp1 - spread1)
      expect(data1[20].lowerDate).toBe("[31/01/2023]")
      expect(data1[20].lowerTime).toBe("[14:00:00]")

      expect(data1[7].isOpen).toBe(false)
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
