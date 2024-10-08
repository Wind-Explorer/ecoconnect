const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./models");

// Routes
const usersRoute = require("./routes/users.js");

dotenv.config();

const app = express();
let PORT = process.env.APP_PORT;

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
  })
);

app.use(express.json());
app.use(bodyParser.json({ limit: "1000mb" }));
app.use(bodyParser.urlencoded({ limit: "1000mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to ecoconnect.");
});

app.use("/users", usersRoute);

const eventsRoute = require("./routes/events");
app.use("/events", eventsRoute);

const postRoute = require("./routes/post");
app.use("/post", postRoute);

const schedulesRoute = require("./routes/schedule");
app.use("/schedule", schedulesRoute);

const HBCformRoute = require("./routes/hbcform");
app.use("/hbcform", HBCformRoute);

const connections = require("./routes/connections");
app.use("/connections", connections);

const vouchers = require("./routes/vouchers");
app.use("/vouchers", vouchers);

const feedback = require("./routes/feedback.js");
app.use("/feedback", feedback);

const uservoucher = require("./routes/uservoucher.js");
app.use("/user-vouchers", uservoucher);

db.sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ecoconnect server running at http://0.0.0.0:${PORT}/`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
