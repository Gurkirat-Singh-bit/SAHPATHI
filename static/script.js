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
    
    // Quiz Mode elements
    const quizGenerator = document.getElementById('quiz-generator'); // Option in sidebar
    const quizModeScreen = document.getElementById('quiz-generator-screen'); // Full screen section
    const closeQuizMode = document.getElementById('close-quiz-btn'); // Close button
    const quizContainer = document.getElementById('quiz-container'); // Container for quiz questions
    const quizControls = document.getElementById('quiz-controls'); // Quiz navigation controls
    const quizHeader = document.getElementById('quiz-header'); // Quiz header with progress
    const quizResults = document.getElementById('quiz-results'); // Quiz results section
    let currentQuizData = null; // Store the current quiz data
    let currentQuizQuestion = 0; // Track the current question
    let quizAnswers = []; // Store user's answers

    // Tools sidebar elements
    const toolsSidebar = document.querySelector('.tools-sidebar');
    const toolsToggle = document.getElementById('tools-toggle');
    const textToPdf = document.getElementById('text-to-pdf');
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
    
    // Text to PDF tool event listener
    if (textToPdf) {
        textToPdf.addEventListener('click', () => {
            showMainPdfConverterPanel();
            if (!toolsSidebar.classList.contains('expanded')) {
                toggleToolsSidebar();
            }
            setActiveTool(textToPdf);
        });
    }
    
    // MD to PDF event listener
    if (mdToPdf) {
        mdToPdf.addEventListener('click', () => {
            // Show MD to PDF converter and expand sidebar if needed
            showMainPdfConverterPanel();
            if (!toolsSidebar.classList.contains('expanded')) {
                toggleToolsSidebar();
            }
            // Add active class to the button
            setActiveTool(mdToPdf);
        });
    }
    
    // Quiz Generator event listener
    if (quizGenerator) {
        quizGenerator.addEventListener('click', () => {
            // Show Quiz Generator screen
            showQuizModeScreen();
            
            // Expand sidebar if needed
            if (!toolsSidebar.classList.contains('expanded')) {
                toggleToolsSidebar();
            }
            
            // Add active class to the button
            setActiveTool(quizGenerator);

            // Generate quiz immediately
            generateQuiz();
        });
    }
    
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

    // Initialize tool modals
    initToolModals();

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
        hours = hours ? hours : 12; // If hours is 0, set to 12
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

    // Create Quiz Mode Screen if it doesn't exist
    function createQuizModeScreen() {
        const fullScreenSection = document.createElement('div');
        fullScreenSection.id = 'quiz-mode-screen';
        fullScreenSection.className = 'full-screen-section';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <h2><i class="fas fa-question-circle"></i> Quiz Generator</h2>
            <button id="close-quiz-mode" class="close-section-btn"><i class="fas fa-times"></i></button>
        `;
        
        // Create quiz container
        const quizContainer = document.createElement('div');
        quizContainer.id = 'quiz-container';
        quizContainer.className = 'quiz-container';
        
        // Create quiz header (for progress)
        const quizHeader = document.createElement('div');
        quizHeader.id = 'quiz-header';
        quizHeader.className = 'quiz-header';
        quizHeader.innerHTML = `
            <div class="quiz-progress">
                <span class="quiz-progress-text">Question <span id="current-question">1</span> of <span id="total-questions">5</span></span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 20%"></div>
                </div>
            </div>
        `;
        
        // Create description
        const description = document.createElement('div');
        description.className = 'section-description';
        description.innerHTML = `
            <p>This quiz is generated based on your recent conversations. Test your knowledge on the topics you've been discussing!</p>
            <button id="generate-quiz-btn" class="primary-button"><i class="fas fa-sync"></i> Generate Quiz</button>
        `;
        
        // Create quiz question container
        const questionContainer = document.createElement('div');
        questionContainer.id = 'question-container';
        questionContainer.className = 'question-container';
        questionContainer.innerHTML = `
            <div class="loading-quiz hidden">
                <i class="fas fa-circle-notch fa-spin"></i> Generating quiz based on your conversations...
            </div>
            <div class="quiz-start-prompt">
                <p>Click "Generate Quiz" to create a quiz based on your recent conversations.</p>
                <i class="fas fa-arrow-up fa-2x"></i>
            </div>
        `;
        
        // Create quiz controls
        const quizControls = document.createElement('div');
        quizControls.id = 'quiz-controls';
        quizControls.className = 'quiz-controls hidden';
        quizControls.innerHTML = `
            <button id="prev-question" class="secondary-button" disabled><i class="fas fa-arrow-left"></i> Previous</button>
            <button id="next-question" class="primary-button">Next <i class="fas fa-arrow-right"></i></button>
            <button id="submit-quiz" class="success-button hidden">Submit Quiz</button>
        `;
        
        // Create quiz results section
        const quizResults = document.createElement('div');
        quizResults.id = 'quiz-results';
        quizResults.className = 'quiz-results hidden';
        
        // Assemble the quiz container
        quizContainer.appendChild(quizHeader);
        quizContainer.appendChild(questionContainer);
        quizContainer.appendChild(quizControls);
        quizContainer.appendChild(quizResults);
        
        // Assemble the screen
        fullScreenSection.appendChild(header);
        fullScreenSection.appendChild(description);
        fullScreenSection.appendChild(quizContainer);
        
        // Add to document
        document.body.appendChild(fullScreenSection);
        
        // Set global variables
        quizModeScreen = fullScreenSection;
        closeQuizMode = document.getElementById('close-quiz-mode');
        quizContainer = document.getElementById('quiz-container');
        quizControls = document.getElementById('quiz-controls');
        quizHeader = document.getElementById('quiz-header');
        quizResults = document.getElementById('quiz-results');
        
        // Add event listeners
        const generateQuizBtn = document.getElementById('generate-quiz-btn');
        const prevQuestionBtn = document.getElementById('prev-question');
        const nextQuestionBtn = document.getElementById('next-question');
        const submitQuizBtn = document.getElementById('submit-quiz');
        
        closeQuizMode.addEventListener('click', hideQuizModeScreen);
        generateQuizBtn.addEventListener('click', generateQuiz);
        prevQuestionBtn.addEventListener('click', showPreviousQuestion);
        nextQuestionBtn.addEventListener('click', showNextQuestion);
        submitQuizBtn.addEventListener('click', submitQuiz);
        
        // Return the screen for further use
        return fullScreenSection;
    }

    // Show the Quiz Mode screen
    function showQuizModeScreen() {
        if (!quizModeScreen) {
            createQuizModeScreen();
        }
        
        // Reset quiz state
        resetQuizState();
        
        // Show the screen
        quizModeScreen.classList.add('visible');
    }
    
    // Hide the Quiz Mode screen
    function hideQuizModeScreen() {
        if (!quizModeScreen) return;
        quizModeScreen.classList.remove('visible');
    }
    
    // Reset quiz state
    function resetQuizState() {
        currentQuizData = null;
        currentQuizQuestion = 0;
        quizAnswers = [];
        
        // Reset UI
        const questionContainer = document.getElementById('question-container');
        const quizStartPrompt = document.querySelector('.quiz-start-prompt');
        const loadingQuiz = document.querySelector('.loading-quiz');
        
        if (questionContainer) {
            // Show start prompt, hide loading
            if (quizStartPrompt) quizStartPrompt.classList.remove('hidden');
            if (loadingQuiz) loadingQuiz.classList.add('hidden');
        }
        
        // Hide controls and results
        if (quizControls) quizControls.classList.add('hidden');
        if (quizResults) quizResults.classList.add('hidden');
    }
    
    // Generate a new quiz based on chat history
    async function generateQuiz() {
        if (!currentSessionId) {
            showStatusMessage('error', 'No active chat session found. Please start a conversation first.');
            return;
        }
        
        // Show loading indicator
        const questionContainer = document.getElementById('question-container');
        const loadingQuiz = document.querySelector('.loading-quiz');
        const quizStartPrompt = document.querySelector('.quiz-start-prompt');
        
        if (loadingQuiz) loadingQuiz.classList.remove('hidden');
        if (quizStartPrompt) quizStartPrompt.classList.add('hidden');
        
        // Hide quiz controls and previous content
        if (quizControls) quizControls.classList.add('hidden');
        if (quizResults) quizResults.classList.add('hidden');
        
        try {
            console.log("Generating quiz...");
            
            // Request quiz generation from the server
            const response = await fetch(`/generate-quiz?session_id=${currentSessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Received quiz data:", data);
            
            // Store quiz data and reset current question
            currentQuizData = data.questions || [];
            currentQuizQuestion = 0;
            quizAnswers = new Array(currentQuizData.length).fill(null);
            
            // Hide loading indicator
            if (loadingQuiz) loadingQuiz.classList.add('hidden');
            
            // Show controls if we have questions
            if (currentQuizData.length > 0) {
                if (quizControls) quizControls.classList.remove('hidden');
                showQuestion(0);
            } else {
                // Show message if no questions were generated
                if (questionContainer) {
                    questionContainer.innerHTML = `
                        <div class="no-quiz-data">
                            <p>Could not generate a quiz. Please have a longer conversation first.</p>
                            <button id="try-again-btn" class="secondary-button">Try Again</button>
                        </div>
                    `;
                    
                    // Add event listener to try again button
                    const tryAgainBtn = document.getElementById('try-again-btn');
                    if (tryAgainBtn) {
                        tryAgainBtn.addEventListener('click', generateQuiz);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating quiz:', error);
            
            // Show error in question container
            if (questionContainer) {
                questionContainer.innerHTML = `
                    <div class="quiz-error">
                        <p><i class="fas fa-exclamation-circle"></i> Failed to generate quiz: ${error.message}</p>
                        <button id="try-again-btn" class="secondary-button">Try Again</button>
                    </div>
                `;
                
                // Add event listener to try again button
                const tryAgainBtn = document.getElementById('try-again-btn');
                if (tryAgainBtn) {
                    tryAgainBtn.addEventListener('click', generateQuiz);
                }
            }
            
            // Hide loading indicator
            if (loadingQuiz) loadingQuiz.classList.add('hidden');
        }
    }
    
    // Show a specific quiz question
    function showQuestion(index) {
        if (!currentQuizData || index < 0 || index >= currentQuizData.length) return;
        
        const questionContainer = document.getElementById('question-container');
        const currentQuestionEl = document.getElementById('current-question');
        const totalQuestionsEl = document.getElementById('total-questions');
        const progressFill = document.querySelector('.progress-fill');
        const prevQuestionBtn = document.getElementById('prev-question');
        const nextQuestionBtn = document.getElementById('next-question');
        const submitQuizBtn = document.getElementById('submit-quiz');
        
        // Update question number and progress bar
        if (currentQuestionEl) currentQuestionEl.textContent = index + 1;
        if (totalQuestionsEl) totalQuestionsEl.textContent = currentQuizData.length;
        if (progressFill) {
            const progressPercentage = ((index + 1) / currentQuizData.length) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Enable/disable navigation buttons
        if (prevQuestionBtn) prevQuestionBtn.disabled = index === 0;
        
        // Show submit button on last question, next button otherwise
        if (nextQuestionBtn && submitQuizBtn) {
            if (index === currentQuizData.length - 1) {
                nextQuestionBtn.classList.add('hidden');
                submitQuizBtn.classList.remove('hidden');
            } else {
                nextQuestionBtn.classList.remove('hidden');
                submitQuizBtn.classList.add('hidden');
            }
        }
        
        // Display the current question
        const currentQuestion = currentQuizData[index];
        
        if (questionContainer) {
            // Create question content
            let questionHTML = `
                <div class="quiz-question">
                    <h3>${index + 1}. ${currentQuestion.question}</h3>
                    <div class="quiz-options">
            `;
            
            // Add options as radio buttons
            currentQuestion.options.forEach((option, optionIndex) => {
                const optionId = `option-${index}-${optionIndex}`;
                const isChecked = quizAnswers[index] === option ? 'checked' : '';
                
                questionHTML += `
                    <div class="quiz-option">
                        <input type="radio" id="${optionId}" name="question-${index}" value="${option}" ${isChecked}>
                        <label for="${optionId}">${option}</label>
                    </div>
                `;
            });
            
            questionHTML += `
                    </div>
                </div>
            `;
            
            questionContainer.innerHTML = questionHTML;
            
            // Add event listeners to radio buttons
            const radioButtons = questionContainer.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    // Update answers array when user selects an option
                    quizAnswers[index] = e.target.value;
                });
            });
        }
    }
    
    // Show the previous question
    function showPreviousQuestion() {
        if (currentQuizQuestion > 0) {
            currentQuizQuestion--;
            showQuestion(currentQuizQuestion);
        }
    }
    
    // Show the next question
    function showNextQuestion() {
        if (currentQuizData && currentQuizQuestion < currentQuizData.length - 1) {
            currentQuizQuestion++;
            showQuestion(currentQuizQuestion);
        }
    }
    
    // Submit the quiz and show results
    function submitQuiz() {
        if (!currentQuizData || currentQuizData.length === 0) return;
        
        // Calculate score
        let correctAnswers = 0;
        let unansweredQuestions = 0;
        
        currentQuizData.forEach((question, index) => {
            if (quizAnswers[index] === null) {
                unansweredQuestions++;
            } else if (quizAnswers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        const totalQuestions = currentQuizData.length;
        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        // Hide question container and controls
        const questionContainer = document.getElementById('question-container');
        if (questionContainer) questionContainer.classList.add('hidden');
        if (quizControls) quizControls.classList.add('hidden');
        
        // Show results
        if (quizResults) {
            // Determine result message based on score
            let resultMessage = '';
            let resultIcon = '';
            
            if (scorePercentage >= 90) {
                resultMessage = 'Outstanding! You\'ve mastered this material!';
                resultIcon = 'trophy';
            } else if (scorePercentage >= 70) {
                resultMessage = 'Great job! You have a good understanding of the topic.';
                resultIcon = 'award';
            } else if (scorePercentage >= 50) {
                resultMessage = 'Good effort! You\'re making progress.';
                resultIcon = 'thumbs-up';
            } else {
                resultMessage = 'Keep practicing! You\'ll get better with more study.';
                resultIcon = 'book';
            }
            
            // Build results HTML
            let resultsHTML = `
                <div class="quiz-score">
                    <i class="fas fa-${resultIcon} quiz-score-icon"></i>
                    <h2>Your Score: ${correctAnswers}/${totalQuestions} (${scorePercentage}%)</h2>
                    <p>${resultMessage}</p>
                `;
                
            // Add warning for unanswered questions if any
            if (unansweredQuestions > 0) {
                resultsHTML += `
                    <p class="unanswered-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        You left ${unansweredQuestions} question${unansweredQuestions > 1 ? 's' : ''} unanswered.
                    </p>
                `;
            }
            
            // Add review section
            resultsHTML += `
                    <div class="quiz-review-section">
                        <h3>Review Questions</h3>
                        <div class="quiz-review">
            `;
            
            // Add each question with the correct answer and user's answer
            currentQuizData.forEach((question, index) => {
                const userAnswer = quizAnswers[index];
                const isCorrect = userAnswer === question.correct;
                const statusClass = userAnswer === null ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect');
                
                resultsHTML += `
                    <div class="review-question ${statusClass}">
                        <p class="question-text">${index + 1}. ${question.question}</p>
                        <p class="correct-answer">Correct answer: <strong>${question.correct}</strong></p>
                `;
                
                if (userAnswer !== null) {
                    resultsHTML += `
                        <p class="user-answer">Your answer: <strong>${userAnswer}</strong></p>
                    `;
                } else {
                    resultsHTML += `
                        <p class="user-answer">Your answer: <em>Not answered</em></p>
                    `;
                }
                
                resultsHTML += `</div>`;
            });
            
            // Add buttons to retake or create new quiz
            resultsHTML += `
                        </div>
                    </div>
                    <div class="quiz-action-buttons">
                        <button id="new-quiz-btn" class="primary-button"><i class="fas fa-sync"></i> Generate New Quiz</button>
                        <button id="close-results-btn" class="secondary-button"><i class="fas fa-times"></i> Close</button>
                    </div>
                </div>
            `;
            
            quizResults.innerHTML = resultsHTML;
            quizResults.classList.remove('hidden');
            
            // Add event listeners to buttons
            const newQuizBtn = document.getElementById('new-quiz-btn');
            const closeResultsBtn = document.getElementById('close-results-btn');
            
            if (newQuizBtn) {
                newQuizBtn.addEventListener('click', () => {
                    quizResults.classList.add('hidden');
                    if (questionContainer) questionContainer.classList.remove('hidden');
                    generateQuiz();
                });
            }
            
            if (closeResultsBtn) {
                closeResultsBtn.addEventListener('click', hideQuizModeScreen);
            }
        }
    }

    // Tool management system
    let activeToolModal = null;

    // Initialize tool modals
    function initToolModals() {
        console.log("Initializing tool modals system...");
        
        // Add tool-modal class to existing modals
        if (mainPdfConverter) {
            mainPdfConverter.classList.add('tool-modal');
        }
        
        if (quizModeScreen) {
            quizModeScreen.classList.add('tool-modal');
        }
        
        if (teacherModeScreen) {
            teacherModeScreen.classList.add('tool-modal');
        }
        
        // Set up proper close buttons
        if (closeConverterBtn) {
            closeConverterBtn.addEventListener('click', hideAllToolSections);
        }
        
        if (closeQuizMode) {
            closeQuizMode.addEventListener('click', hideAllToolSections);
        }
        
        if (closeTeacherMode) {
            closeTeacherMode.addEventListener('click', hideAllToolSections);
        }
        
        // Update tool click handlers
        if (quizGenerator) {
            // Remove old event listener
            const oldListeners = getEventListeners(quizGenerator);
            if (oldListeners && oldListeners.click) {
                for (const listener of oldListeners.click) {
                    quizGenerator.removeEventListener('click', listener.listener);
                }
            }
            
            // Add new event listener
            quizGenerator.addEventListener('click', () => {
                console.log("Quiz generator clicked");
                showToolSection(quizGenerator);
                if (!quizModeScreen) {
                    quizModeScreen = createQuizModeScreen();
                }
                quizModeScreen.classList.add('visible');
                resetQuizState();
                generateQuiz();
            });
        }
        
        if (teacherModeOption) {
            // Remove old event listener
            const oldListeners = getEventListeners(teacherModeOption);
            if (oldListeners && oldListeners.click) {
                for (const listener of oldListeners.click) {
                    teacherModeOption.removeEventListener('click', listener.listener);
                }
            }
            
            // Add new event listener
            teacherModeOption.addEventListener('click', () => {
                console.log("Teacher mode clicked");
                showToolSection(teacherModeOption);
                if (!teacherModeScreen) {
                    teacherModeScreen = createTeacherModeScreen();
                }
                teacherModeScreen.classList.add('visible');
                updateActiveTeacherDisplay();
            });
        }
        
        // Add click outside listener to close modals
        document.addEventListener('click', function(event) {
            if (activeToolModal && 
                !event.target.closest('.tool-modal') && 
                !event.target.closest('.tool-item') && 
                !event.target.closest('.header-btn')) {
                console.log("Clicked outside modal, closing");
                hideAllToolSections();
            }
        });
    }

    // Hide all tool sections
    function hideAllToolSections() {
        console.log("Hiding all tool sections");
        
        // Hide PDF converter
        if (mainPdfConverter) {
            mainPdfConverter.classList.remove('visible');
        }
        
        // Hide quiz generator
        if (quizModeScreen) {
            quizModeScreen.classList.remove('visible');
        }
        
        // Hide teacher mode
        if (teacherModeScreen) {
            teacherModeScreen.classList.remove('visible');
        }
        
        // Remove any overlay
        const existingOverlay = document.querySelector('.modal-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Reset active tool
        activeToolModal = null;
        
        // Show chat container
        if (chatContainer) {
            chatContainer.style.display = 'flex';
        }
    }

    // Show a tool section and hide others
    function showToolSection(toolElement) {
        if (!toolElement) return;
        
        console.log("Showing tool section for", toolElement.id);
        
        // Hide any open tool first
        hideAllToolSections();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        // Hide chat container
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        
        // Set active tool
        activeToolModal = toolElement;
        
        // Set this tool as active in the sidebar
        setActiveTool(toolElement);
        
        return overlay;
    }

    // Helper function to get event listeners (simplified version since we can't directly access event listeners)
    function getEventListeners(element) {
        // This is a simplified version since browsers don't expose listeners directly
        // In a real implementation, we would use a more robust approach
        return null;
    }

    // Quiz Generator and Teacher Mode event listeners
    if (quizGenerator) {
        // Remove any existing event listeners
        quizGenerator.replaceWith(quizGenerator.cloneNode(true));
        
        // Get the fresh element after replacing
        quizGenerator = document.getElementById('quiz-generator');
        
        // Add new event listener with direct modal approach
        quizGenerator.addEventListener('click', () => {
            console.log("Quiz generator clicked");
            
            // Create overlay for modal appearance
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
            
            // Hide chat container
            if (chatContainer) {
                chatContainer.style.display = 'none';
            }
            
            // Hide any other open tool modals
            if (mainPdfConverter) mainPdfConverter.classList.remove('visible');
            if (teacherModeScreen) teacherModeScreen.classList.remove('visible');
            
            // Create quiz screen if it doesn't exist
            if (!quizModeScreen) {
                quizModeScreen = createQuizModeScreen();
                quizModeScreen.classList.add('tool-modal');
            }
            
            // Show quiz modal and mark as active
            quizModeScreen.classList.add('visible');
            setActiveTool(quizGenerator);
            activeToolModal = quizGenerator;
            
            // Set up close button
            if (closeQuizMode) {
                // Remove any existing listeners
                const newCloseBtn = closeQuizMode.cloneNode(true);
                closeQuizMode.parentNode.replaceChild(newCloseBtn, closeQuizMode);
                closeQuizMode = newCloseBtn;
                
                // Add listener to close button
                closeQuizMode.addEventListener('click', () => {
                    quizModeScreen.classList.remove('visible');
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (chatContainer) chatContainer.style.display = 'flex';
                    activeToolModal = null;
                });
            }
            
            // Initialize quiz
            resetQuizState();
            generateQuiz();
        });
    }

    if (teacherModeOption) {
        // Remove any existing event listeners
        teacherModeOption.replaceWith(teacherModeOption.cloneNode(true));
        
        // Get the fresh element after replacing
        teacherModeOption = document.getElementById('teacher-mode');
        
        // Add new event listener with direct modal approach
        teacherModeOption.addEventListener('click', () => {
            console.log("Teacher mode clicked");
            
            // Create overlay for modal appearance
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
            
            // Hide chat container
            if (chatContainer) {
                chatContainer.style.display = 'none';
            }
            
            // Hide any other open tool modals
            if (mainPdfConverter) mainPdfConverter.classList.remove('visible');
            if (quizModeScreen) quizModeScreen.classList.remove('visible');
            
            // Create teacher mode screen if it doesn't exist
            if (!teacherModeScreen) {
                teacherModeScreen = createTeacherModeScreen();
                teacherModeScreen.classList.add('tool-modal');
            }
            
            // Show teacher mode modal and mark as active
            teacherModeScreen.classList.add('visible');
            setActiveTool(teacherModeOption);
            activeToolModal = teacherModeOption;
            
            // Set up close button
            if (closeTeacherMode) {
                // Remove any existing listeners
                const newCloseBtn = closeTeacherMode.cloneNode(true);
                closeTeacherMode.parentNode.replaceChild(newCloseBtn, closeTeacherMode);
                closeTeacherMode = newCloseBtn;
                
                // Add listener to close button
                closeTeacherMode.addEventListener('click', () => {
                    teacherModeScreen.classList.remove('visible');
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (chatContainer) chatContainer.style.display = 'flex';
                    activeToolModal = null;
                });
            }
            
            // Refresh teachers list and update display
            fetchAllTeachers();
            updateActiveTeacherDisplay();
        });
    }
    
    // Add direct event listeners for Quiz Generator and Teacher Mode
    document.addEventListener('DOMContentLoaded', function() {
        // Get the elements from the sidebar
        const quizGeneratorBtn = document.getElementById('quiz-generator');
        const teacherModeBtn = document.getElementById('teacher-mode');
        
        // Get the modal screens
        const quizGeneratorScreen = document.getElementById('quiz-generator-screen');
        const teacherModeScreen = document.getElementById('teacher-mode-screen');
        
        // Get close buttons
        const closeQuizBtn = document.getElementById('close-quiz-btn');
        const closeTeacherBtn = document.getElementById('close-teacher-mode');
        
        // Get the chat container
        const chatContainer = document.getElementById('chat-container');
        
        // Add click event for Quiz Generator
        if (quizGeneratorBtn) {
            quizGeneratorBtn.addEventListener('click', function() {
                console.log('Quiz Generator button clicked');
                // Hide chat container
                if (chatContainer) chatContainer.style.display = 'none';
                // Show quiz screen
                if (quizGeneratorScreen) {
                    quizGeneratorScreen.style.display = 'block';
                    // Generate a quiz if needed
                    const generateQuizBtn = document.getElementById('generate-quiz-btn');
                    if (generateQuizBtn) {
                        generateQuizBtn.click(); // Auto-generate quiz
                    }
                }
            });
        }
        
        // Add click event for Teacher Mode
        if (teacherModeBtn) {
            teacherModeBtn.addEventListener('click', function() {
                console.log('Teacher Mode button clicked');
                // Hide chat container
                if (chatContainer) chatContainer.style.display = 'none';
                // Show teacher mode screen
                if (teacherModeScreen) {
                    teacherModeScreen.style.display = 'block';
                    teacherModeScreen.classList.remove('hidden');
                }
            });
        }
        
        // Add click event for close buttons
        if (closeQuizBtn) {
            closeQuizBtn.addEventListener('click', function() {
                console.log('Close Quiz button clicked');
                // Hide quiz screen
                if (quizGeneratorScreen) quizGeneratorScreen.style.display = 'none';
                // Show chat container
                if (chatContainer) chatContainer.style.display = 'flex';
            });
        }
        
        if (closeTeacherBtn) {
            closeTeacherBtn.addEventListener('click', function() {
                console.log('Close Teacher button clicked');
                // Hide teacher mode screen
                if (teacherModeScreen) {
                    teacherModeScreen.style.display = 'none';
                    teacherModeScreen.classList.add('hidden');
                }
                // Show chat container
                if (chatContainer) chatContainer.style.display = 'flex';
            });
        }
    });
});

// Direct event handler for Quiz Generator and Teacher Mode
document.addEventListener('DOMContentLoaded', function() {
    console.log("Direct handler loaded");
    
    // Simple direct event handler for Quiz Generator
    document.getElementById('quiz-generator').onclick = function() {
        console.log("Quiz Generator clicked");
        document.getElementById('chat-container').style.display = 'none';
        document.getElementById('quiz-generator-screen').style.display = 'block';
        document.getElementById('quiz-generator-screen').classList.remove('hidden');
    };
    
    // Simple direct event handler for Teacher Mode
    document.getElementById('teacher-mode').onclick = function() {
        console.log("Teacher Mode clicked");
        document.getElementById('chat-container').style.display = 'none';
        document.getElementById('teacher-mode-screen').style.display = 'block';
        document.getElementById('teacher-mode-screen').classList.remove('hidden');
    };
    
    // Simple direct event handler for closing Quiz Generator
    document.getElementById('close-quiz-btn').onclick = function() {
        console.log("Close Quiz clicked");
        document.getElementById('quiz-generator-screen').style.display = 'none';
        document.getElementById('chat-container').style.display = 'flex';
    };
    
    // Simple direct event handler for closing Teacher Mode
    document.getElementById('close-teacher-mode').onclick = function() {
        console.log("Close Teacher Mode clicked");
        document.getElementById('teacher-mode-screen').style.display = 'none';
        document.getElementById('teacher-mode-screen').classList.add('hidden');
        document.getElementById('chat-container').style.display = 'flex';
    };
});

// Fix for Quiz Generator
(function() {
    // Execute this immediately when the script loads
    window.addEventListener('load', function() {
        console.log("Applying standalone fix for Quiz Generator");
        
        // Get the elements we need
        const quizGeneratorBtn = document.getElementById('quiz-generator');
        const quizGeneratorScreen = document.getElementById('quiz-generator-screen');
        const closeQuizBtn = document.getElementById('close-quiz-btn');
        const chatContainer = document.getElementById('chat-container');
        
        if (quizGeneratorBtn && quizGeneratorScreen && closeQuizBtn && chatContainer) {
            // Remove any existing event listeners by cloning and replacing the element
            const newQuizBtn = quizGeneratorBtn.cloneNode(true);
            quizGeneratorBtn.parentNode.replaceChild(newQuizBtn, quizGeneratorBtn);
            
            const newCloseBtn = closeQuizBtn.cloneNode(true);
            closeQuizBtn.parentNode.replaceChild(newCloseBtn, closeQuizBtn);
            
            // Add our direct event handlers with highest priority using onclick
            newQuizBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Quiz Generator being shown (fixed handler)");
                
                // Hide chat container
                chatContainer.style.display = 'none';
                
                // Show quiz generator screen
                quizGeneratorScreen.style.display = 'block';
                quizGeneratorScreen.classList.remove('hidden');
                
                // Attempt to trigger quiz generation
                const generateQuizBtn = document.getElementById('generate-quiz-btn');
                if (generateQuizBtn) {
                    setTimeout(function() {
                        generateQuizBtn.click();
                    }, 100);
                }
                
                return false;
            };
            
            // Add close button handler
            newCloseBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Quiz Generator being hidden (fixed handler)");
                
                // Hide quiz generator screen
                quizGeneratorScreen.style.display = 'none';
                
                // Show chat container
                chatContainer.style.display = 'flex';
                
                return false;
            };
            
            console.log("Quiz Generator fix applied successfully");
        } else {
            console.error("Could not find all required elements for Quiz Generator fix");
        }
    });
})();

