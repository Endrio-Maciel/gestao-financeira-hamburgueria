import { buildApp } from "./app";
import { env } from "../env/env";

const app = buildApp();

app
  .listen({
    port: env.PORT,
    host: "RENDER" in process.env ? "0.0.0.0" : "localhost",
  })
  .then(() => {
    console.log(`Server running on port ${env.PORT}`);
  });
