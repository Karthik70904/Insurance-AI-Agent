# Insurance AI Agent - HTML/CSS/JS Version

A fully functional AI-powered insurance customer service agent built with pure HTML, CSS, and JavaScript.

## Features

- **Claim Status Lookup** - Real-time claim status updates using claim numbers
- **Policy Information** - Retrieve policy details and coverage information
- **FAQ System** - Intelligent FAQ matching with relevance scoring
- **Escalation Workflow** - Automatic escalation for complex queries
- **Conversation History** - All conversations saved to Supabase database
- **Beautiful UI** - Modern, responsive design with smooth animations

## Files Structure

```
public/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js              # Main application logic
├── agentService.js     # AI agent service with Supabase integration
├── config.js           # Configuration (Supabase credentials)
└── README.md           # This file
```

## How to Use

### Option 1: Direct File Access
Simply open `index.html` in your web browser.

### Option 2: Local Server
For better performance, use a local web server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Features Demonstration

### 1. Check Claim Status
Try these sample claim numbers:
- CLM-2024-1001 (Approved - Auto accident)
- CLM-2024-1002 (Under Review - Water damage)
- CLM-2024-1003 (Submitted - Medical emergency)

Example query: "What is the status of CLM-2024-1001?"

### 2. View Policy Information
Try these sample policy numbers:
- POL-2024-001 (Auto Insurance)
- POL-2024-002 (Home Insurance)
- POL-2024-003 (Health Insurance)

Example query: "What is the status of POL-2024-001?"

### 3. Ask FAQ Questions
Try these questions:
- "How do I file an insurance claim?"
- "How long does it take to process a claim?"
- "What payment methods do you accept?"
- "How do I contact customer service?"

### 4. Trigger Escalation
Use keywords like:
- "I want to speak to a human"
- "Connect me with a manager"
- "This is unacceptable"

## Database Integration

The application uses Supabase for:
- **Claims Database** - Stores all insurance claims
- **Policies Database** - Stores all insurance policies
- **FAQs Database** - Stores frequently asked questions
- **Conversations** - Saves chat history
- **Escalations** - Tracks escalated queries

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, animations, and flexbox/grid
- **Vanilla JavaScript** - No frameworks or libraries
- **Supabase** - Backend database and API
- **REST API** - Direct Supabase REST API integration

## Configuration

The `config.js` file contains Supabase credentials:

```javascript
const CONFIG = {
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_ANON_KEY: 'your-anon-key'
};
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

The application is fully responsive with breakpoints for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Key Features Explained

### AI Agent Intelligence
- Pattern matching for claim/policy numbers
- Keyword-based FAQ search with relevance scoring
- Automatic escalation detection
- Context-aware default responses

### User Interface
- Clean, modern design with blue color scheme
- Smooth animations and transitions
- Real-time typing indicators
- Auto-scrolling message container
- Quick action buttons for common tasks
- Sample data showcase for easy testing

### Data Persistence
- Conversations saved to Supabase
- Session-based tracking
- Escalation logging
- Message history retention

## Performance

- Fast initial load (no external dependencies)
- Efficient DOM manipulation
- Optimized API calls
- Smooth 60fps animations

## Security

- Environment variables stored in config.js
- Supabase Row Level Security (RLS) enabled
- No sensitive data exposed in client code
- HTTPS recommended for production

## Development

To modify the application:
1. Edit HTML structure in `index.html`
2. Update styles in `styles.css`
3. Modify logic in `app.js`
4. Update AI behavior in `agentService.js`

## Production Deployment

1. Update `config.js` with production Supabase credentials
2. Enable HTTPS
3. Consider adding error tracking (e.g., Sentry)
4. Implement rate limiting if needed
5. Add analytics if desired

## Support

For issues or questions:
- Email: support@insurance.com
- Phone: 1-800-555-0123
