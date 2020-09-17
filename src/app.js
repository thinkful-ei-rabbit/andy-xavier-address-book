require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const addresses = require("./addresses");
const { v4: uuid } = require("uuid");

const app = express();
const addressBook = addresses;

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/address", (req, res) => {
  return res.json(addresses);
});

app.post("/address", express.json(), (req, res) => {
  const { firstName, lastName, address1, city, state, zip } = req.body;
  const id = uuid();
  const newAddress = {
    id: id,
    firstName: firstName,
    lastName: lastName,
    address1: address1,
    city: city,
    state: state,
    zip: zip,
  };

  // All are required, check if they were sent
  if (!firstName) {
    return res.status(400).send("firstName required");
  }

  if (!lastName) {
    return res.status(400).send("lastName required");
  }

  if (!address1) {
    return res.status(400).send("address1 required");
  }

  if (!city) {
    return res.status(400).send("city required");
  }

  if (!state || state.length !== 2) {
    return res.status(400).send("state required");
  }

  if (!zip || zip.length !== 5) {
    return res.status(400).send("zip required");
  }

  addressBook.push(newAddress);
  res.status(201).location(`http://localhost:8000/user/${id}`).json(newAddress);
});

app.delete(`/address/:userId`, (req, res) => {
  const { userId } = req.params;

  const index = addresses.findIndex(u => u.id === userId);

  // make sure we actually find a user with that id
  if (index === -1) {
    return res
      .status(404)
      .send('User not found');
  }

  addresses.splice(index, 1);

  res.send('Deleted');
})

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
