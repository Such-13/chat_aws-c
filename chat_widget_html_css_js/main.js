// Elements
const chatButton = document.getElementById('chat-button');
const chatPage = document.getElementById('chat-page');
const closeChatButton = document.getElementById('close-chat');
const sendMessageButton = document.getElementById('send-message');
const chatInputField = document.getElementById('chat-input-field');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const messagesEnd = document.getElementById('messages-end');

// State Variables
let isChatOpen = false;
let messages = [];
let isTyping = false;
let websocket = null;

// Function to open the chat
function openChat() {
    isChatOpen = true;
    chatPage.classList.add('open');
    chatButton.style.display = 'none';
    initializeWebSocket();
}

// Function to close the chat
function closeChat() {
    isChatOpen = false;
    chatPage.classList.remove('open');
    chatButton.style.display = 'flex';
    if (websocket) {
        websocket.close();
        websocket = null;
    }
    clearMessages();
}

// Function to initialize WebSocket connection
function initializeWebSocket() {
    if (!websocket) {
        websocket = new WebSocket('ws://localhost:8000/webhooks');

        websocket.onopen = () => {
            console.log('WebSocket connected');
        };

        websocket.onmessage = (event) => {
            const message = event.data;
            addMessage({ text: message, sender: 'bot' });
            isTyping = false;
            updateTypingIndicator();
        };

        websocket.onclose = () => {
            console.log('WebSocket closed');
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
}

// Function to send a message
function sendMessage() {
    const text = chatInputField.value.trim();
    if (text !== '') {
        const userMessage = { text: text, sender: 'user' };
        addMessage(userMessage);
        chatInputField.value = '';
        isTyping = true;
        updateTypingIndicator();
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ text: text }));
        } else {
            console.error('WebSocket is not open.');
        }
    }
}

// Function to add a message to the chat
function addMessage(message) {
    messages.push(message);
    renderMessages();
}

// Function to render messages
function renderMessages() {
    // Clear existing messages except typing indicator
    chatMessages.innerHTML = '';

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', message.sender);
        messageDiv.textContent = message.text;
        chatMessages.appendChild(messageDiv);
    });

    // Add typing indicator if applicable
    if (isTyping) {
        typingIndicator.style.display = 'flex';
        chatMessages.appendChild(typingIndicator);
    } else {
        typingIndicator.style.display = 'none';
    }

    // Ensure messagesEnd is always at the end
    chatMessages.appendChild(messagesEnd);

    // Scroll to the bottom using the new method
    scrollToBottom();
}

// Function to clear messages
function clearMessages() {
    messages = [];
    renderMessages();
}

// Function to handle typing indicator
function updateTypingIndicator() {
    renderMessages();
}

// Function to scroll to the bottom of chat
function scrollToBottom() {
    // Using scrollTop and scrollHeight for reliable scrolling
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event Listeners
chatButton.addEventListener('click', openChat);
closeChatButton.addEventListener('click', closeChat);
sendMessageButton.addEventListener('click', sendMessage);
chatInputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Initialize chat page as closed
closeChat();