// SAHPAATHI - Main JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatContainer = document.getElementById('chat-container');
    const newChatButton = document.getElementById('new-chat-button');
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    let isFirstMessage = true;

    // Set initial centered layout
    chatContainer.classList.add('centered-layout');

    // Initialize theme from localStorage with smoother transition
    if (localStorage.getItem('theme') === 'dark') {
        // Add a small delay to prevent flash during page load
        setTimeout(() => {
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            // Force correct input background after theme is applied
            updateInputBackground();
        }, 50);
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        // Ensure correct initial background
        updateInputBackground();
    }

    // Enhanced theme toggle functionality with visual feedback
    themeToggle.addEventListener('click', function() {
        // Add animation class
        themeToggle.classList.add('theme-toggle-active');
        
        // Toggle theme after slight delay for better visual effect
        setTimeout(() => {
            body.classList.toggle('dark-theme');
            
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
            
            // Force correct input background color after theme change
            updateInputBackground();
        }, 150);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            themeToggle.classList.remove('theme-toggle-active');
        }, 300);
    });
    
    // Improved function for input field background transparency issues
    function updateInputBackground() {
        // Get the computed background color from CSS variables
        let computedStyle = getComputedStyle(document.documentElement);
        let bgColor = computedStyle.getPropertyValue('--input-bg').trim();
        
        // If the background color is still transparent, use a fallback
        if (bgColor.includes('rgba') && bgColor.split(',')[3].includes('0')) {
            bgColor = body.classList.contains('dark-theme') ? '#293548' : '#ffffff';
        }
        
        // Force the background color with !important through style attribute
        userInput.style.backgroundColor = bgColor;
        userInput.style.setProperty('background-color', bgColor, 'important');
        
        // Adjust text color to match the theme
        let textColor = computedStyle.getPropertyValue('--input-text').trim();
        userInput.style.color = textColor;
        
        // Ensure border color is visible
        let borderColor = computedStyle.getPropertyValue('--border-color').trim();
        userInput.style.borderColor = borderColor;
    }
    
    // Update input background on various events
    userInput.addEventListener('focus', updateInputBackground);
    userInput.addEventListener('input', updateInputBackground);
    userInput.addEventListener('blur', updateInputBackground);
    
    // Call updateInputBackground on theme change
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateInputBackground);
    
    // Initialize input background on page load
    setTimeout(updateInputBackground, 100);

    // Event listeners
    sendButton.addEventListener('click', function() {
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = userInput.value.trim();
            if (message) {
                sendMessage(message);
            }
        }
    });

    newChatButton.addEventListener('click', function() {
        chatMessages.innerHTML = '';
        chatContainer.classList.remove('bottom-layout');
        chatContainer.classList.add('centered-layout');
        document.querySelector('.welcome-message').style.display = 'block';
        isFirstMessage = true;
    });

    // Function to change layout from centered to bottom
    function switchToChatLayout() {
        if (isFirstMessage) {
            chatContainer.classList.remove('centered-layout');
            chatContainer.classList.add('bottom-layout');
            document.querySelector('.welcome-message').style.display = 'none';
            isFirstMessage = false;
        }
    }

    // Function to start a new chat
    function startNewChat() {
        if (confirm('Start a new chat? Current conversation will be cleared.')) {
            // Clear messages from UI
            clearChatUI();
            
            // Reset to centered layout
            chatContainer.classList.remove('bottom-layout');
            chatContainer.classList.add('centered-layout');
            
            // Clear on server
            fetch('/api/clear', {
                method: 'POST'
            }).catch(error => {
                console.error('Error clearing chat history:', error);
            });
        }
    }

    // Function to add thinking animation
    function addThinkingAnimation() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('thinking');
        thinkingDiv.id = 'thinking-animation';
        
        const dotsDiv = document.createElement('div');
        dotsDiv.classList.add('thinking-dots');
        
        // Add three dots for the animation
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dotsDiv.appendChild(dot);
        }
        
        thinkingDiv.appendChild(dotsDiv);
        chatMessages.appendChild(thinkingDiv);
        scrollToBottom();
    }

    // Function to remove thinking animation
    function removeThinkingAnimation() {
        const thinkingDiv = document.getElementById('thinking-animation');
        if (thinkingDiv) {
            chatMessages.removeChild(thinkingDiv);
        }
    }

    // Function to send user message and get AI response
    async function sendMessage(message) {
        addMessageToChat('user', message);
        userInput.value = '';
        
        addThinkingAnimation();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            removeThinkingAnimation();
            addMessageToChat('ai', data.response);
        } catch (error) {
            console.error('Error:', error);
            removeThinkingAnimation();
            addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
        }
    }

    // Function to add a message to the chat
    function addMessageToChat(role, content) {
        // Remove welcome message if it exists
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            chatMessages.removeChild(welcomeMessage);
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(role === 'user' ? 'user-message' : 'ai-message');

        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        // If it's an AI message, we need to handle potential formatting
        if (role === 'ai') {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = content;
        }

        // Create time element
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');
        timeDiv.textContent = getCurrentTime();

        // Append elements
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        // Add to chat
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        scrollToBottom();
    }

    // Function to format AI responses (handle code blocks, links, etc.)
    function formatAIResponse(text) {
        // Format headings (# Heading)
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Format bold and italic
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
        text = text.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Format lists
        text = text.replace(/^\s*\*\s+(.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\s*\-\s+(.*$)/gm, '<li>$1</li>');
        text = text.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
        
        // Convert consecutive <li> elements to <ul> and </ul>
        text = text.replace(/(<li>.*<\/li>)(\s*<li>)/g, '$1</ul>\n<ul>$2');
        text = text.replace(/(<li>.*<\/li>)(\s*[^<])/g, '$1</ul>\n$2');
        text = text.replace(/([^>])\s*(<li>)/g, '$1\n<ul>$2');
        
        // Handle code blocks (text between triple backticks)
        text = text.replace(/```(\w*)([\s\S]*?)```/g, function(match, language, code) {
            return `<pre><code class="${language}">${escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Handle inline code (text between single backticks)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle basic Markdown-style links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Process line breaks with a specific approach for paragraph handling
        const paragraphs = text.split(/\n\n+/);
        text = paragraphs.map(p => {
            // If it's not already a tag-enclosed element and not empty
            if (p.trim() && !p.match(/^<[^>]+>/)) {
                return `<p>${p.replace(/\n/g, '<br>')}</p>`;
            }
            return p;
        }).join('\n\n');
        
        return text;
    }

    // Function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Function to get current time
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Function to scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to clear chat UI (without confirmation)
    function clearChatUI() {
        // Clear messages from UI
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
        
        // Add welcome message back
        const welcomeDiv = document.createElement('div');
        welcomeDiv.classList.add('welcome-message');
        welcomeDiv.innerHTML = '<h2>Welcome to SAHPAATHI</h2><p>Ask me anything about your studies!</p>';
        chatMessages.appendChild(welcomeDiv);
    }

    // Load chat history when page loads
    function loadChatHistory() {
        fetch('/api/history')
            .then(response => response.json())
            .then(data => {
                if (data.history && data.history.length > 0) {
                    // Switch to chat layout since there's history
                    switchToChatLayout();
                    
                    // Remove welcome message if there's history
                    const welcomeMessage = document.querySelector('.welcome-message');
                    if (welcomeMessage) {
                        chatMessages.removeChild(welcomeMessage);
                    }
                    
                    // Add messages to chat
                    data.history.forEach(msg => {
                        const content = msg.role === 'assistant' ? formatAIResponse(msg.content) : msg.content;
                        addMessageToChat(msg.role === 'assistant' ? 'ai' : 'user', content);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
            });
    }

    // Focus the input field when the page loads
    userInput.focus();

    // Initial load of chat history
    loadChatHistory();
});

// Add functionality for theme toggle
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Add functionality for starting a new chat
function startNewChat() {
  // Logic to clear the chat and start a new one
  const chatContainer = document.querySelector('.chat-container');
  chatContainer.innerHTML = ''; // Clear chat messages
  alert('New chat started!'); // Placeholder action
}

// Load theme from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
});