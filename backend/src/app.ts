import express from "express";
import path from "path";
import cors from "cors";
import routes from "./routes/index.js";
import logger from "./logger/logger.js";


const app = express();

app.use(cors());
app.use(logger);
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.render("index", { title: "GullyCricks API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

export default app;
