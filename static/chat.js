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

  const userMessageDiv = document.createElement("div");
  userMessageDiv.textContent = "User: " + message;
  messagesDiv.appendChild(userMessageDiv);

  messageInput.value = "";

  getBotResponse();
}

async function getBotResponse() {
  const response = await fetch("/get-response");
  const data = await response.json();

  if (data.response) {
    const botMessageDiv = document.createElement("div");
    botMessageDiv.innerHTML = data.response;
    messagesDiv.appendChild(botMessageDiv);
  }
}

// Add event listener to send message when button is clicked
sendButton.addEventListener("click", sendMessage);

// Allow sending message via 'Enter' key
messageInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
