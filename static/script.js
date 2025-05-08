// SAHPAATHI - Enhanced JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    const themeToggle = document.getElementById('theme-toggle');
    const sidebar = document.querySelector('.sidebar');
    const chatHistoryList = document.getElementById('chat-history-list');
    const body = document.body;
    const logo = document.querySelector('.logo');
    const chatContainer = document.getElementById('chat-container');
    
    // Teacher mode elements
    const teacherModeBtn = document.getElementById('teacher-mode-btn');
    const teacherModeOption = document.getElementById('teacher-mode'); // Option in sidebar
    const teacherModeScreen = document.getElementById('teacher-mode-screen'); // Full screen section
    const closeTeacherMode = document.getElementById('close-teacher-mode'); // Close button
    const teacherCards = document.querySelectorAll('.teacher-card'); // Teacher cards in new UI
    const customTeacherSection = document.getElementById('custom-teacher-section');
    const customTeacherName = document.getElementById('custom-teacher-name');
    const customTeacherPrompt = document.getElementById('custom-teacher-prompt');
    const saveCustomTeacher = document.getElementById('save-custom-teacher');
    const cancelCustomTeacher = document.getElementById('cancel-custom-teacher');
    const activeTeacherDisplay = document.getElementById('active-teacher-display');
    const activeTeacherName = document.getElementById('active-teacher-name');
    const deactivateTeacher = document.getElementById('deactivate-teacher');
    const editActiveTeacher = document.getElementById('edit-active-teacher');
    const teacherDropdown = document.getElementById('teacher-dropdown'); // Added missing element
    const teacherListContainer = document.getElementById('teacher-list-container'); // Added for list container
    
    // Tools sidebar elements
    const toolsSidebar = document.querySelector('.tools-sidebar');
    const toolsToggle = document.getElementById('tools-toggle');
    const pdfConverter = document.getElementById('pdf-converter');
    const mdToPdf = document.getElementById('md-to-pdf');
    
    // Main content PDF converter elements
    const mainPdfConverter = document.getElementById('main-pdf-converter');
    const closeConverterBtn = document.getElementById('close-converter-btn');
    const fileConverterCard = document.getElementById('file-converter-card');
    const textConverterCard = document.getElementById('text-converter-card');
    const fileConverterSection = document.getElementById('file-converter-section');
    const textConverterSection = document.getElementById('text-converter-section');
    const fileConverterBack = document.getElementById('file-converter-back');
    const textConverterBack = document.getElementById('text-converter-back');
    
    // File upload elements
    const mainMdFileInput = document.getElementById('main-md-file-input');
    const dropZone = document.querySelector('.drop-zone');
    const mainSelectedFileInfo = document.getElementById('main-selected-file-info');
    const mainSelectedFilename = document.getElementById('main-selected-filename');
    const mainSelectedFilesize = document.getElementById('main-selected-filesize');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const mainConvertFileToPdfBtn = document.getElementById('main-convert-file-to-pdf-btn');
    
    // Text input elements
    const mainTextTitle = document.getElementById('main-text-title');
    const mainDirectTextInput = document.getElementById('main-direct-text-input');
    const mainConvertTextToPdfBtn = document.getElementById('main-convert-text-to-pdf-btn');
    const mainConversionStatus = document.getElementById('main-conversion-status');
    
    // Store the current session information
    let currentSessionId = '';
    let firstUserQuestion = '';
    let currentChatName = '';

    // Teacher mode state
    let allTeachers = [];
    let currentActiveTeacher = null; // Stores the active teacher object { teacher_id, name, prompt, is_custom }
    let isTeacherModeGloballyActive = false; // Tracks if the teacher mode is globally on/off by user choice

    // Store selected file data
    let mainSelectedFile = null;

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
    logo.addEventListener('click', toggleSidebar); 

    // Tools sidebar event listeners
    toolsToggle.addEventListener('click', toggleToolsSidebar);
    pdfConverter.addEventListener('click', showMainPdfConverterPanel); 
    mdToPdf.addEventListener('click', () => {
        // Show MD to PDF converter and expand sidebar if needed
        showMainPdfConverterPanel();
        if (!toolsSidebar.classList.contains('expanded')) {
            toggleToolsSidebar();
        }
        // Add active class to the button
        setActiveTool(mdToPdf);
    });
    
    // Teacher mode event listeners
    if (teacherModeBtn) {
        teacherModeBtn.addEventListener('click', toggleTeacherModeGlobalState);
    }
    
    if (teacherModeOption) {
        teacherModeOption.addEventListener('click', showTeacherModeScreen);
    }
    
    if (closeTeacherMode) {
        closeTeacherMode.addEventListener('click', hideTeacherModeScreen);
    }
    
    // Teacher card selection
    if (teacherCards) {
        teacherCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const teacherId = card.getAttribute('data-teacher-id');
                if (teacherId === 'custom') {
                    showCustomTeacherForm();
                } else {
                    selectPredefinedTeacher(teacherId);
                }
            });
        });
    }
    
    // Custom teacher form buttons
    if (saveCustomTeacher) {
        saveCustomTeacher.addEventListener('click', saveCustomTeacherHandler);
    }
    
    if (cancelCustomTeacher) {
        cancelCustomTeacher.addEventListener('click', hideCustomTeacherForm);
    }
    
    // Teacher mode controls
    if (deactivateTeacher) {
        deactivateTeacher.addEventListener('click', deactivateCurrentTeacher);
    }
    
    if (editActiveTeacher) {
        editActiveTeacher.addEventListener('click', editActiveTeacherHandler);
    }
    
    // Auto-adjust input height
    userInput.addEventListener('input', adjustInputHeight);

    // Initialize - fetch chat sessions and teacher mode
    initializeApplication();
    initializeTeacherMode();

    // Functions
    
    // Setup drag and drop functionality
    function setupDragAndDrop() {
        if (!dropZone) return;
        
        // Prevent default behavior (browser opening the file)
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        // Visual feedback for drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });
        
        // Handle the drop event
        dropZone.addEventListener('drop', handleDrop, false);
    }
    
    // Prevent default browser behavior for drag events
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Handle the file drop event
    function handleDrop(e) {
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
            processFile(file);
        } else {
            showMainConversionStatus('error', 'Please upload a .md or .txt file');
        }
    }
    
    // Process the selected or dropped file
    function processFile(file) {
        mainSelectedFile = file;
        mainSelectedFileInfo.classList.remove('hidden');
        mainSelectedFilename.textContent = file.name;
        
        // Show file size in KB or MB
        let fileSize = file.size / 1024; // KB
        let fileSizeStr = "";
        
        if (fileSize >= 1024) {
            fileSize = fileSize / 1024; // MB
            fileSizeStr = fileSize.toFixed(2) + " MB";
        } else {
            fileSizeStr = fileSize.toFixed(2) + " KB";
        }
        
        mainSelectedFilesize.textContent = fileSizeStr;
        mainConvertFileToPdfBtn.disabled = false;
        
        // Clear any previous status messages
        mainConversionStatus.classList.add('hidden');
    }
    
    // Remove the selected file
    function removeSelectedFile() {
        mainSelectedFile = null;
        mainSelectedFileInfo.classList.add('hidden');
        mainConvertFileToPdfBtn.disabled = true;
        mainMdFileInput.value = '';
    }
    
    // Show or hide converter sections based on user selection
    function showConverterSection(type) {
        if (type === 'file') {
            hideConverterOptions();
            fileConverterSection.classList.remove('hidden');
            fileConverterSection.classList.add('active');
        } else {
            hideConverterOptions();
            textConverterSection.classList.remove('hidden');
            textConverterSection.classList.add('active');
        }
    }
    
    function hideConverterSection() {
        fileConverterSection.classList.add('hidden');
        fileConverterSection.classList.remove('active');
        textConverterSection.classList.add('hidden');
        textConverterSection.classList.remove('active');
        showConverterOptions();
    }
    
    function hideConverterOptions() {
        const converterOptions = document.querySelector('.converter-options');
        if (converterOptions) {
            converterOptions.style.display = 'none';
        }
    }
    
    function showConverterOptions() {
        const converterOptions = document.querySelector('.converter-options');
        if (converterOptions) {
            converterOptions.style.display = 'flex';
        }
        if (mainConversionStatus) {
            mainConversionStatus.classList.add('hidden');
        }
    }
    
    // Show main content PDF converter and hide chat
    function showMainPdfConverterPanel() {
        if (!mainPdfConverter || !chatContainer) return;
        
        chatContainer.style.display = 'none';
        mainPdfConverter.classList.add('visible');
        
        // Reset any previous conversion status
        if (mainConversionStatus) {
            mainConversionStatus.classList.add('hidden');
        }
        
        // Show converter options, hide specific sections
        showConverterOptions();
        if (fileConverterSection) {
            fileConverterSection.classList.add('hidden');
        }
        if (textConverterSection) {
            textConverterSection.classList.add('hidden');
        }
    }
    
    // Close main PDF converter and show chat
    function closeMainPdfConverter() {
        if (!mainPdfConverter || !chatContainer) return;
        
        mainPdfConverter.classList.remove('visible');
        chatContainer.style.display = 'flex';
        
        // Reset all sections
        showConverterOptions();
        if (fileConverterSection) {
            fileConverterSection.classList.add('hidden');
        }
        if (textConverterSection) {
            textConverterSection.classList.add('hidden');
        }
        if (mainConversionStatus) {
            mainConversionStatus.classList.add('hidden');
        }
    }
    
    // Handle file selection
    function handleMainFileSelection(event) {
        const file = event.target.files[0];
        
        if (file) {
            processFile(file);
        }
    }
    
    // Convert Markdown to PDF from main converter
    async function convertMainMdToPdf() {
        if (!mainSelectedFile) {
            showMainConversionStatus('error', 'No file selected');
            return;
        }
        
        // Reset status
        showMainConversionStatus('', 'Converting file...', false);
        
        // Create FormData instance
        const formData = new FormData();
        formData.append('file', mainSelectedFile);
        
        try {
            // Show loading animation
            mainConvertFileToPdfBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Converting...';
            mainConvertFileToPdfBtn.disabled = true;
            
            // Send request to server
            const response = await fetch('/api/convert-md-to-pdf', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Conversion failed');
            }
            
            // Get the PDF file from response
            const data = await response.json();
            
            if (data.pdf_url) {
                // Show success message with download link
                showMainConversionStatus(
                    'success', 
                    `<i class="fas fa-check-circle"></i> Conversion successful!<br><a href="${data.pdf_url}" download target="_blank">Download PDF</a>`
                );
                
                // Automatically trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.pdf_url;
                downloadLink.download = mainSelectedFile.name.replace('.md', '.pdf').replace('.txt', '.pdf');
                downloadLink.click();
                
                // Reset the button
                mainConvertFileToPdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
                mainConvertFileToPdfBtn.disabled = false;
            } else {
                throw new Error('No PDF URL returned');
            }
        } catch (error) {
            console.error('Conversion error:', error);
            showMainConversionStatus('error', `<i class="fas fa-exclamation-circle"></i> Conversion failed: ${error.message}`);
            
            // Reset the button
            mainConvertFileToPdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
            mainConvertFileToPdfBtn.disabled = false;
        }
    }
    
    // Convert text directly to PDF from main converter
    async function convertMainTextToPdf() {
        const text = mainDirectTextInput.value.trim();
        const title = mainTextTitle.value.trim() || 'Document';
        
        if (!text) {
            showMainConversionStatus('error', '<i class="fas fa-exclamation-circle"></i> Please enter some text to convert');
            return;
        }
        
        // Show processing status
        showMainConversionStatus('', 'Converting text to PDF...', false);
        
        try {
            // Show loading animation
            mainConvertTextToPdfBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Converting...';
            mainConvertTextToPdfBtn.disabled = true;
            
            // Send request to server
            const response = await fetch('/api/convert-text-to-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    title: title
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Conversion failed');
            }
            
            // Get the PDF file from response
            const data = await response.json();
            
            if (data.pdf_url) {
                // Show success message with download link
                showMainConversionStatus(
                    'success', 
                    `<i class="fas fa-check-circle"></i> Conversion successful!<br><a href="${data.pdf_url}" download target="_blank">Download PDF</a>`
                );
                
                // Automatically trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.pdf_url;
                downloadLink.download = `${title}.pdf`;
                downloadLink.click();
                
                // Reset the button
                mainConvertTextToPdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
                mainConvertTextToPdfBtn.disabled = false;
            } else {
                throw new Error('No PDF URL returned');
            }
        } catch (error) {
            console.error('Text to PDF conversion error:', error);
            showMainConversionStatus('error', `<i class="fas fa-exclamation-circle"></i> Conversion failed: ${error.message}`);
            
            // Reset the button
            mainConvertTextToPdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
            mainConvertTextToPdfBtn.disabled = false;
        }
    }
    
    // Show conversion status message in main converter
    function showMainConversionStatus(type, message, isHtml = true) {
        if (!mainConversionStatus) return;
        
        mainConversionStatus.classList.remove('hidden', 'success', 'error');
        
        if (type) {
            mainConversionStatus.classList.add(type);
        }
        
        if (isHtml) {
            mainConversionStatus.innerHTML = message;
        } else {
            mainConversionStatus.textContent = message;
        }
    }

    // Initialize the application - check for existing sessions or create a new one
    async function initializeApplication() {
        console.log("Initializing SAHPAATHI application...");
        
        try {
            // Fetch all sessions
            const response = await fetch('/api/sessions');
            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }
            
            const data = await response.json();
            console.log("Fetched sessions:", data.sessions ? data.sessions.length : 0);
            
            if (data.sessions && data.sessions.length > 0) {
                // Load the most recent session
                const mostRecentSession = data.sessions[0];
                currentSessionId = mostRecentSession.session_id;
                currentChatName = mostRecentSession.name;
                
                console.log("Loading most recent session:", currentSessionId, currentChatName);
                loadChatHistory(currentSessionId);
            } else {
                // Create a new session
                createNewSession();
            }
        } catch (error) {
            console.error("Error initializing application:", error);
            // Create a new session as fallback
            createNewSession();
        }
    }
    
    // Create a new chat session
    async function createNewSession(name = "New Chat") {
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create new session');
            }
            
            const data = await response.json();
            currentSessionId = data.session_id;
            currentChatName = name;
            firstUserQuestion = '';
            
            console.log("Created new session:", currentSessionId);
            clearChatUI();
            
            // Update sidebar if expanded
            if (sidebar.classList.contains('expanded')) {
                loadChatSessionsForSidebar();
            }
            
            return currentSessionId;
        } catch (error) {
            console.error("Error creating new session:", error);
            showErrorMessage("Failed to create a new chat session.");
            return null;
        }
    }

    // Toggle sidebar expansion
    function toggleSidebar() {
        sidebar.classList.toggle('expanded');
        
        // Add animation to the logo button
        logo.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => {
            logo.classList.remove('animate__animated', 'animate__rubberBand');
        }, 800);
        
        // Load chat sessions into sidebar if expanded
        if (sidebar.classList.contains('expanded')) {
            loadChatSessionsForSidebar();
        }
    }
    
    // Toggle tools sidebar expansion
    function toggleToolsSidebar() {
        toolsSidebar.classList.toggle('expanded');
        
        // Add animation to the tools toggle button
        toolsToggle.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => {
            toolsToggle.classList.remove('animate__animated', 'animate__rubberBand');
        }, 800);
    }
    
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
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; 
        }
        
        // Remove transition class after animation completes
        setTimeout(() => {
            body.classList.remove('theme-transition');
            themeToggle.classList.remove('theme-toggle-active');
        }, 300);
    }

    // Start a new chat
    async function startNewChat() {
        // Add animation to button
        newChatButton.classList.add('animate__animated', 'animate__rubberBand');
        
        setTimeout(() => {
            newChatButton.classList.remove('animate__animated', 'animate__rubberBand');
        }, 800);

        // Create a new session
        await createNewSession();
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
        // Store the first question for chat naming if this is the first message in a new session
        if (!firstUserQuestion) {
            firstUserQuestion = message;
            // Update the session name with the first question
            updateSessionName(currentSessionId, message);
        }
        
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input field and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        userInput.focus();
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        let finalMessage = message;
        if (isTeacherModeGloballyActive && currentActiveTeacher && currentActiveTeacher.prompt) {
            finalMessage = `System Prompt (Follow these instructions for your persona): ${currentActiveTeacher.prompt}\\n\\nUser question: ${message}`;
            console.log("Using teacher prompt for:", currentActiveTeacher.name);
        }

        try {
            console.log("Sending message to API for session:", currentSessionId);
            
            // Send message to API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: finalMessage, // Use finalMessage
                    session_id: currentSessionId
                }),
            });
            
            if (!response.ok) {
                console.error("API response error:", response.status, response.statusText);
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Received response from API, length:", data.response ? data.response.length : 0);
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicator);
            
            // Add AI response to chat with a small delay for natural feel
            setTimeout(() => {
                addMessageToChat('ai', data.response);
                
                // Update sidebar if it's expanded to reflect any changes in sessions
                if (sidebar.classList.contains('expanded')) {
                    loadChatSessionsForSidebar();
                }
            }, 300);
            
        } catch (error) {
            console.error('Error in API call:', error);
            removeTypingIndicator(typingIndicator);
            showErrorMessage("Sorry, I couldn't process your request. Please try again.");
        }
    }
    
    // Update a session name
    async function updateSessionName(sessionId, question) {
        // Generate a name from the question
        let name = question.trim();
        if (name.length > 30) {
            name = name.substring(0, 30) + '...';
        }
        
        currentChatName = name;
        
        try {
            const response = await fetch(`/api/sessions/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update session name');
            }
            
            console.log("Updated session name:", name);
            
            // Update sidebar if it's expanded
            if (sidebar.classList.contains('expanded')) {
                loadChatSessionsForSidebar();
            }
            
        } catch (error) {
            console.error("Error updating session name:", error);
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

    // Load chat history for a specific session
    function loadChatHistory(sessionId) {
        console.log("Loading chat history for session:", sessionId);
        fetch(`/api/history?session_id=${sessionId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log("Loaded", data.history ? data.history.length : 0, "messages for session", sessionId);
                
                if (data.history && data.history.length > 0) {
                    // Remove welcome message if chat history exists
                    const welcomeMessage = document.querySelector('.welcome-message');
                    if (welcomeMessage && welcomeMessage.parentNode === chatMessages) {
                        chatMessages.removeChild(welcomeMessage);
                    }
                    
                    // Find the first user message to set as first question
                    const firstUserMsg = data.history.find(msg => msg.role === 'user');
                    if (firstUserMsg) {
                        firstUserQuestion = firstUserMsg.content;
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
                showErrorMessage("Sorry, I couldn't load the chat history.");
            });
    }
    
    // Load chat sessions for sidebar with improved error handling
    function loadChatSessionsForSidebar() {
        console.log("Loading chat sessions for sidebar...");
        fetch('/api/sessions')
            .then(response => {
                if (!response.ok) {
                    console.error("Network response was not ok:", response.status);
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Clear existing chat history items
                chatHistoryList.innerHTML = '';
                
                console.log("Chat sessions loaded:", data.sessions ? data.sessions.length : 0);
                
                if (data.sessions && data.sessions.length > 0) {
                    // Create chat history items for each session
                    data.sessions.forEach((session) => {
                        const chatItem = document.createElement('div');
                        chatItem.classList.add('chat-history-item');
                        chatItem.setAttribute('data-session-id', session.session_id);
                        
                        // Highlight the current session
                        if (session.session_id === currentSessionId) {
                            chatItem.classList.add('active-session');
                        }
                        
                        chatItem.innerHTML = `
                            <i class="fas fa-comment-dots"></i>
                            <span>${session.name}</span>
                        `;
                        
                        // Add click event to load this chat session
                        chatItem.addEventListener('click', () => {
                            loadSession(session.session_id);
                        });
                        
                        chatHistoryList.appendChild(chatItem);
                    });
                } else {
                    // Show a message if no chat sessions
                    console.log("No chat sessions found");
                    const noHistoryItem = document.createElement('div');
                    noHistoryItem.classList.add('chat-history-item');
                    noHistoryItem.innerHTML = `
                        <i class="fas fa-info-circle"></i>
                        <span>No chat history yet</span>
                    `;
                    chatHistoryList.appendChild(noHistoryItem);
                }
            })
            .catch(error => {
                console.error('Error loading chat sessions for sidebar:', error);
                
                // Show error in sidebar
                const errorItem = document.createElement('div');
                errorItem.classList.add('chat-history-item');
                errorItem.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Failed to load sessions</span>
                `;
                chatHistoryList.appendChild(errorItem);
            });
    }
    
    // Load a specific chat session
    async function loadSession(sessionId) {
        console.log("Loading session:", sessionId);
        
        if (sessionId === currentSessionId) {
            console.log("Already in this session, no need to reload");
            return;
        }
        
        // Clear the current chat UI
        clearChatUI();
        
        // Set the new session as current
        currentSessionId = sessionId;
        firstUserQuestion = '';
        
        // Load this session's chat history
        loadChatHistory(sessionId);
        
        // Update sidebar to highlight the current session
        if (sidebar.classList.contains('expanded')) {
            const chatItems = document.querySelectorAll('.chat-history-item');
            chatItems.forEach(item => {
                item.classList.remove('active-session');
                if (item.getAttribute('data-session-id') === sessionId) {
                    item.classList.add('active-session');
                }
            });
        }
    }

    // Set active tool in the tools sidebar
    function setActiveTool(toolElement) {
        const toolItems = document.querySelectorAll('.tool-item');
        toolItems.forEach(item => item.classList.remove('active'));
        if (toolElement) {
            toolElement.classList.add('active');
        }
    }

    // Teacher Mode Functions
    
    // Initialize Teacher Mode
    async function initializeTeacherMode() {
        await fetchAllTeachers();
        loadPersistedTeacherState();
        
        // Check if Teacher Mode screen exists, if not, create it
        if (!teacherModeScreen) {
            createTeacherModeScreen();
        }
        
        updateTeacherModeButtonState();
    }
    
    // Create Teacher Mode Screen if it doesn't exist
    function createTeacherModeScreen() {
        const fullScreenSection = document.createElement('div');
        fullScreenSection.id = 'teacher-mode-screen';
        fullScreenSection.className = 'full-screen-section';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h2><i class="fas fa-user-graduate"></i> Teacher Mode</h2>
            <button id="close-teacher-mode" class="close-section-btn"><i class="fas fa-times"></i></button>
        `;
        
        // Create description
        const description = document.createElement('div');
        description.className = 'section-description';
        description.innerHTML = `
            <p>Select a teacher persona to help guide your learning experience. Your AI assistant will adopt
            this teaching style when answering your questions.</p>
        `;
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'teacher-mode-content';
        
        // Create teacher selection area
        const teacherSelection = document.createElement('div');
        teacherSelection.className = 'teacher-selection';
        teacherSelection.innerHTML = `<h3>Select a Teacher</h3>`;
        
        // Create teacher grid
        const teacherGrid = document.createElement('div');
        teacherGrid.className = 'teacher-grid';
        teacherGrid.id = 'teacher-grid';
        teacherSelection.appendChild(teacherGrid);
        
        // Create custom teacher section
        const customTeacherSection = document.createElement('div');
        customTeacherSection.id = 'custom-teacher-section';
        customTeacherSection.className = 'custom-teacher-section hidden';
        customTeacherSection.innerHTML = `
            <h3>Create Custom Teacher</h3>
            <div class="custom-teacher-form">
                <div class="form-group">
                    <label for="custom-teacher-name">Teacher Name:</label>
                    <input type="text" id="custom-teacher-name" class="themed-input" placeholder="E.g., Physics Expert">
                </div>
                <div class="form-group">
                    <label for="custom-teacher-prompt">Teacher Instructions:</label>
                    <textarea id="custom-teacher-prompt" class="themed-input" rows="6" 
                    placeholder="Describe how this teacher should respond. For example: You are a Physics teacher who explains complex concepts using simple analogies and real-world examples. You focus on helping students understand the fundamental principles rather than memorizing formulas."></textarea>
                </div>
                <div class="form-actions">
                    <button id="save-custom-teacher" class="primary-button"><i class="fas fa-save"></i> Save Teacher</button>
                    <button id="cancel-custom-teacher" class="secondary-button"><i class="fas fa-times"></i> Cancel</button>
                </div>
            </div>
        `;
        
        // Create active teacher display
        const activeTeacherDisplay = document.createElement('div');
        activeTeacherDisplay.id = 'active-teacher-display';
        activeTeacherDisplay.className = 'active-teacher-display hidden';
        activeTeacherDisplay.innerHTML = `
            <h3>Current Active Teacher</h3>
            <div class="active-teacher-info">
                <div class="info-details">
                    <h4>Teacher:</h4>
                    <p id="active-teacher-name">None Selected</p>
                </div>
                <div class="active-teacher-controls">
                    <button id="edit-active-teacher" class="secondary-button"><i class="fas fa-edit"></i> Edit</button>
                    <button id="deactivate-teacher" class="danger-button"><i class="fas fa-power-off"></i> Deactivate</button>
                </div>
            </div>
        `;
        
        // Assemble the content
        content.appendChild(teacherSelection);
        content.appendChild(customTeacherSection);
        content.appendChild(activeTeacherDisplay);
        
        // Assemble the screen
        fullScreenSection.appendChild(header);
        fullScreenSection.appendChild(description);
        fullScreenSection.appendChild(content);
        
        // Add to document
        document.body.appendChild(fullScreenSection);
        
        // Set global variables for the newly created elements
        teacherModeScreen = fullScreenSection;
        closeTeacherMode = document.getElementById('close-teacher-mode');
        customTeacherSection = document.getElementById('custom-teacher-section');
        customTeacherName = document.getElementById('custom-teacher-name');
        customTeacherPrompt = document.getElementById('custom-teacher-prompt');
        saveCustomTeacher = document.getElementById('save-custom-teacher');
        cancelCustomTeacher = document.getElementById('cancel-custom-teacher');
        activeTeacherDisplay = document.getElementById('active-teacher-display');
        activeTeacherName = document.getElementById('active-teacher-name');
        deactivateTeacher = document.getElementById('deactivate-teacher');
        editActiveTeacher = document.getElementById('edit-active-teacher');
        
        // Add event listeners
        closeTeacherMode.addEventListener('click', hideTeacherModeScreen);
        saveCustomTeacher.addEventListener('click', saveCustomTeacherHandler);
        cancelCustomTeacher.addEventListener('click', hideCustomTeacherForm);
        deactivateTeacher.addEventListener('click', deactivateCurrentTeacher);
        editActiveTeacher.addEventListener('click', editActiveTeacherHandler);
        
        // Return the screen for further use
        return fullScreenSection;
    }
    
    // Fetch all teachers from the server
    async function fetchAllTeachers() {
        try {
            const response = await fetch('/api/teachers');
            if (!response.ok) {
                throw new Error('Failed to fetch teachers');
            }
            
            const data = await response.json();
            allTeachers = data.teachers || [];
            console.log("Fetched teachers:", allTeachers.length);
            
            // Render teachers in the UI
            renderTeacherGrid();
            
            return allTeachers;
        } catch (error) {
            console.error("Error fetching teachers:", error);
            showStatusMessage('error', 'Could not load teachers.');
            return [];
        }
    }
    
    // Render the teacher grid with all available teachers
    function renderTeacherGrid() {
        const teacherGrid = document.getElementById('teacher-grid');
        if (!teacherGrid) return;
        
        teacherGrid.innerHTML = '';
        
        // Add default teachers first
        allTeachers.filter(teacher => !teacher.is_custom).forEach(teacher => {
            const card = createTeacherCard(teacher);
            teacherGrid.appendChild(card);
        });
        
        // Add custom teachers
        allTeachers.filter(teacher => teacher.is_custom).forEach(teacher => {
            const card = createTeacherCard(teacher);
            teacherGrid.appendChild(card);
        });
        
        // Add card to create new custom teacher
        const createCard = document.createElement('div');
        createCard.className = 'teacher-card';
        createCard.dataset.teacherId = 'custom';
        createCard.innerHTML = `
            <div class="teacher-icon">
                <i class="fas fa-plus"></i>
            </div>
            <span>Create Custom</span>
        `;
        createCard.addEventListener('click', showCustomTeacherForm);
        teacherGrid.appendChild(createCard);
    }
    
    // Create a teacher card for the grid
    function createTeacherCard(teacher) {
        const card = document.createElement('div');
        card.className = 'teacher-card';
        
        // Add active class if this is the current active teacher
        if (currentActiveTeacher && currentActiveTeacher.teacher_id === teacher.teacher_id && isTeacherModeGloballyActive) {
            card.classList.add('active');
        }
        
        card.dataset.teacherId = teacher.teacher_id;
        
        // Determine icon based on teacher name or type
        let icon = 'user-graduate';
        if (teacher.name.toLowerCase().includes('math')) icon = 'calculator';
        else if (teacher.name.toLowerCase().includes('science')) icon = 'flask';
        else if (teacher.name.toLowerCase().includes('computer')) icon = 'laptop-code';
        else if (teacher.name.toLowerCase().includes('english')) icon = 'book';
        else if (teacher.name.toLowerCase().includes('history')) icon = 'landmark';
        else if (teacher.name.toLowerCase().includes('art')) icon = 'palette';
        else if (teacher.name.toLowerCase().includes('music')) icon = 'music';
        else if (teacher.name.toLowerCase().includes('physical')) icon = 'running';
        
        card.innerHTML = `
            <div class="teacher-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <span>${teacher.name}</span>
        `;
        
        // Add click event to select this teacher
        card.addEventListener('click', () => selectTeacher(teacher));
        
        return card;
    }
    
    // Show the Teacher Mode screen
    function showTeacherModeScreen() {
        if (!teacherModeScreen) {
            createTeacherModeScreen();
        }
        
        // Refresh teachers list
        fetchAllTeachers();
        
        // Show the screen
        teacherModeScreen.classList.add('visible');
        
        // Update display of active teacher if needed
        updateActiveTeacherDisplay();
    }
    
    // Hide the Teacher Mode screen
    function hideTeacherModeScreen() {
        if (!teacherModeScreen) return;
        
        teacherModeScreen.classList.remove('visible');
        
        // Also hide custom teacher form if it's open
        hideCustomTeacherForm();
    }
    
    // Show the custom teacher form
    function showCustomTeacherForm() {
        if (!customTeacherSection) return;
        
        // Clear form fields
        customTeacherName.value = '';
        customTeacherPrompt.value = '';
        customTeacherName.disabled = false;
        
        // Update button text
        saveCustomTeacher.innerHTML = '<i class="fas fa-save"></i> Save Teacher';
        saveCustomTeacher.dataset.mode = 'create';
        
        // Show the form
        customTeacherSection.classList.remove('hidden');
        
        // Focus on the name field
        customTeacherName.focus();
    }
    
    // Hide the custom teacher form
    function hideCustomTeacherForm() {
        if (!customTeacherSection) return;
        
        customTeacherSection.classList.add('hidden');
    }
    
    // Edit an existing teacher
    function editActiveTeacherHandler() {
        if (!currentActiveTeacher || !customTeacherSection) return;
        
        // Fill form with current teacher data
        customTeacherName.value = currentActiveTeacher.name;
        customTeacherPrompt.value = currentActiveTeacher.prompt;
        
        // Disable name field for default teachers
        customTeacherName.disabled = !currentActiveTeacher.is_custom;
        
        // Update button text
        saveCustomTeacher.innerHTML = '<i class="fas fa-save"></i> Update Teacher';
        saveCustomTeacher.dataset.mode = 'update';
        saveCustomTeacher.dataset.teacherId = currentActiveTeacher.teacher_id;
        
        // Show the form
        customTeacherSection.classList.remove('hidden');
        
        // Focus on the prompt field
        customTeacherPrompt.focus();
    }
    
    // Save a new custom teacher or update an existing one
    async function saveCustomTeacherHandler() {
        const name = customTeacherName.value.trim();
        const prompt = customTeacherPrompt.value.trim();
        
        if (!name || !prompt) {
            showStatusMessage('error', 'Name and prompt are required.');
            return;
        }
        
        const mode = saveCustomTeacher.dataset.mode || 'create';
        
        try {
            let response;
            
            if (mode === 'create') {
                // Create new teacher
                response = await fetch('/api/teachers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, prompt })
                });
            } else if (mode === 'update') {
                // Update existing teacher
                const teacherId = saveCustomTeacher.dataset.teacherId;
                if (!teacherId) {
                    showStatusMessage('error', 'Teacher ID is missing.');
                    return;
                }
                
                const payload = { prompt };
                if (customTeacherName.disabled === false) {
                    payload.name = name;
                }
                
                response = await fetch(`/api/teachers/${teacherId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save teacher');
            }
            
            // Refresh teacher list
            await fetchAllTeachers();
            
            // Hide the form
            hideCustomTeacherForm();
            
            // Show success message
            showStatusMessage('success', mode === 'create' ? 'Teacher created successfully!' : 'Teacher updated successfully!');
            
            // If we updated the current active teacher, refresh it
            if (mode === 'update' && currentActiveTeacher && currentActiveTeacher.teacher_id === saveCustomTeacher.dataset.teacherId) {
                // Find the updated teacher in the list
                const updatedTeacher = allTeachers.find(t => t.teacher_id === currentActiveTeacher.teacher_id);
                if (updatedTeacher) {
                    currentActiveTeacher = updatedTeacher;
                    updateActiveTeacherDisplay();
                }
            }
            
        } catch (error) {
            console.error('Error saving teacher:', error);
            showStatusMessage('error', error.message || 'Failed to save teacher.');
        }
    }
    
    // Select a teacher and activate teacher mode
    function selectTeacher(teacher) {
        currentActiveTeacher = teacher;
        isTeacherModeGloballyActive = true;
        
        // Update UI to show selected teacher
        updateActiveTeacherDisplay();
        
        // Save to localStorage
        localStorage.setItem('activeTeacherId', teacher.teacher_id);
        localStorage.setItem('isTeacherModeGloballyActive', 'true');
        
        // Update teacher button in header
        updateTeacherModeButtonState();
        
        // Show success message
        showStatusMessage('success', `${teacher.name} mode activated!`);
        
        // Update teacher cards highlighting
        renderTeacherGrid();
    }
    
    // Deactivate the current teacher
    function deactivateCurrentTeacher() {
        if (!currentActiveTeacher) return;
        
        const previousTeacherName = currentActiveTeacher.name;
        
        currentActiveTeacher = null;
        isTeacherModeGloballyActive = false;
        
        // Update UI
        updateActiveTeacherDisplay();
        
        // Remove from localStorage
        localStorage.removeItem('activeTeacherId');
        localStorage.setItem('isTeacherModeGloballyActive', 'false');
        
        // Update teacher button in header
        updateTeacherModeButtonState();
        
        // Show message
        showStatusMessage('info', `${previousTeacherName} mode deactivated.`);
        
        // Update teacher cards highlighting
        renderTeacherGrid();
    }
    
    // Update the active teacher display
    function updateActiveTeacherDisplay() {
        if (!activeTeacherDisplay || !activeTeacherName) return;
        
        if (isTeacherModeGloballyActive && currentActiveTeacher) {
            activeTeacherName.textContent = currentActiveTeacher.name;
            activeTeacherDisplay.classList.remove('hidden');
        } else {
            activeTeacherDisplay.classList.add('hidden');
        }
    }
    
    // Toggle teacher mode globally (from the header button)
    function toggleTeacherModeGlobalState() {
        if (!teacherModeBtn) return;
        
        if (!currentActiveTeacher) {
            // If no teacher is selected, show the teacher mode screen
            showTeacherModeScreen();
            return;
        }
        
        // Toggle teacher mode state
        isTeacherModeGloballyActive = !isTeacherModeGloballyActive;
        
        // Save state to localStorage
        localStorage.setItem('isTeacherModeGloballyActive', isTeacherModeGloballyActive.toString());
        
        // Update button state
        updateTeacherModeButtonState();
        
        // Show status message
        if (isTeacherModeGloballyActive) {
            showStatusMessage('success', `${currentActiveTeacher.name} mode activated!`);
        } else {
            showStatusMessage('info', `Teacher mode deactivated.`);
        }
        
        // Update teacher cards highlighting
        renderTeacherGrid();
    }
    
    // Update the teacher mode button state in the header
    function updateTeacherModeButtonState() {
        if (!teacherModeBtn) return;
        
        // Update button appearance
        if (isTeacherModeGloballyActive && currentActiveTeacher) {
            teacherModeBtn.classList.add('tutor-active');
            teacherModeBtn.title = `${currentActiveTeacher.name} mode active (click to toggle)`;
        } else {
            teacherModeBtn.classList.remove('tutor-active');
            teacherModeBtn.title = 'Teacher Mode (click to activate)';
        }
    }
    
    // Load persisted teacher state from localStorage
    function loadPersistedTeacherState() {
        const savedTeacherId = localStorage.getItem('activeTeacherId');
        const savedModeState = localStorage.getItem('isTeacherModeGloballyActive') === 'true';
        
        if (savedTeacherId && allTeachers.length > 0) {
            const teacher = allTeachers.find(t => t.teacher_id === savedTeacherId);
            if (teacher) {
                currentActiveTeacher = teacher;
                isTeacherModeGloballyActive = savedModeState;
            } else {
                // Teacher not found, reset state
                isTeacherModeGloballyActive = false;
                localStorage.removeItem('activeTeacherId');
            }
        } else {
            isTeacherModeGloballyActive = false;
        }
        
        // Update UI
        updateTeacherModeButtonState();
        updateActiveTeacherDisplay();
    }
    
    // Show a status message that disappears after a few seconds
    function showStatusMessage(type, message) {
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status-message', `status-${type}`, 'animate__animated', 'animate__fadeIn');
        statusDiv.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
        
        document.body.appendChild(statusDiv);
        
        // Position it at the top center
        statusDiv.style.position = 'fixed';
        statusDiv.style.top = '20px';
        statusDiv.style.left = '50%';
        statusDiv.style.transform = 'translateX(-50%)';
        statusDiv.style.zIndex = '9999';
        statusDiv.style.padding = '10px 20px';
        statusDiv.style.borderRadius = '5px';
        statusDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        
        // Remove after 3 seconds
        setTimeout(() => {
            statusDiv.classList.remove('animate__fadeIn');
            statusDiv.classList.add('animate__fadeOut');
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    document.body.removeChild(statusDiv);
                }
            }, 500);
        }, 2500);
    }
    
    // If we have drag and drop capability, set it up
    if (dropZone) {
        setupDragAndDrop();
    }
    
    // If we have file input, set up listener
    if (mainMdFileInput) {
        mainMdFileInput.addEventListener('change', handleMainFileSelection);
    }
    
    // If we have convert buttons, set up listeners
    if (mainConvertFileToPdfBtn) {
        mainConvertFileToPdfBtn.addEventListener('click', convertMainMdToPdf);
    }
    
    if (mainConvertTextToPdfBtn) {
        mainConvertTextToPdfBtn.addEventListener('click', convertMainTextToPdf);
    }
    
    // If we have converter option cards, set up listeners
    if (fileConverterCard) {
        fileConverterCard.addEventListener('click', () => showConverterSection('file'));
    }
    
    if (textConverterCard) {
        textConverterCard.addEventListener('click', () => showConverterSection('text'));
    }
    
    // If we have converter back buttons, set up listeners
    if (fileConverterBack) {
        fileConverterBack.addEventListener('click', hideConverterSection);
    }
    
    if (textConverterBack) {
        textConverterBack.addEventListener('click', hideConverterSection);
    }
    
    // If we have close converter button, set up listener
    if (closeConverterBtn) {
        closeConverterBtn.addEventListener('click', closeMainPdfConverter);
    }
    
    // If we have remove file button, set up listener
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', removeSelectedFile);
    }
});