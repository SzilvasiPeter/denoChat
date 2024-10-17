import { AzureOpenAI } from "openai";
import { marked } from "marked";

import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

// Store and answer based on the most recent message
let lastMessage = "";

app.post("/send-message", async (context) => {
  lastMessage = await context.req.json().then((res) => res.message);
  return context.json({ success: true });
});

app.get("/get-response", async (context) => {
  if (!lastMessage) return context.json({ message: "" });

  const openai = new AzureOpenAI({
    endpoint: Deno.env.get("AZURE_ENDPOINT"),
    apiKey: Deno.env.get("AZURE_APIKEY"),
    apiVersion: "2024-06-01",
  });

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: lastMessage }],
  });

  lastMessage = "";

  const message = result.choices[0].message.content;
  const markdownMessage = message != null ? message : "I can't answer.";
  const renderedMessage = marked.parse(markdownMessage);
  return context.json({ message: renderedMessage });
});

app.use("/public/*", serveStatic({ root: "./" }));
app.get("/", (context) => context.redirect("/public/index.html"));

Deno.serve({ port: 8080 }, app.fetch);
