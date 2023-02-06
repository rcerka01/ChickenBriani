import request from 'supertest'
import app from '../app.js'


describe("GET /", () => {
  describe("title page works", () => {

    test("should respond with a 200 status code", async () => {
      const response = await request(app).get("/").send()
      expect(response.statusCode).toBe(200)
    })
  })

})