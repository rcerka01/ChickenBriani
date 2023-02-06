import request from 'supertest'
import app from '../app.js'


describe("GET /GBPCHF/1D/2023/2023/raw", () => {
  describe("raw data return heartbeat", () => {

    test("should respond with a 200 status code", async () => {
      const response = await request(app).get("/GBPCHF/1D/2023/2023/raw").send()
      expect(response.statusCode).toBe(200)
    })
  })

})
