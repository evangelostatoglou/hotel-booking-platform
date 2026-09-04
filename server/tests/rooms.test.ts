const request = require("supertest");
import app from "../src/app";
import { appPool } from "../src/config/database";

afterAll(async () => {await appPool.end()});

describe("Rooms API", () => {


  test("GET /rooms returns 200", async () => {
    await request(app).get("/rooms").expect(200);
  });

  test("GET /rooms returns an array inside result", async () => {
    const response = await request(app).get("/rooms").expect(200);

    expect(Array.isArray(response.body.result)).toBe(true);
  });

  test("GET /rooms returns room information", async () => {
    const response = await request(app).get("/rooms").expect(200);

    expect(response.body.result[0]).toHaveProperty("id");
    expect(response.body.result[0]).toHaveProperty("name");
    expect(response.body.result[0]).toHaveProperty("slug");
    expect(response.body.result[0]).toHaveProperty("price");
    expect(response.body.result[0]).toHaveProperty("imageUrl");
  });

  test("GET /rooms/:slug returns one room type", async () => {
    const response = await request(app).get("/rooms/suite").expect(200);

    expect(response.body.result.name).toBe("Suite");
  });

  test("room slug is case-insensitive", async () => {
    await request(app).get("/rooms/SUITE").expect(200);
  });

  test("unknown room slug returns 404", async () => {
    await request(app).get("/rooms/unknown-room").expect(404);
  });

  test("room details include amenities", async () => {
    const response = await request(app).get("/rooms/suite").expect(200);

    expect(Array.isArray(response.body.result.amenities)).toBe(true);
  });

  test("room details include all image URLs", async () => {
    const response = await request(app).get("/rooms/suite").expect(200);

    expect(Array.isArray(response.body.result.imageUrls)).toBe(true);
  });
});