// Enhanced Quiz Generator functionality
function initEnhancedQuizGenerator() {
    console.log("Initializing enhanced Quiz Generator");
    
    // Elements
    const quizGeneratorScreen = document.getElementById('quiz-generator-screen');
    const closeQuizBtn = document.getElementById('close-quiz-btn');
    const chatContainer = document.getElementById('chat-container');
    
    // Quiz source selection
    const quizSourceSelection = document.getElementById('quiz-source-selection');
    const chatSourceBtn = document.getElementById('chat-source-btn');
    const syllabusSourceBtn = document.getElementById('syllabus-source-btn');
    
    // Chat source options
    const chatSourceOptions = document.getElementById('chat-source-options');
    const chatSourceBack = document.getElementById('chat-source-back');
    const chatSessionSelect = document.getElementById('chat-session-select');
    const chatQuestionCount = document.getElementById('chat-question-count');
    const generateChatQuizBtn = document.getElementById('generate-chat-quiz-btn');
    
    // Syllabus source options
    const syllabusSourceOptions = document.getElementById('syllabus-source-options');
    const syllabusSourceBack = document.getElementById('syllabus-source-back');
    const syllabusText = document.getElementById('syllabus-text');
    const syllabusQuestionCount = document.getElementById('syllabus-question-count');
    const generateSyllabusQuizBtn = document.getElementById('generate-syllabus-quiz-btn');
    
    // Quiz panels
    const quizLoading = document.getElementById('quiz-loading');
    const loadingMessage = document.getElementById('loading-message');
    const quizQuestions = document.getElementById('quiz-questions');
    const quizResults = document.getElementById('quiz-results');
    const quizError = document.getElementById('quiz-error');
    
    // Quiz question elements
    const currentQuestionNum = document.getElementById('current-question-num');
    const totalQuestions = document.getElementById('total-questions');
    const quizProgressFill = document.getElementById('quiz-progress-fill');
    const quizQuestionText = document.getElementById('quiz-question-text');
    const quizOptionsContainer = document.getElementById('quiz-options-container');
    
    // Quiz navigation
    const quizPrevBtn = document.getElementById('quiz-prev-btn');
    const quizNextBtn = document.getElementById('quiz-next-btn');
    const quizSubmitBtn = document.getElementById('quiz-submit-btn');
    
    // Quiz results elements
    const quizScoreText = document.getElementById('quiz-score-text');
    const quizScorePercent = document.getElementById('quiz-score-percent');
    const scoreMessage = document.getElementById('score-message');
    const quizReviewList = document.getElementById('quiz-review-list');
    const newQuizBtn = document.getElementById('new-quiz-btn');
    const quizDiscussBtn = document.getElementById('quiz-discuss-btn');
    
    // Quiz error elements
    const quizErrorMessage = document.getElementById('quiz-error-message');
    const quizRetryBtn = document.getElementById('quiz-retry-btn');
    
    // Quiz state variables
    let currentQuiz = null; // stores the current quiz data
    let currentQuestionIndex = 0; // current question index
    let userAnswers = []; // user's answers
    let quizSource = 'chat'; // default source
    
    // Show the quiz generator screen
    function showQuizGenerator() {
        if (!quizGeneratorScreen) return;
        
        console.log("Showing enhanced Quiz Generator");
        
        // Hide chat container
        chatContainer.style.display = 'none';
        
        // Show quiz generator screen
        quizGeneratorScreen.style.display = 'block';
        
        // Show source selection by default
        resetQuizState();
        
        // Load chat sessions for the dropdown
        loadChatSessionsForQuiz();
    }
    
    // Hide the quiz generator screen
    function hideQuizGenerator() {
        if (!quizGeneratorScreen) return;
        
        quizGeneratorScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
    
    // Reset quiz state and show source selection
    function resetQuizState() {
        // Reset quiz data
        currentQuiz = null;
        currentQuestionIndex = 0;
        userAnswers = [];
        
        // Show source selection panel
        quizSourceSelection.classList.remove('hidden');
        chatSourceOptions.classList.add('hidden');
        syllabusSourceOptions.classList.add('hidden');
        quizLoading.classList.add('hidden');
        quizQuestions.classList.add('hidden');
        quizResults.classList.add('hidden');
        quizError.classList.add('hidden');
    }
    
    // Load chat sessions for the dropdown
    function loadChatSessionsForQuiz() {
        fetch('/api/sessions')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch sessions');
                return response.json();
            })
            .then(data => {
                // Clear dropdown except for the current session option
                while (chatSessionSelect.options.length > 1) {
                    chatSessionSelect.remove(1);
                }
                
                // Add all sessions
                if (data.sessions && data.sessions.length > 0) {
                    data.sessions.forEach(session => {
                        const option = document.createElement('option');
                        option.value = session.session_id;
                        option.textContent = session.name || 'Unnamed Chat';
                        chatSessionSelect.appendChild(option);
                    });
                    
                    // Set current session as selected
                    if (currentSessionId) {
                        chatSessionSelect.value = currentSessionId;
                    }
                }
            })
            .catch(error => {
                console.error('Error loading chat sessions:', error);
                showStatusMessage('error', 'Failed to load chat sessions');
            });
    }
    
    // Show chat source options
    function showChatSourceOptions() {
        quizSourceSelection.classList.add('hidden');
        chatSourceOptions.classList.remove('hidden');
        quizSource = 'chat';
    }
    
    // Show syllabus source options
    function showSyllabusSourceOptions() {
        quizSourceSelection.classList.add('hidden');
        syllabusSourceOptions.classList.remove('hidden');
        quizSource = 'syllabus';
    }
    
    // Generate quiz from chat history
    function generateChatQuiz() {
        const sessionId = chatSessionSelect.value;
        const questionCount = parseInt(chatQuestionCount.value);
        
        if (!sessionId) {
            showStatusMessage('error', 'Please select a chat session');
            return;
        }
        
        // Show loading panel
        chatSourceOptions.classList.add('hidden');
        quizLoading.classList.remove('hidden');
        loadingMessage.textContent = 'Generating quiz based on your chat history...';
        
        // Clear previous quiz data
        currentQuiz = null;
        userAnswers = [];
        
        console.log(`Generating quiz from chat history, session: ${sessionId}, questions: ${questionCount}`);
        
        // Make API request to generate quiz
        fetch(`/generate-quiz?session_id=${sessionId}&count=${questionCount}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to generate quiz');
            return response.json();
        })
        .then(data => {
            if (!data.questions || data.questions.length === 0) {
                throw new Error('No quiz questions were generated');
            }
            
            // Store quiz data
            currentQuiz = data.questions;
            userAnswers = new Array(currentQuiz.length).fill(null);
            currentQuestionIndex = 0;
            
            // Show first question
            showQuestion(0);
            
            // Hide loading, show questions
            quizLoading.classList.add('hidden');
            quizQuestions.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error generating quiz:', error);
            quizLoading.classList.add('hidden');
            quizError.classList.remove('hidden');
            quizErrorMessage.textContent = error.message || 'Failed to generate quiz. Please try again.';
        });
    }
    
    // Generate quiz from syllabus text
    function generateSyllabusQuiz() {
        const text = syllabusText.value.trim();
        const questionCount = parseInt(syllabusQuestionCount.value);
        
        if (!text) {
            showStatusMessage('error', 'Please enter some syllabus text');
            return;
        }
        
        // Show loading panel
        syllabusSourceOptions.classList.add('hidden');
        quizLoading.classList.remove('hidden');
        loadingMessage.textContent = 'Generating quiz based on your syllabus...';
        
        // Clear previous quiz data
        currentQuiz = null;
        userAnswers = [];
        
        console.log(`Generating quiz from syllabus, length: ${text.length}, questions: ${questionCount}`);
        
        // Make API request to generate quiz
        fetch('/generate-syllabus-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                count: questionCount
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to generate quiz');
            return response.json();
        })
        .then(data => {
            if (!data.questions || data.questions.length === 0) {
                throw new Error('No quiz questions were generated');
            }
            
            // Store quiz data
            currentQuiz = data.questions;
            userAnswers = new Array(currentQuiz.length).fill(null);
            currentQuestionIndex = 0;
            
            // Show first question
            showQuestion(0);
            
            // Hide loading, show questions
            quizLoading.classList.add('hidden');
            quizQuestions.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error generating quiz:', error);
            quizLoading.classList.add('hidden');
            quizError.classList.remove('hidden');
            quizErrorMessage.textContent = error.message || 'Failed to generate quiz. Please try again.';
        });
    }
    
    // Show a specific question
    function showQuestion(index) {
        if (!currentQuiz || index < 0 || index >= currentQuiz.length) return;
        
        currentQuestionIndex = index;
        const question = currentQuiz[index];
        
        // Update UI elements
        currentQuestionNum.textContent = index + 1;
        totalQuestions.textContent = currentQuiz.length;
        quizProgressFill.style.width = `${((index + 1) / currentQuiz.length) * 100}%`;
        quizQuestionText.textContent = question.question;
        
        // Generate options
        quizOptionsContainer.innerHTML = '';
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option';
            
            const id = `option-${index}-${optionIndex}`;
            const isChecked = userAnswers[index] === option ? 'checked' : '';
            
            optionElement.innerHTML = `
                <input type="radio" id="${id}" name="question-${index}" value="${option}" ${isChecked}>
                <label for="${id}">${option}</label>
            `;
            
            // Add event listener to update answer when selected
            const radioInput = optionElement.querySelector('input');
            radioInput.addEventListener('change', () => {
                userAnswers[currentQuestionIndex] = option;
            });
            
            quizOptionsContainer.appendChild(optionElement);
        });
        
        // Update navigation buttons
        quizPrevBtn.disabled = index === 0;
        
        if (index === currentQuiz.length - 1) {
            quizNextBtn.classList.add('hidden');
            quizSubmitBtn.classList.remove('hidden');
        } else {
            quizNextBtn.classList.remove('hidden');
            quizSubmitBtn.classList.add('hidden');
        }
    }
    
    // Show the next question
    function showNextQuestion() {
        if (currentQuestionIndex < currentQuiz.length - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    }
    
    // Show the previous question
    function showPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    }
    
    // Submit the quiz and show results
    function submitQuiz() {
        if (!currentQuiz || currentQuiz.length === 0) return;
        
        // Calculate score
        let correctCount = 0;
        let unansweredCount = 0;
        
        currentQuiz.forEach((question, index) => {
            if (userAnswers[index] === null) {
                unansweredCount++;
            } else if (userAnswers[index] === question.correct) {
                correctCount++;
            }
        });
        
        const totalCount = currentQuiz.length;
        const scorePercent = Math.round((correctCount / totalCount) * 100);
        
        // Update results UI
        quizScoreText.textContent = `${correctCount}/${totalCount}`;
        quizScorePercent.textContent = `${scorePercent}%`;
        
        // Set score message based on percentage
        if (scorePercent >= 90) {
            scoreMessage.textContent = 'Excellent! You have mastered this content!';
        } else if (scorePercent >= 70) {
            scoreMessage.textContent = 'Great job! You have a good understanding of the material.';
        } else if (scorePercent >= 50) {
            scoreMessage.textContent = 'Good effort! Keep studying to improve your score.';
        } else {
            scoreMessage.textContent = 'Keep practicing! You\'ll get better with more study.';
        }
        
        // Generate review list
        quizReviewList.innerHTML = '';
        currentQuiz.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            const statusClass = userAnswer === null ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect');
            
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-question ${statusClass}`;
            
            reviewItem.innerHTML = `
                <p class="question-text">${index + 1}. ${question.question}</p>
                <p class="correct-answer">Correct answer: <strong>${question.correct}</strong></p>
            `;
            
            if (userAnswer === null) {
                reviewItem.innerHTML += `<p class="user-answer">Your answer: <em>Not answered</em></p>`;
            } else {
                reviewItem.innerHTML += `<p class="user-answer">Your answer: <strong>${userAnswer}</strong></p>`;
            }
            
            quizReviewList.appendChild(reviewItem);
        });
        
        // Show results panel
        quizQuestions.classList.add('hidden');
        quizResults.classList.remove('hidden');
    }
    
    // Start a new quiz
    function startNewQuiz() {
        resetQuizState();
    }
    
    // Discuss quiz in chat
    function discussQuizInChat() {
        // Create a message summarizing the quiz results
        let message = `I just took a quiz with ${currentQuiz.length} questions and scored ${quizScoreText.textContent} (${quizScorePercent.textContent}).\n\n`;
        
        // Add some questions that were answered incorrectly
        const incorrectQuestions = currentQuiz.filter((q, i) => userAnswers[i] !== q.correct && userAnswers[i] !== null);
        if (incorrectQuestions.length > 0) {
            message += "I had trouble with these questions:\n";
            incorrectQuestions.slice(0, 3).forEach((q, i) => {
                message += `${i+1}. ${q.question}\n`;
            });
            message += "\nCan you help me understand these concepts better?";
        } else {
            message += "Can you explain some of these concepts in more detail or give me more advanced questions?";
        }
        
        // Hide quiz generator and show chat
        hideQuizGenerator();
        
        // Add message to input and focus
        userInput.value = message;
        userInput.focus();
        
        // Adjust height of textarea
        if (typeof adjustInputHeight === 'function') {
            adjustInputHeight();
        }
    }
    
    // Event listeners
    if (closeQuizBtn) {
        closeQuizBtn.addEventListener('click', hideQuizGenerator);
    }
    
    if (chatSourceBtn) {
        chatSourceBtn.addEventListener('click', showChatSourceOptions);
    }
    
    if (syllabusSourceBtn) {
        syllabusSourceBtn.addEventListener('click', showSyllabusSourceOptions);
    }
    
    if (chatSourceBack) {
        chatSourceBack.addEventListener('click', resetQuizState);
    }
    
    if (syllabusSourceBack) {
        syllabusSourceBack.addEventListener('click', resetQuizState);
    }
    
    if (generateChatQuizBtn) {
        generateChatQuizBtn.addEventListener('click', generateChatQuiz);
    }
    
    if (generateSyllabusQuizBtn) {
        generateSyllabusQuizBtn.addEventListener('click', generateSyllabusQuiz);
    }
    
    if (quizPrevBtn) {
        quizPrevBtn.addEventListener('click', showPreviousQuestion);
    }
    
    if (quizNextBtn) {
        quizNextBtn.addEventListener('click', showNextQuestion);
    }
    
    if (quizSubmitBtn) {
        quizSubmitBtn.addEventListener('click', submitQuiz);
    }
    
    if (newQuizBtn) {
        newQuizBtn.addEventListener('click', startNewQuiz);
    }
    
    if (quizDiscussBtn) {
        quizDiscussBtn.addEventListener('click', discussQuizInChat);
    }
    
    if (quizRetryBtn) {
        quizRetryBtn.addEventListener('click', () => {
            quizError.classList.add('hidden');
            if (quizSource === 'chat') {
                chatSourceOptions.classList.remove('hidden');
            } else {
                syllabusSourceOptions.classList.remove('hidden');
            }
        });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM loaded for enhanced Quiz Generator");
    });
    
    // Return public interface
    return {
        show: showQuizGenerator,
        hide: hideQuizGenerator,
        reset: resetQuizState
    };
}

