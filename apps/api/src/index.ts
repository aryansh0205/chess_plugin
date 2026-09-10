import "./loadEnv.js";
import app, { warmDb } from "./app.js";

const port = Number(process.env.PORT) || 5020;

async function start() {
  const dbOk = await warmDb();
  if (!dbOk) {
    console.warn("[api] Server will start; /api/auth/* returns 503 until MongoDB connects.");
  }
  app.listen(port, () => {
    console.log(`api listening on http://localhost:${port}`);
  });
}

void start();
