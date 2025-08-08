import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { kafkaWrapper } from "../../kafka-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  return request(app)
    .post("/api/tickets")
    .send({
      title: "title",
      price: 20,
    })
    .expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = await global.signin();

  const response = await request(app).post("/api/tickets").set("Cookie", cookie).send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  const cookie = await global.signin();

  return request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = await global.signin();

  return request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "title",
      price: -20,
    })
    .expect(400);
});

it("returns a 201 on successful ticket creation", async () => {
  const cookie = await global.signin();

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = "title";

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual(title);
});

it("publishes an event", async () => {
  const cookie = await global.signin();

  const title = "title";

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title,
      price: 20,  
    })
    .expect(201);

  expect(kafkaWrapper.client.producer).toHaveBeenCalled();
});