// Direct fix for Quiz Generator button
window.addEventListener('load', function() {
    console.log("Applying enhanced Quiz Generator fix");
    
    // Get elements
    const quizGeneratorBtn = document.getElementById('quiz-generator');
    const chatContainer = document.getElementById('chat-container');
    const quizGeneratorScreen = document.getElementById('quiz-generator-screen');
    
    // Initialize enhanced quiz generator
    const enhancedQuizGenerator = initEnhancedQuizGenerator();
    
    // Add direct event handler to quiz generator button
    if (quizGeneratorBtn) {
        const newQuizBtn = quizGeneratorBtn.cloneNode(true);
        quizGeneratorBtn.parentNode.replaceChild(newQuizBtn, quizGeneratorBtn);
        
        newQuizBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Quiz Generator button clicked (enhanced)");
            
            // Hide chat container
            if (chatContainer) {
                chatContainer.style.display = 'none';
            }
            
            // Show quiz generator screen and initialize
            if (quizGeneratorScreen) {
                quizGeneratorScreen.style.display = 'block';
                enhancedQuizGenerator.show();
            }
            
            return false;
        };
    }
});

// Prompt Library functionality
const promptLibraryBtn = document.getElementById('prompt-library');
const promptLibraryScreen = document.getElementById('prompt-library-screen');
const closePromptLibrary = document.getElementById('close-prompt-library');
const defaultPromptsTab = document.getElementById('default-prompts-tab');
const myPromptsTab = document.getElementById('my-prompts-tab');
const defaultPromptsContent = document.getElementById('default-prompts-content');
const myPromptsContent = document.getElementById('my-prompts-content');
const customPromptsContainer = document.getElementById('custom-prompts-container');
const emptyPromptsMessage = document.getElementById('empty-prompts-message');
const promptTitle = document.getElementById('prompt-title');
const promptText = document.getElementById('prompt-text');
const savePromptBtn = document.getElementById('save-prompt-btn');

