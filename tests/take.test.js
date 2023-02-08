import request from 'supertest'
import app from '../app.js'

const response = await request(app).get("/GBPCHF/1D/60/2023/2023/2.5/34/-30/take").send()


describe("GET /GBPCHF/1D/60/2023/2023/2.5/34/-30/take", () => {
  describe("take profit returns", () => {

    test("should respond with a json", () => {
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    }) 

    test("should respond with a 200 status code", () => {
      expect(response.statusCode).toBe(200)
    }) 

      


    test("not known", async () => {

      // console.log(response.body.dataWithProfits.arr[3])


      expect(1).toBe(1)
      //console.log(response)

      //expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })


    // test("response has userId", async () => {
    //   const response = await request(app).post("/users").send({
    //     username: "username",
    //     password: "password"
    //   })
    //   expect(response.body.userId).toBeDefined()
    // })
  })

//   describe("when the username and password is missing", () => {
//     test("should respond with a status code of 400", async () => {
//       const bodyData = [
//         {username: "username"},
//         {password: "password"},
//         {}
//       ]
//       for (const body of bodyData) {
//         const response = await request(app).post("/users").send(body)
//         expect(response.statusCode).toBe(400)
//       }
//     })
//   })

})