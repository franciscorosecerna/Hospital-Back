import 'dotenv/config';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
    return c.json({
        message: 'Bun + Hono'
    });
});

app.get("/health", (c) => {
    return c.json({
        status: "ok",
        instance: process.env.INSTANCE_NAME
    });
});

export default {
    port: Number(process.env.PORT!),
    hostname: "0.0.0.0",
    fetch: app.fetch
};