// Previous Year Paper Generator functionality
const paperGeneratorBtn = document.getElementById('paper-generator');
const paperGeneratorScreen = document.getElementById('paper-generator-screen');
const closePaperGenerator = document.getElementById('close-paper-generator');
const syllabusContent = document.getElementById('syllabus-content');
const generatePaperBtn = document.getElementById('generate-paper-btn');
const paperLoading = document.getElementById('paper-loading');
const paperResult = document.getElementById('paper-result');
const downloadPaperBtn = document.getElementById('download-paper-btn');

// Default prompts list
const defaultPrompts = [
    {
        title: "Study Plan Creator",
        text: "Create a detailed study plan for me on the topic of [SUBJECT]. Include daily goals, resources to use, and milestones to track progress. The plan should span over [TIME PERIOD] days/weeks."
    },
    {
        title: "Concept Explainer",
        text: "Explain the concept of [CONCEPT] in simple terms first, then provide increasingly detailed explanations. Include real-world examples and applications."
    },
    {
        title: "Problem Solver",
        text: "I'm struggling with this problem: [PROBLEM DESCRIPTION]. Please help me understand how to solve it step by step and explain the reasoning behind each step."
    },
    {
        title: "Exam Preparation",
        text: "I have an exam on [SUBJECT] in [TIME PERIOD]. Help me create a comprehensive review strategy, focusing on key concepts, common question types, and effective study techniques."
    },
    {
        title: "Note Summarizer",
        text: "Summarize the following notes on [SUBJECT] into a concise, organized format with bullet points highlighting the key concepts: [PASTE NOTES HERE]"
    }
];

