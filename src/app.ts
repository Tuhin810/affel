import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorMiddleware } from "./middleware/error.middleware";
import routes from "./routes";


const app = express();

app.use(express.json());

app.use(cors());

app.use(helmet());

app.use("/api/v1", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use(errorMiddleware);

export default app;