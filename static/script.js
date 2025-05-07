// SAHPAATHI - Enhanced JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const logo = document.querySelector('.logo');

    // Set initial focus on input
    userInput.focus();

    // Initialize theme from localStorage
    initTheme();

    // Add pulse animation to the new chat button for attention
    newChatButton.classList.add('pulse');
    setTimeout(() => {
        newChatButton.classList.remove('pulse');
    }, 2000);

    // Event Listeners
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', handleEnterKey);
    themeToggle.addEventListener('click', toggleTheme);
    newChatButton.addEventListener('click', startNewChat);
    logo.addEventListener('click', redirectToHome);

    // Auto-adjust input height
    userInput.addEventListener('input', adjustInputHeight);

    // Initialize - fetch chat history if available
    loadChatHistory();

    // Functions

    // Handle sending message
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    }

    // Handle Enter key in input
    function handleEnterKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    // Initialize theme
    function initTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Toggle between light and dark theme with animation
    function toggleTheme() {
        themeToggle.classList.add('theme-toggle-active');
        
        // Add theme transition class for fade effect
        body.classList.add('theme-transition');
        
        // Toggle theme
        body.classList.toggle('dark-theme');
        
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Fixed missing quote
        }
        
        // Remove transition class after animation completes
        setTimeout(() => {
            body.classList.remove('theme-transition');
            themeToggle.classList.remove('theme-toggle-active');
        }, 300);
    }

    // Start a new chat with animation
    function startNewChat() {
        // Add animation to button
        newChatButton.classList.add('animate__animated', 'animate__rubberBand');
        
        setTimeout(() => {
            newChatButton.classList.remove('animate__animated', 'animate__rubberBand');
        }, 800);

        // Immediately clear chat UI for better UX
        clearChatUI();

        // Clear chat history on server
        fetch('/api/clear', {
            method: 'POST'
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage("Couldn't clear chat history on server, but your chat is reset.");
        });
    }

    // Redirect to home/refresh
    function redirectToHome() {
        logo.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    }

    // Clear chat UI and show welcome message
    function clearChatUI() {
        // Remove all messages
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
        
        // Add welcome message with animation
        const welcomeDiv = document.createElement('div');
        welcomeDiv.classList.add('welcome-message', 'animate__animated', 'animate__fadeIn');
        welcomeDiv.innerHTML = '<h2>Welcome to SAHPAATHI</h2><p>Ask me anything about your studies!</p>';
        chatMessages.appendChild(welcomeDiv);
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        userInput.focus();
    }

    // Auto-adjust input height
    function adjustInputHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    // Send message to API and handle response
    async function sendMessage(message) {
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input field and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        userInput.focus();
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        try {
            // Send message to API - Fixed parameter name to match backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: message }), // Using 'prompt' to match backend
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            // Add AI response to chat with a small delay for natural feel
            setTimeout(() => {
                addMessageToChat('ai', data.response);
            }, 300);
            
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator(typingIndicator);
            
            // Try with alternative parameter name if first attempt failed
            try {
                const altResponse = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message }), // Using 'message' as fallback
                });
                
                if (!altResponse.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const altData = await altResponse.json();
                addMessageToChat('ai', altData.response);
                
            } catch (altError) {
                console.error('Alternative method also failed:', altError);
                showErrorMessage("Sorry, I couldn't process your request. Please try again.");
            }
        }
    }

    // Show typing indicator while waiting for AI response
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator', 'animate__animated', 'animate__fadeIn');
        
        const dotsDiv = document.createElement('div');
        dotsDiv.classList.add('typing-dots');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dotsDiv.appendChild(dot);
        }
        
        typingDiv.appendChild(dotsDiv);
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
        
        return typingDiv;
    }

    // Remove typing indicator
    function removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode === chatMessages) {
            indicator.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                if (indicator.parentNode === chatMessages) {
                    chatMessages.removeChild(indicator);
                }
            }, 300);
        }
    }

    // Add message to chat with animation
    function addMessageToChat(role, content) {
        // Remove welcome message if it exists
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                if (welcomeMessage.parentNode === chatMessages) {
                    chatMessages.removeChild(welcomeMessage);
                }
            }, 300);
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'ai-message');
        messageDiv.classList.add('animate__animated', 'animate__fadeInUp');

        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        // Process content based on role
        if (role === 'ai') {
            contentDiv.innerHTML = formatAIResponse(content);
        } else {
            contentDiv.textContent = content;
        }

        // Append content to message
        messageDiv.appendChild(contentDiv);
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.classList.add('message-timestamp');
        timestamp.textContent = getCurrentTime();
        messageDiv.appendChild(timestamp);
        
        // Add to chat
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        scrollToBottom();
    }

    // Show error message
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('message', 'ai-message', 'error-message', 'animate__animated', 'animate__shakeX');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        errorDiv.appendChild(contentDiv);
        chatMessages.appendChild(errorDiv);
        
        scrollToBottom();
    }

    // Format AI response with Markdown-like formatting
    function formatAIResponse(text) {
        if (!text) return "Sorry, I couldn't generate a response.";
        
        // Handle code blocks
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Handle inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle bold text
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic text
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Handle links
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Handle line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    // Get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes} ${ampm}`;
    }

    // Scroll chat to bottom smoothly
    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Load chat history
    function loadChatHistory() {
        fetch('/api/history')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data.history && data.history.length > 0) {
                    // Remove welcome message if chat history exists
                    const welcomeMessage = document.querySelector('.welcome-message');
                    if (welcomeMessage && welcomeMessage.parentNode === chatMessages) {
                        chatMessages.removeChild(welcomeMessage);
                    }
                    
                    // Add messages to chat with staggered animation
                    data.history.forEach((item, index) => {
                        setTimeout(() => {
                            const role = item.role === 'assistant' ? 'ai' : 'user';
                            const content = item.content;
                            addMessageToChat(role, content);
                        }, index * 200); // Stagger the appearance
                    });
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
                // Don't show error message for history loading - not critical
            });
    }
});