// Initialize Prompt Library
function initPromptLibrary() {
    // Load default prompts
    renderDefaultPrompts();
    
    // Load custom prompts from localStorage
    loadCustomPrompts();
    
    // Add event listeners
    if (promptLibraryBtn) {
        promptLibraryBtn.addEventListener('click', showPromptLibrary);
    }
    
    if (closePromptLibrary) {
        closePromptLibrary.addEventListener('click', hidePromptLibrary);
    }
    
    if (defaultPromptsTab) {
        defaultPromptsTab.addEventListener('click', () => {
            defaultPromptsTab.classList.add('active');
            myPromptsTab.classList.remove('active');
            defaultPromptsContent.classList.remove('hidden');
            myPromptsContent.classList.add('hidden');
        });
    }
    
    if (myPromptsTab) {
        myPromptsTab.addEventListener('click', () => {
            myPromptsTab.classList.add('active');
            defaultPromptsTab.classList.remove('active');
            myPromptsContent.classList.remove('hidden');
            defaultPromptsContent.classList.add('hidden');
        });
    }
    
    if (savePromptBtn) {
        savePromptBtn.addEventListener('click', saveCustomPrompt);
    }
}

// Initialize Paper Generator
function initPaperGenerator() {
    if (paperGeneratorBtn) {
        paperGeneratorBtn.addEventListener('click', showPaperGenerator);
    }
    
    if (closePaperGenerator) {
        closePaperGenerator.addEventListener('click', hidePaperGenerator);
    }
    
    if (generatePaperBtn) {
        generatePaperBtn.addEventListener('click', generatePaper);
    }
    
    if (downloadPaperBtn) {
        downloadPaperBtn.addEventListener('click', downloadPaper);
    }
}

