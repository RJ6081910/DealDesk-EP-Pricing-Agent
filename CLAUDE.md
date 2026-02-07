# LinkedIn EP Pricing Agent

## Quick Start
```bash
npm run dev  # Starts on http://localhost:5174
```

## What This Is
AI-powered conversational interface for LinkedIn sales reps to structure and price Enterprise Program deals instantly. Demo for Deal Desk team.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4
- Claude API (claude-sonnet-4-20250514) for conversation
- jsPDF for quote generation
- react-markdown for message rendering

## Key Files
- `src/App.jsx` - Main app, state management
- `src/utils/claudeApi.js` - Claude API integration, system prompt
- `src/utils/quoteGenerator.js` - PDF quote generation
- `src/hooks/useSettings.js` - Settings state, currency conversion
- `src/hooks/useDealState.js` - Deal state management
- `src/components/SettingsModal.jsx` - Customization panel

## How It Works
1. User describes deal in chat
2. Claude agent asks clarifying questions
3. Agent outputs `json:deal_update` blocks with structured data
4. App parses JSON and updates Deal Summary panel
5. Pricing engine calculates discounts based on settings
6. Approval routing determined by thresholds

## API Key
Located in `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Customization
All pricing, products, discounts, and approval thresholds are configurable via Settings modal. Changes persist to localStorage.

## Important Patterns
- Deal data extracted from AI responses via regex: `/```json:deal_update\s*([\s\S]*?)\s*```/`
- All monetary values stored in USD, converted for display using `formatCurrency()`
- Settings passed to Claude API as part of system prompt

## Common Tasks

### Add a new product
1. Add to `DEFAULT_SETTINGS.products` in `src/hooks/useSettings.js`
2. Update volume discount tiers if needed in `DEFAULT_SETTINGS.volumeDiscounts`

### Modify approval thresholds
Edit `DEFAULT_SETTINGS.approvalThresholds` in `src/hooks/useSettings.js`

### Change suggested replies
Edit `getSuggestions()` in `src/components/SuggestedReplies.jsx`

### Modify email proposal template
Edit `generateEmailContent()` in `src/components/ProposalModal.jsx`

### Customize PDF quote
Edit `src/utils/quoteGenerator.js`

## Gotchas
- PDF generation doesn't use jspdf-autotable (caused issues) - uses manual drawing
- Currency rates are static in `src/utils/currencies.js`
- Claude model is hardcoded to `claude-sonnet-4-20250514` in claudeApi.js
