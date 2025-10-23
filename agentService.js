class AgentService {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.supabaseUrl = CONFIG.SUPABASE_URL;
        this.supabaseKey = CONFIG.SUPABASE_ANON_KEY;

        this.escalationKeywords = [
            'speak to human',
            'talk to agent',
            'representative',
            'manager',
            'complaint',
            'lawsuit',
            'lawyer',
            'attorney',
            'fraud',
            'dissatisfied',
            'unhappy',
            'unacceptable'
        ];
    }

    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('insurance_agent_session');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('insurance_agent_session', sessionId);
        }
        return sessionId;
    }

    async supabaseRequest(endpoint, options = {}) {
        const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
        const headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`Supabase request failed: ${response.statusText}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    async processQuery(userMessage) {
        const query = userMessage.toLowerCase();

        if (this.shouldEscalate(query)) {
            await this.createEscalation(userMessage, 'User requested human assistance or expressed dissatisfaction');
            return this.getEscalationResponse();
        }

        const claimNumber = this.extractClaimNumber(query);
        if (claimNumber) {
            return await this.getClaimStatus(claimNumber);
        }

        const policyNumber = this.extractPolicyNumber(query);
        if (policyNumber) {
            return await this.getPolicyInfo(policyNumber);
        }

        return await this.searchFAQ(query);
    }

    shouldEscalate(query) {
        return this.escalationKeywords.some(keyword => query.includes(keyword));
    }

    extractClaimNumber(query) {
        const claimMatch = query.match(/clm[-\s]?\d{4}[-\s]?\d{4}/i);
        if (claimMatch) {
            return claimMatch[0].toUpperCase().replace(/\s/g, '-').replace(/--/g, '-');
        }
        return null;
    }

    extractPolicyNumber(query) {
        const policyMatch = query.match(/pol[-\s]?\d{4}[-\s]?\d{3}/i);
        if (policyMatch) {
            return policyMatch[0].toUpperCase().replace(/\s/g, '-').replace(/--/g, '-');
        }
        return null;
    }

    async getClaimStatus(claimNumber) {
        try {
            const data = await this.supabaseRequest(
                `claims?claim_number=eq.${claimNumber}&select=*,policies(policy_number,policy_type,policy_holder_name)`,
                { method: 'GET' }
            );

            if (!data || data.length === 0) {
                return `I couldn't find a claim with the number ${claimNumber}. Please verify the claim number and try again. Claim numbers follow the format CLM-2024-XXXX.`;
            }

            return this.formatClaimStatus(data[0]);
        } catch (error) {
            console.error('Error fetching claim:', error);
            return 'I encountered an error retrieving the claim information. Please try again or contact customer service for assistance.';
        }
    }

    formatClaimStatus(claim) {
        const statusMessages = {
            submitted: 'has been received and is awaiting initial review',
            under_review: 'is currently under review by our claims adjuster',
            approved: 'has been approved for payment',
            rejected: 'has been rejected',
            paid: 'has been processed and payment has been completed'
        };

        const statusMessage = statusMessages[claim.status] || 'is being processed';

        let response = `**Claim Status for ${claim.claim_number}**\n\n`;
        response += `Status: **${claim.status.replace('_', ' ').toUpperCase()}**\n`;
        response += `Your claim ${statusMessage}.\n\n`;
        response += `**Claim Details:**\n`;
        response += `- Type: ${claim.claim_type.charAt(0).toUpperCase() + claim.claim_type.slice(1)}\n`;
        response += `- Claim Amount: $${claim.claim_amount.toLocaleString()}\n`;

        if (claim.approved_amount > 0) {
            response += `- Approved Amount: $${claim.approved_amount.toLocaleString()}\n`;
        }

        response += `- Filed Date: ${new Date(claim.filed_date).toLocaleDateString()}\n`;
        response += `- Last Updated: ${new Date(claim.last_updated).toLocaleDateString()}\n`;

        if (claim.estimated_completion) {
            response += `- Estimated Completion: ${new Date(claim.estimated_completion).toLocaleDateString()}\n`;
        }

        response += `\n**Description:** ${claim.description}\n`;

        if (claim.adjuster_notes) {
            response += `\n**Notes:** ${claim.adjuster_notes}\n`;
        }

        if (claim.status === 'under_review') {
            response += `\nWe will notify you once the review is complete. If you have additional documents to submit, please call us at 1-800-CLAIM-NOW.`;
        } else if (claim.status === 'approved') {
            response += `\nPayment will be processed within 3-5 business days.`;
        }

        return response;
    }

    async getPolicyInfo(policyNumber) {
        try {
            const data = await this.supabaseRequest(
                `policies?policy_number=eq.${policyNumber}`,
                { method: 'GET' }
            );

            if (!data || data.length === 0) {
                return `I couldn't find a policy with the number ${policyNumber}. Please verify the policy number and try again. Policy numbers follow the format POL-2024-XXX.`;
            }

            return this.formatPolicyInfo(data[0]);
        } catch (error) {
            console.error('Error fetching policy:', error);
            return 'I encountered an error retrieving the policy information. Please try again or contact customer service for assistance.';
        }
    }

    formatPolicyInfo(policy) {
        let response = `**Policy Information for ${policy.policy_number}**\n\n`;
        response += `**Policyholder:** ${policy.policy_holder_name}\n`;
        response += `**Type:** ${policy.policy_type.charAt(0).toUpperCase() + policy.policy_type.slice(1)} Insurance\n`;
        response += `**Status:** ${policy.status.toUpperCase()}\n\n`;
        response += `**Coverage Details:**\n`;
        response += `- Coverage Amount: $${policy.coverage_amount.toLocaleString()}\n`;
        response += `- Premium: $${policy.premium_amount.toLocaleString()} annually\n`;
        response += `- Policy Period: ${new Date(policy.start_date).toLocaleDateString()} to ${new Date(policy.end_date).toLocaleDateString()}\n\n`;
        response += `For detailed coverage information or to make changes to your policy, please call us at 1-800-555-0123 or log into your online account.`;

        return response;
    }

    async searchFAQ(query) {
        try {
            const data = await this.supabaseRequest(
                'faqs?order=priority.desc',
                { method: 'GET' }
            );

            const scoredFAQs = data.map(faq => ({
                faq,
                score: this.calculateRelevanceScore(query, faq)
            }));

            scoredFAQs.sort((a, b) => b.score - a.score);

            const bestMatch = scoredFAQs[0];

            if (bestMatch && bestMatch.score > 0.3) {
                return `**${bestMatch.faq.question}**\n\n${bestMatch.faq.answer}`;
            }

            return this.getDefaultResponse(query);
        } catch (error) {
            console.error('Error searching FAQs:', error);
            return 'I encountered an error searching for information. Please try rephrasing your question or contact customer service for assistance.';
        }
    }

    calculateRelevanceScore(query, faq) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const questionWords = faq.question.toLowerCase().split(/\s+/);
        const keywords = faq.keywords.map(k => k.toLowerCase());

        let score = 0;

        queryWords.forEach(word => {
            if (word.length < 3) return;

            if (keywords.some(k => k.includes(word) || word.includes(k))) {
                score += 3;
            }

            if (questionWords.some(qw => qw.includes(word) || word.includes(qw))) {
                score += 2;
            }

            if (faq.answer.toLowerCase().includes(word)) {
                score += 1;
            }
        });

        const maxPossibleScore = queryWords.length * 3;
        return maxPossibleScore > 0 ? score / maxPossibleScore : 0;
    }

    getDefaultResponse(query) {
        const isQuestionAboutClaim = /claim|status|filed/i.test(query);
        const isQuestionAboutPolicy = /policy|coverage|premium/i.test(query);

        let response = "I understand you're looking for information";

        if (isQuestionAboutClaim) {
            response += " about claims. ";
            response += "You can check your claim status by providing your claim number (e.g., CLM-2024-1001). ";
            response += "To file a new claim, call 1-800-CLAIM-NOW or use our mobile app.";
        } else if (isQuestionAboutPolicy) {
            response += " about your policy. ";
            response += "You can check policy details by providing your policy number (e.g., POL-2024-001). ";
            response += "For policy changes, call 1-800-555-0123 or log into your account.";
        } else {
            response += ". Here are some things I can help you with:\n\n";
            response += "- **Check claim status** - Just provide your claim number\n";
            response += "- **Policy information** - Give me your policy number\n";
            response += "- **File a claim** - Ask 'How do I file a claim?'\n";
            response += "- **Payment questions** - Ask about payment methods or due dates\n";
            response += "- **General questions** - Contact info, business hours, mobile app\n\n";
            response += "If you need to speak with a representative, just let me know!";
        }

        return response;
    }

    getEscalationResponse() {
        return `I understand you'd like to speak with a representative. I'm escalating your request to our customer service team.\n\n**You can reach us directly:**\n- Phone: 1-800-555-0123 (24/7 for claims, Mon-Sat for general inquiries)\n- Email: support@insurance.com\n- Live Chat: Available on our website\n\nA representative will be available to assist you shortly. Your case has been flagged as priority, and we typically respond to escalated requests within 1 hour during business hours.\n\nIs there anything else I can help you with while you wait?`;
    }

    async saveConversation(messages, claimNumber, policyNumber) {
        try {
            const existingData = await this.supabaseRequest(
                `conversations?session_id=eq.${this.sessionId}`,
                { method: 'GET' }
            );

            const conversationData = {
                session_id: this.sessionId,
                messages: messages,
                claim_number: claimNumber || null,
                policy_number: policyNumber || null,
                updated_at: new Date().toISOString()
            };

            if (existingData && existingData.length > 0) {
                await this.supabaseRequest(
                    `conversations?id=eq.${existingData[0].id}`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify(conversationData)
                    }
                );
            } else {
                await this.supabaseRequest(
                    'conversations',
                    {
                        method: 'POST',
                        body: JSON.stringify(conversationData)
                    }
                );
            }
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }

    async createEscalation(query, reason) {
        try {
            const conversationData = await this.supabaseRequest(
                `conversations?session_id=eq.${this.sessionId}`,
                { method: 'GET' }
            );

            if (conversationData && conversationData.length > 0) {
                const conversationId = conversationData[0].id;

                await this.supabaseRequest(
                    `conversations?id=eq.${conversationId}`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify({
                            escalated: true,
                            escalation_reason: reason
                        })
                    }
                );

                await this.supabaseRequest(
                    'escalations',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            conversation_id: conversationId,
                            reason: reason,
                            priority: 'high',
                            status: 'pending'
                        })
                    }
                );
            }
        } catch (error) {
            console.error('Error creating escalation:', error);
        }
    }
}
