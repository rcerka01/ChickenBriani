import request from 'supertest'
import app from '../app.js'
import com from "../controllers/commonsController.js"
import dataController from "../controllers/dataController.js"

const tp1 = 34
const sl1 = -30
const pair1 = "GBPCHF"
const spread1 = 2.5
const response1 = await request(app).get("/" + pair1 + "/1D/60/2023/2023/" + spread1 + "/" + tp1 + "/" + sl1 + "/take").send()
const data1 =response1.body.dataWithProfits.arr
const currency1 = response1.body.dataWithProfits.currencyData

const tp2 = 34
const sl2 = -10
const pair2 = "GBPCHF"
const spread2 = 2.5
const response2 = await request(app).get("/" + pair2 + "/1D/60/2023/2023/" + spread2 + "/" + tp2 + "/" + sl2 + "/take").send()
const data2 = response2.body.dataWithProfits.arr

const tp3 = 100
const sl3 = -100
const pair3 = "GBPCHF"
const spread3 = 2.5
const response3 = await request(app).get("/" + pair3 + "/1D/60/2023/2023/" + spread3 + "/" + tp3 + "/" + sl3 + "/take").send()
const data3 = response3.body.dataWithProfits.arr

const tp4 = 30
const sl4 = -30
const pair4 = "GBPCHF"
const spread4 = 2.5
const response4 = await request(app).get("/" + pair4 + "/1D/60/2021/2023/" + spread4 + "/" + tp4 + "/" + sl4 + "/take").send()
const data4byYear = response4.body.byYear
const data4profits = response4.body.dataWithProfits.arr

const tp5 = 100
const sl5 = -100
const pair5 = "EURUSD"
const spread5 = 2.5
const response5 = await request(app).get("/" + pair5 + "/1D/60/2021/2023/" + spread5 + "/" + tp5 + "/" + sl5 + "/take").send()
const data5 = response5.body.dataWithProfits.arr
const currency5 = response5.body.dataWithProfits.currencyData

// quick util GBPCHF
function toGbp(val) { return Number(com.toGbp(val, currency1).toFixed(2)) }
// quick util EURUSD
function toGbpE(val) { return Number(com.toGbp(val, currency5).toFixed(2)) }

