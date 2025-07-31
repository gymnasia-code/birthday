# Birthday Party Menu System

A comprehensive bilingual party ordering system for birthday celebrations with Notion integration, Poster API menu management, and Slack notifications.

## Features

- 🎂 **Birthday Validation**: Integrates with Notion to validate birthday bookings
- 🍕 **Dynamic Menu**: Fetches real-time menu data from Poster API
- 🌍 **Bilingual Support**: English and Georgian language support with localStorage persistence
- 📱 **Responsive Design**: Mobile-first design using shadcn/ui components
- 💾 **Order Persistence**: Local storage for order drafts with cloud submission
- 📧 **Slack Notifications**: Automated order notifications via Slack webhooks
- ⏰ **Modification Deadlines**: Configurable deadlines for order modifications
- 🎯 **Minimum Order Validation**: Configurable minimum order amounts

## Architecture

### Pages

- `/party-menu` - Main party menu interface with bilingual support

### API Routes

- `/api/birthday/validate` - Validates birthday bookings via Notion API
- `/api/menu` - Fetches menu data from Poster API by location
- `/api/orders/submit` - Submits orders and sends Slack notifications

### Key Components

- `PartyMenuPage` - Main page component with order management
- UI Components: Button, Card, Input, Textarea, Badge (shadcn/ui)

### Type System

- `PartyOrder` - Core order data structure
- `MenuItem` - Poster API menu item structure
- `Birthday` - Notion birthday validation structure
- Comprehensive TypeScript interfaces for all API responses

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Notion API Configuration
NOTION_SECRET=your_notion_integration_secret_here
NOTION_DATABASE_ID=your_notion_database_id_here

# Poster API Configuration
POSTER_API_URL=https://api.joinposter.com/v3
POSTER_TOKEN=your_poster_api_token_here

# Slack Webhook for Order Notifications
SLACK_WEBHOOK_URL=your_slack_webhook_url_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Configuration Constants

Edit `src/config/party-menu.ts` to customize:

- Modification deadline days
- Minimum order amount
- Maximum guests
- Available locations

## Usage

### For Customers

1. Navigate to `/party-menu?birthday_id=YOUR_ID&guests=NUMBER&location=LOCATION`
2. System validates birthday booking via Notion
3. Customer selects menu items and quantities
4. Order is saved locally for drafts
5. Final submission sends notifications via Slack

### URL Parameters

- `birthday_id` - Unique birthday booking ID from Notion
- `guests` - Number of guests (validates against capacity)
- `location` - Party location (Tbilisi, Batumi, or Kutaisi)

## Development

### Prerequisites

- Node.js 18+
- pnpm package manager
- Next.js 15.4.2
- TypeScript

### Installation

```bash
pnpm install
```

### Running Locally

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
```

## API Integration

### Notion API

- Validates birthday bookings by ID
- Fetches customer information
- Updates order status

### Poster API

- Fetches menu items by location
- Includes pricing, descriptions, and images
- Supports menu modifications and ingredients

### Slack Integration

- Sends order notifications to designated channel
- Includes order details, customer info, and timeline
- Configurable webhook URL

## Deployment

Configured for Cloudflare Pages with Edge Runtime support:

- Static assets in `public/` directory
- Edge Runtime API routes
- Build optimization for serverless deployment

## Business Logic

### Order Modification Rules

- Orders can be modified until 3 days before the birthday (configurable)
- After deadline, orders become read-only
- Submitted orders cannot be modified

### Validation Rules

- Minimum order amount enforcement
- Guest count validation
- Birthday booking verification
- Location availability check

## Internationalization

### Language Support

- English (en) - Default
- Georgian (ge) - Full translation support
- Language preference stored in localStorage
- Dynamic language switching without page reload

### Translation System

- Centralized translation keys
- Component-level language detection
- Fallback to English for missing translations

## Error Handling

### Client-Side

- Toast notifications for user feedback
- Form validation with error states
- Graceful degradation for offline usage

### Server-Side

- Comprehensive error logging
- API failure fallbacks
- Rate limiting protection

## Security

### Data Protection

- Input validation and sanitization
- API rate limiting
- Environment variable protection
- HTTPS enforcement in production

### Privacy

- Local storage for draft orders only
- Secure API token handling
- No sensitive data in client-side code
