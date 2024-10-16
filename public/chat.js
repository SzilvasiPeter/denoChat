const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

async function sendMessage() {
  const message = messageInput.value;
  if (!message) return;

  await fetch("/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  appendMessage(message);
  messageInput.value = "";

  const response = await fetch("/get-response").then((resp) => resp.json());
  if (!response.message) return;

  appendMessage(response.message);
}

function appendMessage(content) {
  const message = document.createElement("div");
  message.innerHTML = content;
  messagesDiv.appendChild(message);
}

// Add event listener when sending message
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