describe("GET /{pair}/1D/60/2023/2023/2.5/{tp}/{sl}/take", () => {
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
      expect(data3[3].date).toBe("[05/01/2023]")
      expect(data3[3].direction).toBe("green")
      expect(data3[3].directionFlag).toBe("green")
      expect(data3[2].directionFlag).toBe("red")
      expect(data3[3].isOpen).toBe(true)
      expect(data3[3].slOrTp).toBe("far")
      expect(toGbp(data3[3].maxProfit)).toBeLessThan(tp3)
      expect(toGbp(data3[3].takenProfit)).toBe(63.76)
      expect(data3[3].lowerDate).toBe(undefined)
      expect(data3[3].lowerTime).toBe(undefined)    
    })

    test("single day, red trade swap to green, no tp or sl", async () => {
      expect(data3[4].date).toBe("[06/01/2023]")
      expect(data3[4].direction).toBe("red")
      expect(data3[4].directionFlag).toBe("red")
      expect(data3[3].directionFlag).toBe("green")
      expect(data3[4].isOpen).toBe(true)
      expect(data3[4].slOrTp).toBe("far")
      expect(toGbp(data3[4].maxProfit)).toBeLessThan(tp3)
      expect(toGbp(data3[4].takenProfit)).toBe(-2.94)
      expect(data3[4].lowerDate).toBe(undefined)
      expect(data3[4].lowerTime).toBe(undefined) 
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
      expect(data2[18].date).toBe("[26/01/2023]")
      expect(data2[18].direction).toBe("green")
      expect(data2[17].direction).toBe("")
      expect(data2[18].directionFlag).toBe("green")
      expect(data2[18].isOpen).toBe(true)
      expect(data2[18].slOrTp).toBe("sl")
      expect(toGbp(data2[18].minProfit - data1[18].dailyProfit)).toBeLessThan(sl2)
      expect(toGbp(data2[18].takenProfit)).toBe(sl2- spread2)
      expect(data2[18].lowerDate).toBe("[27/01/2023]")
      expect(data2[18].lowerTime).toBe("[08:00:00]")    
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
      expect(data5[88].date).toBe("[06/05/2021]")
      expect(data5[88].direction).toBe("")
      expect(data5[88].directionFlag).toBe("green")
      expect(data5[88].isOpen).toBe(true)
      expect(data5[88].slOrTp).toBe("tp")

      expect(toGbpE(data5[87].takenProfit)).toBe(0)

      expect(data5[89].isOpen).toBe(false)
      expect(data5[89].takenProfit).toBe(0)

      expect(toGbpE(data5[88].maxProfit - data5[74].dailyProfit)).toBeGreaterThan(tp5)
      expect(toGbpE(data5[88].takenProfit)).toBe(97.50)   
      expect(toGbpE(data5[88].takenProfit)).toBe(tp5 - spread5)
      

      expect(data5[88].lowerDate).toBe("[07/05/2021]")
      expect(data5[88].lowerTime).toBe("[16:00:00]")  
    })

    test("multiple day, red trade, with maxProfit greater than tp on third time in row", async () => {
      // todo
    })

    // MULTIPLE SEQUENCED SL  ********************** //
    test("multiple day, green trade, with minProfit less than sl on forth time in row", async () => {
      expect(data5[116].date).toBe("[15/06/2021]")
      expect(data5[116].direction).toBe("")
      expect(data5[116].directionFlag).toBe("green")
      expect(data5[116].isOpen).toBe(true)
      expect(data5[116].slOrTp).toBe("sl")

      expect(toGbpE(data5[115].takenProfit)).toBe(0)

      expect(data5[117].isOpen).toBe(false)
      expect(data5[117].takenProfit).toBe(0)

      expect(toGbpE(data5[116].minProfit - data5[94].dailyProfit)).toBeLessThan(sl5)
      expect(toGbpE(data5[116].takenProfit)).toBe(-102.50)   
      expect(toGbpE(data5[116].takenProfit)).toBe(sl5 - spread5)
  
      expect(toGbpE(data5[117].takenProfit)).toBe(0)

      expect(data5[116].lowerDate).toBe("[16/06/2021]")
      expect(data5[116].lowerTime).toBe("[19:00:00]") 
    })

    test("multiple day, red trade, with minProfit less than sl on third time in row", async () => {
      // todo
    })

    // BY YEAR AND BY MONTH  ********************** //
    test("by year counted correctly", async () => {
      var twentyTwentyTwo = dataController.countAvaregesAndPositives(data4byYear, tp4, sl4).sums.map(toGbp)[1]

      var profitsToTest = 
        Number(
          com.arrSum(
            data4profits
              .filter(val => com.dateToYear(val.date) == "2022")
              .map(val => toGbp(val.takenProfit))
          ).toFixed(2)
        )

        expect(twentyTwentyTwo).toBe(profitsToTest)
      //  expect(twentyTwentyTwo).toBe(180.85)
      })

    test("by month counted correctly", async () => {
      // 17 is 12 month 2021 plus June
      var twentyTwentyTwoJune = dataController.countAvaregesAndPositives(data4byYear, tp4, sl4).monthlyProfits.map(toGbp)[17]

      var profitsToTest = 
        Number(
          com.arrSum(
            data4profits
              .filter(val => com.dateToMonth(val.date) == "06" && com.dateToYear(val.date) == "2022")
              .map(val => toGbp(val.takenProfit))
          ).toFixed(2)
        )

        expect(profitsToTest).toBe(-62.5)
        expect(profitsToTest).toBe(twentyTwentyTwoJune)
      })

    // GENERAL CHANGES  ********************** //
    test("monthly or yearly totals changed in 2021 - 2023", async () => {
      var yearlyResult = dataController.countAvaregesAndPositives(data4byYear, tp4, sl4).sums.map(toGbp)
      var monthlyResult = dataController.countAvaregesAndPositives(data4byYear, tp4, sl4).monthlyProfits.map(toGbp)

      var yearly = [ -1035.39, 222.20, 145.49 ]

      var monthly = [
        -90,    -23.75, -2.5, -305.18,  16.94, -90,    -70.02, -127.6,    57.5, -33.29, -182.5, -185, 
        -32.63, 218.85,  -2.5,   -3.2,   -2.5,  -62.5, -362.5,   143.11,   85,    -2.5,   210,     33.57,  
         90.49,  55,     0,      0,       0,      0,     0,       0,      0,       0,      0,      0
      ]

      expect(yearlyResult).toStrictEqual(yearly)
      expect(monthlyResult).toStrictEqual(monthly)
    })

    // TESTS FROM SUSPICIOUS BEHAVIOR ********************** //
    test("previos profit must be preserved on sequential green opening when previous green not close", async () => {
      const response = await request(app).get("/EURUSD/1D/60/2021/2023/2.5/109/-15/take").send()
      const data = response.body.dataWithProfits.arr

      expect(data[20].date).toBe("[01/02/2021]")
      expect(data[20].direction).toBe("green")
      expect(data[20].directionFlag).toBe("green")
      expect(data[20].isOpen).toBe(true)
      expect(data[21].isOpen).toBe(false)
      expect(data[20].slOrTp).toBe("sl")
      expect(toGbpE(data[20].takenProfit)).toBe(-17.50)
      expect(data[20].lowerDate).toBe("[02/02/2021]")
      expect(data[20].lowerTime).toBe("[10:00:00]")
    })

  })
})
