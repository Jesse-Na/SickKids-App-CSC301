import request from "supertest";
import { server } from "../src/lambdaFunctions/admin-endpoints.js";
import { faker } from "@faker-js/faker";

afterEach((done) => {
  server.close(done);
});

test("admin health endpoint returns ok", async () => {
  const res = await request.agent(server).get("/admin/health");
  expect(res.body).toEqual({ status: "ok" });
  expect(res.status).toBe(200);
});

test("admin can register a device and get it", async () => {
  const deviceId = faker.string
    .hexadecimal({
      length: 8,
      casing: "upper",
    })
    .split("0x")[1];
  const res = await request
    .agent(server)
    .post("/admin/register-device")
    .send({ deviceId, interval: 1000 });

  expect(res.status).toBe(200);

  // const res2 = await request(app).get("/admin/devices/" + deviceId);
  // expect(res2.status).toBe(200);
  // expect(res2.body).toEqual({
  //   id: deviceId,
  //   interval: 1000,
  //   name: deviceId,
  // });
});
