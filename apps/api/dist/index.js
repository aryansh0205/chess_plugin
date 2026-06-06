import express from "express";
const app = express();
const port = Number(process.env.PORT) || 5050;
app.use(express.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
});
app.listen(port, () => {
    console.log(`api listening on http://localhost:${port}`);
});
