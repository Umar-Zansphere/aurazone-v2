import { buildServer } from "./server.js";
import { env } from "./config/env.js";

const start = async () => {
  const app = await buildServer();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`AuraZone V2 API running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();