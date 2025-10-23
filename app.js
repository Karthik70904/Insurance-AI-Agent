class InsuranceApp {
    constructor() {
        this.messages = [];
        this.agentService = new AgentService();
        this.isLoading = false;
        this.showSamples = true;

        this.initializeDOM();
        this.attachEventListeners();
        this.addInitialMessage();
    }

    initializeDOM() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('message-input');
        this.chatForm = document.getElementById('chat-form');
        this.sendBtn = document.getElementById('send-btn');
        this.loadingIndicator = document.getElementById('loading');
        this.sampleDataContainer = document.getElementById('sample-data');
        this.quickActionsContainer = document.getElementById('quick-actions');
    }

    attachEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));

        document.querySelectorAll('.sample-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.currentTarget.getAttribute('data-message');
                this.handleSendMessage(message);
            });
        });

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.currentTarget.getAttribute('data-message');
                this.handleSendMessage(message);
            });
        });
    }

    addInitialMessage() {
        const welcomeMessage = {
            role: 'assistant',
            content: `Hello! I'm your AI Insurance Assistant. I can help you with:\n\n- **Claim Status Updates** - Check the status of your insurance claims\n- **Policy Information** - View your policy details and coverage\n- **FAQ Answers** - Get answers to common insurance questions\n- **Escalate Issues** - Connect you with a human representative when needed\n\nHow can I assist you today?`,
            timestamp: new Date().toISOString()
        };

        this.messages.push(welcomeMessage);
        this.renderMessage(welcomeMessage);
    }

    handleSubmit(e) {
        e.preventDefault();
        const message = this.messageInput.value.trim();

        if (message && !this.isLoading) {
            this.handleSendMessage(message);
            this.messageInput.value = '';
        }
    }

    async handleSendMessage(content) {
        const userMessage = {
            role: 'user',
            content: content,
            timestamp: new Date().toISOString()
        };

        this.messages.push(userMessage);
        this.renderMessage(userMessage);

        this.setLoading(true);
        this.hideSamples();

        try {
            const response = await this.agentService.processQuery(content);

            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            this.messages.push(assistantMessage);
            this.renderMessage(assistantMessage);

            await this.agentService.saveConversation(this.messages);
        } catch (error) {
            console.error('Error processing message:', error);

            const errorMessage = {
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please try again or contact customer service at 1-800-555-0123.',
                timestamp: new Date().toISOString()
            };

            this.messages.push(errorMessage);
            this.renderMessage(errorMessage);
        } finally {
            this.setLoading(false);
            this.scrollToBottom();
        }
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `avatar ${message.role === 'user' ? 'user-avatar' : 'bot-avatar'}`;

        if (message.role === 'user') {
            avatarDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
        } else {
            avatarDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            `;
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = this.formatMessageContent(message.content);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(message.timestamp);

        bubbleDiv.appendChild(textDiv);
        contentDiv.appendChild(bubbleDiv);
        contentDiv.appendChild(timeDiv);

        if (message.role === 'user') {
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatarDiv);
        } else {
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
        }

        this.messagesContainer.appendChild(messageDiv);
    }

    formatMessageContent(content) {
        return content.split('\n').map(line => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return `<strong>${line.replace(/\*\*/g, '')}</strong>`;
            }
            if (line.startsWith('- ')) {
                return `<div style="margin-left: 8px;">${line}</div>`;
            }
            if (line.trim() === '') {
                return '<div style="height: 8px;"></div>';
            }
            return `<div>${line}</div>`;
        }).join('');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.messageInput.disabled = loading;
        this.sendBtn.disabled = loading;
        this.loadingIndicator.style.display = loading ? 'flex' : 'none';
    }

    hideSamples() {
        if (this.showSamples) {
            this.showSamples = false;
            this.sampleDataContainer.style.display = 'none';
            this.quickActionsContainer.style.display = 'none';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InsuranceApp();
});
