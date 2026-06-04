import 'dotenv/config';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
    return c.json({
        message: 'Bun + Hono'
    });
});

export default {
    port: process.env.PORT!,
    fetch: app.fetch
};