// Show Prompt Library
function showPromptLibrary() {
    if (promptLibraryScreen) {
        // Hide chat container
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        
        // Show prompt library screen
        promptLibraryScreen.classList.remove('hidden');
        promptLibraryScreen.classList.add('visible');
        
        // Set active tool
        setActiveTool(promptLibraryBtn);
    }
}

// Hide Prompt Library
function hidePromptLibrary() {
    if (promptLibraryScreen) {
        promptLibraryScreen.classList.remove('visible');
        promptLibraryScreen.classList.add('hidden');
        
        // Show chat container
        if (chatContainer) {
            chatContainer.style.display = 'flex';
        }
    }
}

// Render default prompts
function renderDefaultPrompts() {
    const promptCardsContainer = document.querySelector('#default-prompts-content .prompt-cards');
    if (!promptCardsContainer) return;
    
    promptCardsContainer.innerHTML = '';
    
    defaultPrompts.forEach(prompt => {
        const card = createPromptCard(prompt.title, prompt.text, false);
        promptCardsContainer.appendChild(card);
    });
}

// Load custom prompts from localStorage
function loadCustomPrompts() {
    if (!customPromptsContainer || !emptyPromptsMessage) return;
    
    // Get custom prompts from localStorage
    const customPrompts = getCustomPrompts();
    
    // Clear container
    customPromptsContainer.innerHTML = '';
    
    // Show empty message if no custom prompts
    if (customPrompts.length === 0) {
        emptyPromptsMessage.classList.remove('hidden');
    } else {
        emptyPromptsMessage.classList.add('hidden');
        
        // Render custom prompts
        customPrompts.forEach(prompt => {
            const card = createPromptCard(prompt.title, prompt.text, true);
            customPromptsContainer.appendChild(card);
        });
    }
}

