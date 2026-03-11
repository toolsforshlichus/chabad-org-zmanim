# Browser Usage

::: warning
This library **does not work in the browser**. The Chabad.org API does not set CORS headers, so browsers will block requests made directly from client-side code.
:::

## Why It Doesn't Work

When you call `fetch()` from a browser to a different origin (like `chabad.org`), the browser sends a preflight CORS request. The Chabad.org API does not respond with the required `Access-Control-Allow-Origin` header, so the browser blocks the response.

This is a browser security restriction — it cannot be bypassed from client-side JavaScript.

## Workarounds

### 1. Proxy Through Your Own Server

Call this library from your backend and expose the data through your own API:

::: code-group

```ts [Next.js App Router]
// app/api/zmanim/route.ts
import { getZmanimByZip } from "chabad-org-zmanim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = Number(searchParams.get("zip") || "11213");

  const result = await getZmanimByZip(zip, new Date());
  return Response.json(result);
}
```

```ts [Express]
// server.ts
import express from "express";
import { getZmanimByZip } from "chabad-org-zmanim";

const app = express();

app.get("/api/zmanim", async (req, res) => {
  const zip = Number(req.query.zip) || 11213;
  const result = await getZmanimByZip(zip, new Date());
  res.json(result);
});

app.listen(3000);
```

```ts [Hono]
// src/index.ts
import { Hono } from "hono";
import { getZmanimByZip } from "chabad-org-zmanim";

const app = new Hono();

app.get("/api/zmanim", async (c) => {
  const zip = Number(c.req.query("zip") || "11213");
  const result = await getZmanimByZip(zip, new Date());
  return c.json(result);
});

export default app;
```

:::

### 2. Serverless Functions

Use a serverless function as a lightweight proxy:

::: code-group

```ts [Cloudflare Worker]
import { getZmanimByZip } from "chabad-org-zmanim";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const zip = Number(url.searchParams.get("zip") || "11213");

    const result = await getZmanimByZip(zip, new Date());

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
```

```ts [Vercel Edge Function]
// api/zmanim.ts
import { getZmanimByZip } from "chabad-org-zmanim";

export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = Number(searchParams.get("zip") || "11213");

  const result = await getZmanimByZip(zip, new Date());
  return Response.json(result);
}
```

:::

### 3. Build-Time / Static Generation

If you don't need real-time data, fetch zmanim at build time:

```ts
// In a static site generator or build script
import { getZmanimRange } from "chabad-org-zmanim";
import { writeFileSync } from "fs";

const result = await getZmanimRange(
  11213, 2,
  new Date("2025-03-01"),
  new Date("2025-03-31"),
);

writeFileSync("public/zmanim-march.json", JSON.stringify(result));
```

Then load the JSON file from your client-side code.
