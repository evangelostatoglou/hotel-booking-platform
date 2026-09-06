const request = require("supertest");
import {
  describe,
  test,
  expect,
  afterAll
} from "@jest/globals";
import app from "../src/app";
import { appPool } from "../src/config/database";

afterAll(async () => {await appPool.end()});

const _email = `test-${Date.now()}@example.com`;
const _password = "Password123!";


describe("Registration API", () => {
  const email = `test-${Date.now()}@example.com`;
  const password = "Password123!";

  test("registers a valid user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        email,
        password,
        phone: "6900000000"
      })
      .expect(201);

    expect(response.body.user.email).toBe(email);
  });
});
