const request = require("supertest");
import { afterAll, describe, expect, test } from "@jest/globals";
import app from "../src/app";
import { appPool } from "../src/config/database";

afterAll(async () => { await appPool.end(); });

const booking = {
  checkIn: "2035-06-10",
  checkOut: "2035-06-13",
  rooms: [{ roomTypeId: 1, quantity: 1 }],
  adults: 1,
  children: 0,
  specialRequest: null
};

describe("Bookings API", () => {
  test("requires authentication to create and view bookings", async () => {
    await request(app).post("/bookings").send(booking).expect(401);
    await request(app).get("/bookings/me").expect(401);
  });

  test("rejects invalid availability input", async () => {
    await request(app)
      .post("/bookings/availability")
      .send({ ...booking, checkOut: booking.checkIn })
      .expect(400);
  });

  test("creates a booking and returns it for the authenticated user", async () => {
    const agent = request.agent(app);
    const email = `booking-test-${Date.now()}@example.com`;

    await agent
      .post("/auth/register")
      .send({
        firstName: "Booking",
        lastName: "Tester",
        email,
        password: "Password123!",
        phone: "6900000000"
      })
      .expect(201);

    const invalidRoomType = await agent
      .post("/bookings")
      .send({ ...booking, rooms: [{ roomTypeId: 999999, quantity: 1 }] })
      .expect(400);
    expect(invalidRoomType.body.code).toBe("INVALID_ROOM_TYPE");

    const created = await agent.post("/bookings").send(booking).expect(201);
    expect(created.body.bookingId).toEqual(expect.any(Number));

    const mine = await agent.get("/bookings/me").expect(200);
    expect(mine.body.bookings).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.body.bookingId })])
    );
  });
});
