import { AzureOpenAI } from "openai";
import { marked } from "marked";

import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

// Simple in-memory storage for messages
let lastMessage = "";

app.post("/send-message", async (ctx) => {
  lastMessage = await ctx.req.json().then((res) => res.message);

  return ctx.json({ success: true });
});

app.get("/get-response", async (ctx) => {
  if (!lastMessage) return ctx.json({ message: "" });

  const openai = new AzureOpenAI({
    endpoint: Deno.env.get("AZURE_ENDPOINT"),
    apiKey: Deno.env.get("AZURE_APIKEY"),
    apiVersion: "2024-06-01",
  });

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: lastMessage }],
  });

  const message = result.choices[0].message.content;
  const markdownMessage = message != null ? message : "I can't answer.";
  const renderedMessage = marked.parse(markdownMessage);

  lastMessage = "";

  return ctx.json({ message: renderedMessage });
});

// Serve static files (JavaScript, HTML, CSS)
app.use("/public/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.redirect("/public/index.html"));

Deno.serve({ port: 8080 }, app.fetch);
