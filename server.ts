import { AzureOpenAI } from "openai";
import { marked } from "marked";

import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

// Simple in-memory storage for messages
let lastMessage = "";

app.post("/send-message", async (context) => {
  const body = await context.req.json();
  const userMessage = body.message;

  lastMessage = userMessage;

  return context.json({ success: true, message: "Message received!" });
});

app.get("/get-response", async (context) => {
  if (lastMessage) {
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
    const renderedMessage = marked.parse(`Bot: ${markdownMessage}`);

    lastMessage = "";

    return context.json({ response: renderedMessage });
  }

  return context.json({ response: "" });
});

// Serve static files (JavaScript, HTML, CSS)
app.use("/static/*", serveStatic({ root: "./" }));
app.get("/", (c) => c.redirect("/static/index.html"));

Deno.serve({ port: 8080 }, app.fetch);