// Create a prompt card element
function createPromptCard(title, text, isCustom) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    let actionsHtml = '';
    if (isCustom) {
        actionsHtml = `
            <div class="prompt-card-actions">
                <button class="prompt-card-action" data-action="edit" title="Edit prompt">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="prompt-card-action" data-action="delete" title="Delete prompt">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="prompt-card-header">
            <h3 class="prompt-card-title">${title}</h3>
            ${actionsHtml}
        </div>
        <p class="prompt-card-text">${text}</p>
        <div class="prompt-card-footer">
            <div class="prompt-actions">
                <button class="copy-prompt-btn" title="Copy to clipboard">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <button class="use-prompt-btn">Use Prompt</button>
        </div>
    `;
    
    // Add event listener for using the prompt
    const useBtn = card.querySelector('.use-prompt-btn');
    if (useBtn) {
        useBtn.addEventListener('click', () => {
            usePrompt(text);
        });
    }
    
    // Add event listener for copying the prompt to clipboard
    const copyBtn = card.querySelector('.copy-prompt-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyPromptToClipboard(text);
        });
    }
    
    // Add event listeners for custom prompt actions
    if (isCustom) {
        const editBtn = card.querySelector('[data-action="edit"]');
        const deleteBtn = card.querySelector('[data-action="delete"]');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editCustomPrompt(title, text);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCustomPrompt(title);
            });
        }
    }
    
    return card;
}

// Copy prompt text to clipboard
function copyPromptToClipboard(text) {
    // Create a temporary textarea element to copy from
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    
    // Select and copy the text
    tempTextarea.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempTextarea);
    
    // Show success message
    showStatusMessage('success', 'Prompt copied to clipboard!');
}

// Use a prompt in the chat
function usePrompt(promptText) {
    // Set the prompt in the user input field
    if (userInput) {
        userInput.value = promptText;
        userInput.focus();
        
        // Auto-adjust height if the function exists
        if (typeof adjustInputHeight === 'function') {
            adjustInputHeight();
        }
    }
    
    // Hide the prompt library
    hidePromptLibrary();
}

// Save custom prompt
function saveCustomPrompt() {
    const title = promptTitle.value.trim();
    const text = promptText.value.trim();
    
    if (!title || !text) {
        showStatusMessage('error', 'Please provide both a title and prompt text.');
        return;
    }
    
    // Get existing prompts
    const customPrompts = getCustomPrompts();
    
    // Check if we're editing an existing prompt or creating a new one
    const existingIndex = customPrompts.findIndex(p => p.title === title);
    
    if (existingIndex >= 0) {
        // Update existing prompt
        customPrompts[existingIndex].text = text;
        showStatusMessage('success', 'Prompt updated successfully!');
    } else {
        // Add new prompt
        customPrompts.push({ title, text });
        showStatusMessage('success', 'Prompt saved successfully!');
    }
    
    // Save to localStorage
    localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
    
    // Clear form
    promptTitle.value = '';
    promptText.value = '';
    
    // Refresh custom prompts display
    loadCustomPrompts();
}

