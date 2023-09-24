import request from "supertest";
import { server } from "../src/lambdaFunctions/user-endpoints.js";

afterEach((done) => {
  server.close(done);
});

test("user health endpoint returns ok", async () => {
  const res = await request.agent(server).get("/users/health");
  expect(res.body).toEqual({ status: "ok" });
  expect(res.status).toBe(200);
});

// test("invalid api key for uploading readings", async () => {
//   const res = await request(app)
//     .post("/users/readings?apiKey=123")
//     .send([
//       {
//         reading: "AQ==",
//         timestamp: 1618934400000,
//       },
//     ]);
//   expect(res.status).toBe(401);
// });