// Edit custom prompt
function editCustomPrompt(title, text) {
    // Fill the form with prompt data
    promptTitle.value = title;
    promptText.value = text;
    
    // Scroll to form
    const addPromptSection = document.querySelector('.add-prompt-section');
    if (addPromptSection) {
        addPromptSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Focus on the text area
    promptText.focus();
}

// Delete custom prompt
function deleteCustomPrompt(title) {
    if (!confirm(`Are you sure you want to delete the prompt "${title}"?`)) {
        return;
    }
    
    // Get existing prompts
    const customPrompts = getCustomPrompts();
    
    // Remove the prompt with the matching title
    const updatedPrompts = customPrompts.filter(p => p.title !== title);
    
    // Save to localStorage
    localStorage.setItem('customPrompts', JSON.stringify(updatedPrompts));
    
    // Show success message
    showStatusMessage('success', 'Prompt deleted successfully!');
    
    // Refresh custom prompts display
    loadCustomPrompts();
}

// Get custom prompts from localStorage
function getCustomPrompts() {
    const promptsJson = localStorage.getItem('customPrompts');
    return promptsJson ? JSON.parse(promptsJson) : [];
}

// Show Paper Generator
function showPaperGenerator() {
    if (paperGeneratorScreen) {
        // Hide chat container
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        
        // Show paper generator screen
        paperGeneratorScreen.classList.remove('hidden');
        paperGeneratorScreen.classList.add('visible');
        
        // Set active tool
        setActiveTool(paperGeneratorBtn);
    }
}

// Hide Paper Generator
function hidePaperGenerator() {
    if (paperGeneratorScreen) {
        paperGeneratorScreen.classList.remove('visible');
        paperGeneratorScreen.classList.add('hidden');
        
        // Show chat container
        if (chatContainer) {
            chatContainer.style.display = 'flex';
        }
    }
}

// Generate Paper
async function generatePaper() {
    const syllabus = syllabusContent.value.trim();
    const questionCount = document.getElementById('question-count').value;
    const difficultyLevel = document.getElementById('difficulty-level').value;
    
    if (!syllabus) {
        showStatusMessage('error', 'Please enter your syllabus or course structure.');
        return;
    }
    
    // Show loading indicator
    paperLoading.classList.remove('hidden');
    paperResult.classList.add('hidden');
    generatePaperBtn.disabled = true;
    
    try {
        // Use the new direct API endpoint instead of going through the chat API
        const response = await fetch('/api/generate-question-paper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                syllabus: syllabus,
                questionCount: questionCount,
                difficultyLevel: difficultyLevel,
                sessionId: currentSessionId || ''
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate paper');
        }
        
        // Get the paper content from the response
        const data = await response.json();
        
        // Display the generated paper content
        showPaperResult(data.paperContent);
        
    } catch (error) {
        console.error('Error generating paper:', error);
        showStatusMessage('error', 'Failed to generate paper. Please try again.');
        
        // Hide loading
        paperLoading.classList.add('hidden');
    } finally {
        // Re-enable button
        generatePaperBtn.disabled = false;
    }
}

// Show the generated paper result directly in the UI
function showPaperResult(content) {
    if (!paperResult) return;
    
    // Clear previous result
    paperResult.innerHTML = '';
    
    // Create paper content section
    const paperContent = document.createElement('div');
    paperContent.className = 'paper-content';
    
    // Format the content - convert markdown to HTML
    let formattedContent = content
        .replace(/^# (.*)/gm, '<h1>$1</h1>')
        .replace(/^## (.*)/gm, '<h2>$1</h2>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Wrap lists in ul tags
    formattedContent = formattedContent.replace(/<li>(.*?)<\/li>/g, function(match) {
        return '<ul>' + match + '</ul>';
    }).replace(/<\/ul><ul>/g, '');
    
    paperContent.innerHTML = formattedContent;
    
    // Create action button for copying only
    const actionButtons = document.createElement('div');
    actionButtons.className = 'paper-actions';
    actionButtons.innerHTML = `
        <button id="copy-paper-btn" class="primary-button">
            <i class="fas fa-copy"></i> Copy to Clipboard
        </button>
    `;
    
    // Append elements
    paperResult.appendChild(paperContent);
    paperResult.appendChild(actionButtons);
    
    // Show result section
    paperLoading.classList.add('hidden');
    paperResult.classList.remove('hidden');
    
    // Add event listener to copy button
    const copyPaperBtn = document.getElementById('copy-paper-btn');
    if (copyPaperBtn) {
        copyPaperBtn.addEventListener('click', () => copyPaperToClipboard(content));
    }
}

// Copy paper content to clipboard
function copyPaperToClipboard(content) {
    // Create a temporary textarea element to copy from
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = content;
    document.body.appendChild(tempTextarea);
    
    // Select and copy the text
    tempTextarea.select();
    document.execCommand('copy');
    
    // Remove the temporary element
    document.body.removeChild(tempTextarea);
    
    // Show success message
    showStatusMessage('success', 'Paper content copied to clipboard!');
}

// Download Paper
function downloadPaper() {
    if (window.generatedPaperUrl) {
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = window.generatedPaperUrl;
        
        // Set the filename
        const difficultyLevel = document.getElementById('difficulty-level').value;
        const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        downloadLink.download = `Practice_Paper_${difficultyLevel}_${date}.pdf`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        showStatusMessage('error', 'No paper available to download. Please generate a paper first.');
    }
}

// Initialize at script load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize new features
    initPromptLibrary();
    initPaperGenerator();
});

// Direct fix for Prompt Library and Mock Question Paper Generator buttons
window.addEventListener('load', function() {
    console.log("Applying direct fix for Prompt Library and Mock Question Paper Generator");
    
    // Fix Prompt Library button
    const promptLibraryBtn = document.getElementById('prompt-library');
    const promptLibraryScreen = document.getElementById('prompt-library-screen');
    const closePromptLibrary = document.getElementById('close-prompt-library');
    
    // Fix Mock Question Paper Generator button
    const paperGeneratorBtn = document.getElementById('paper-generator');
    const paperGeneratorScreen = document.getElementById('paper-generator-screen');
    const closePaperGenerator = document.getElementById('close-paper-generator');
    
    const chatContainer = document.getElementById('chat-container');
    
    if (promptLibraryBtn && promptLibraryScreen) {
        // Remove any existing event listeners by cloning and replacing the element
        const newPromptLibraryBtn = promptLibraryBtn.cloneNode(true);
        promptLibraryBtn.parentNode.replaceChild(newPromptLibraryBtn, promptLibraryBtn);
        
        // Add direct onclick handler with highest priority
        newPromptLibraryBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Prompt Library being shown (direct handler)");
            
            // Hide chat container
            if (chatContainer) chatContainer.style.display = 'none';
            
            // Show prompt library screen
            promptLibraryScreen.style.display = 'block';
            promptLibraryScreen.classList.remove('hidden');
            promptLibraryScreen.classList.add('visible');
            
            return false;
        };
    }
    
    if (closePromptLibrary) {
        // Remove any existing event listeners by cloning and replacing the element
        const newClosePromptLibrary = closePromptLibrary.cloneNode(true);
        closePromptLibrary.parentNode.replaceChild(newClosePromptLibrary, closePromptLibrary);
        
        // Add direct onclick handler
        newClosePromptLibrary.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Prompt Library being hidden (direct handler)");
            
            // Hide prompt library screen
            promptLibraryScreen.classList.remove('visible');
            promptLibraryScreen.classList.add('hidden');
            
            // Show chat container
            if (chatContainer) chatContainer.style.display = 'flex';
            
            return false;
        };
    }
    
    if (paperGeneratorBtn && paperGeneratorScreen) {
        // Remove any existing event listeners by cloning and replacing the element
        const newPaperGeneratorBtn = paperGeneratorBtn.cloneNode(true);
        paperGeneratorBtn.parentNode.replaceChild(newPaperGeneratorBtn, paperGeneratorBtn);
        
        // Add direct onclick handler with highest priority
        newPaperGeneratorBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Mock Question Paper Generator being shown (direct handler)");
            
            // Hide chat container
            if (chatContainer) chatContainer.style.display = 'none';
            
            // Show paper generator screen
            paperGeneratorScreen.style.display = 'block';
            paperGeneratorScreen.classList.remove('hidden');
            paperGeneratorScreen.classList.add('visible');
            
            return false;
        };
    }
    
    if (closePaperGenerator) {
        // Remove any existing event listeners by cloning and replacing the element
        const newClosePaperGenerator = closePaperGenerator.cloneNode(true);
        closePaperGenerator.parentNode.replaceChild(newClosePaperGenerator, closePaperGenerator);
        
        // Add direct onclick handler
        newClosePaperGenerator.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Mock Question Paper Generator being hidden (direct handler)");
            
            // Hide paper generator screen
            paperGeneratorScreen.classList.remove('visible');
            paperGeneratorScreen.classList.add('hidden');
            
            // Show chat container
            if (chatContainer) chatContainer.style.display = 'flex';
            
            return false;
        };
    }
    
    console.log("Direct fixes for Prompt Library and Mock Question Paper Generator applied");
});