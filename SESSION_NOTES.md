# LinkedIn EP Pricing Agent - Session Notes

**Created:** January 28, 2026
**Location:** `/Users/reubenjacob/claude/linkedin/Deal Agent`
**Dev Server:** `http://localhost:5174`

---

## Overview

An AI-powered conversational interface that helps LinkedIn sales reps instantly structure and price complex Enterprise Program (EP) deals. Replaces the manual process where reps submit tickets and wait 2+ days for Deal Desk responses.

### Target Users
- LinkedIn sales representatives
- Deal Desk team (for demo purposes)

### Demo Purpose
Show Catherine (and stakeholders Paul & Akira) how AI can transform enterprise program pricing from a 2+ day ticket process to instant, conversational deal structuring.

---

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4
- **AI:** Anthropic Claude API (claude-sonnet-4-5-20250929)
- **Icons:** Lucide React
- **PDF Generation:** jsPDF
- **Markdown:** react-markdown

---

## Features Implemented

### 1. Conversational Deal Structuring
- Natural language conversation with AI agent
- Agent asks clarifying questions about deals
- Extracts structured deal data from conversation
- Real-time streaming responses

### 2. Real-Time Deal Summary Panel
- Customer info (name, employees, segment, industry, deal type)
- Product line items with quantities and pricing
- Discount breakdown (volume, bundle, term, special)
- ACV/TCV calculations
- Approval routing indicators

### 3. Settings Panel (Customizable)
- **Products tab:** Enable/disable products, edit names and prices
- **Volume Discounts tab:** Configure discount tiers per product line
- **Term & Bundle tab:** Multi-year and bundle discount percentages
- **Approvals tab:** Approval thresholds for discount levels and TCV
- **Currency switcher:** USD, AUD, CAD, EUR, GBP, INR
- Settings persist to localStorage

### 4. Suggested Replies
- Context-aware suggestions guide demo users
- Adapts based on conversation stage:
  - Initial: Sample deal starters
  - Follow-up: Customer type clarifications
  - Building: Deal refinement options
  - Structured: Quote actions

### 5. Generate Quote (PDF)
- Downloads professional PDF with:
  - Quote number and dates
  - Customer information
  - Product table with pricing
  - Discount breakdown
  - ACV/TCV totals
  - Contract terms
- Supports all configured currencies

### 6. Draft Proposal (Email)
- Modal with pre-drafted customer email
- Copy to clipboard button
- Open in mail client button
- Includes deal details and value proposition

### 7. Voice Input
- Microphone button for voice-to-text
- Uses Web Speech API

---

## File Structure

```
Deal Agent/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Tailwind + custom styles
│   ├── components/
│   │   ├── ChatWindow.jsx         # Chat container
│   │   ├── ChatInput.jsx          # Text + voice input
│   │   ├── MessageBubble.jsx      # Message display (markdown)
│   │   ├── TypingIndicator.jsx    # Loading animation
│   │   ├── VoiceInput.jsx         # Voice recording
│   │   ├── SuggestedReplies.jsx   # Contextual suggestions
│   │   ├── DealSummary.jsx        # Deal details panel
│   │   ├── ProductLineItem.jsx    # Product row
│   │   ├── DiscountRow.jsx        # Discount display
│   │   ├── ApprovalBadge.jsx      # Approval indicators
│   │   ├── ActionButtons.jsx      # Quote/Proposal/Submit
│   │   ├── SettingsModal.jsx      # Settings panel
│   │   └── ProposalModal.jsx      # Email draft modal
│   ├── hooks/
│   │   ├── useDealState.js        # Deal state management
│   │   └── useSettings.js         # Settings + currency
│   └── utils/
│       ├── claudeApi.js           # Claude API integration
│       ├── pricingEngine.js       # Discount calculations
│       ├── productCatalog.js      # Product data
│       ├── approvalMatrix.js      # Approval logic
│       ├── currencies.js          # Currency definitions
│       └── quoteGenerator.js      # PDF generation
├── .env                           # API key (gitignored)
├── .env.example                   # API key template
├── package.json
├── vite.config.js
└── index.html
```

---

## Key Configuration

### Default Products (USD base prices)
| Product | Price/seat/year |
|---------|-----------------|
| Sales Navigator Core | $960 |
| Sales Navigator Advanced | $1,500 |
| Sales Navigator Advanced Plus | $1,800 |
| Recruiter Lite | $1,680 |
| Recruiter Corporate | $8,500 |
| Job Slots | $3,600 |
| Career Page | $5,000 |
| LinkedIn Learning | $85/user |

### Discount Structure
**Volume (Sales Navigator):**
- 10-24 seats: 5%
- 25-49 seats: 10%
- 50-99 seats: 15%
- 100-249 seats: 20%
- 250-499 seats: 25%
- 500+ seats: 30%

**Term Discounts:**
- 2-year: 5%
- 3-year: 8%

**Bundle Discounts:**
- 2 products: 5%
- 3 products: 10%
- 4+ products: 15%

### Approval Thresholds
**By Discount:**
- Up to 15%: Sales Manager (Same day)
- Up to 25%: Deal Desk (1 business day)
- Up to 35%: Deal Desk Manager (2 business days)
- Up to 45%: Sales VP (3 business days)

**By TCV:**
- Up to $100K: Sales Manager
- Up to $250K: Deal Desk
- Up to $500K: Finance
- Up to $1M: Sales VP

---

## Claude API Integration

### System Prompt
The AI agent is instructed to:
- Guide reps through deal structuring conversationally
- Calculate pricing based on configured settings
- Output deal data in JSON format for parsing
- Explain pricing logic transparently
- Flag approval requirements

### Deal Update Format
The agent embeds structured data in responses:
```json
```json:deal_update
{
  "customer": { "name": "...", "employees": 500, ... },
  "products": [{ "id": "...", "name": "...", "quantity": 50, ... }],
  "term": 3,
  "specialDiscounts": [{ "type": "competitiveDisplacement", "rate": 0.10 }]
}
```
```

This JSON is extracted and used to update the Deal Summary panel.

---

## Demo Script

### Setup
"You mentioned EP pricing is done manually by a vendor team and takes 2+ days. I built something to show what's possible..."

### Demo 1 - Simple Deal (90 sec)
Use suggested reply: "I have a tech company called Acme Technologies with 500 employees..."
- Watch agent ask follow-up questions
- See pricing calculate in real-time
- Show approval routing

### Demo 2 - Complex Bundle (2 min)
- Add LinkedIn Learning and Recruiter
- Mention competitive displacement (ZoomInfo)
- See bundle discount, approval escalation

### Demo 3 - The Comparison
"That conversation took 3 minutes. Current process: submit ticket, wait 2 days..."

---

## Commands

```bash
# Start development server
cd /Users/reubenjacob/claude/linkedin/Deal\ Agent
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Known Issues / Future Enhancements

### Potential Improvements
1. **Actual CRM Integration** - Could connect to Salesforce
2. **Save/Load Deals** - Persist deals to database
3. **User Authentication** - Track which rep created which deals
4. **Approval Workflow** - Actually route to approvers
5. **Analytics Dashboard** - Track deal patterns
6. **Export to Slides** - Generate presentation decks

### Technical Notes
- PDF generation uses basic jsPDF (removed jspdf-autotable due to compatibility issues)
- Currency conversion uses static exchange rates (could integrate live rates)
- Settings stored in localStorage (consider backend persistence for production)
- Email sending via Resend API requires VITE_RESEND_API_KEY in .env

---

## Session History

### Session 1: Initial Build (January 28, 2026)
- Created React + Vite project with Tailwind
- Built conversational chat interface
- Integrated Claude API with streaming
- Created pricing engine and approval matrix
- Built deal summary panel with real-time updates

### Session 1: Enhancements
1. Settings panel for customizing products, discounts, approvals
2. Markdown rendering in chat messages
3. PDF quote generation
4. Currency switcher (USD, AUD, CAD, EUR, GBP, INR)
5. Suggested replies for demo guidance
6. Draft proposal email modal

### Session 1: Fixes
- Removed CFO-level approvals, made thresholds more realistic
- Fixed PDF generation (removed problematic jspdf-autotable dependency)
- Fixed currency conversion across all components

---

### Session 2: VP Optimization (February 6, 2026)
**Objective**: Make demo VP-presentation-ready for LinkedIn leadership.

#### Audit Findings
- **BUG (Critical)**: `pricingEngine.js` uses hardcoded `DISCOUNT_MATRIX` — ignores Settings modal changes. Claude's system prompt uses settings but the Deal Summary panel does not → conflicting pricing numbers.
- **BUG (Critical)**: `approvalMatrix.js` uses hardcoded `APPROVAL_THRESHOLDS` — same issue. Settings has `[15, 25, 35, 45]%` thresholds but hardcoded has `[15, 25, 35, 40, 100]%`. TCV first tier: settings=$100K vs hardcoded=$50K.
- **BUG**: Model hardcoded to old `claude-sonnet-4-20250514`.
- **Feature Gap**: No actual email sending — only copy-to-clipboard and mailto: link.
- **Polish**: Vite favicon, 4 unused npm deps, `alert()` calls, instant modal transitions, cryptic quote numbers.

#### Architecture Note
Settings flow should be: `useSettings()` → Claude system prompt AND pricingEngine AND approvalMatrix. Previously it only flowed to Claude's system prompt. Fix threads settings through `useDealState(settings)`.

#### Data Format Note
Settings stores discounts as whole numbers (5 = 5%). pricingEngine uses decimals (0.05 = 5%). Conversion happens at the boundary when settings are passed to pricing functions.

#### Changes Completed (All Verified)
1. **Fixed pricing engine** to accept and use settings (pricingEngine.js, useDealState.js, App.jsx) — Settings flow: `useSettings()` → `useDealState(settings)` → `calculateDealPricing(..., settings)`. Whole-number % from settings converted to decimals at boundary.
2. **Fixed approval matrix** to accept and use settings (approvalMatrix.js, useDealState.js) — `getRequiredApprovals()` and `getDiscountApproval()` accept optional settings. Falls back to hardcoded defaults when no settings provided.
3. **Updated Claude model** to `claude-sonnet-4-5-20250929` (claudeApi.js line 193)
4. **Added Resend email integration** — New `src/utils/emailService.js`, Vite proxy in vite.config.js (`/api/send-email` → `api.resend.com/emails`), ProposalModal updated with recipient email input + Send button with idle/sending/sent/error states.
5. **Replaced Vite favicon** with LinkedIn "in" icon (new `public/linkedin.svg`, updated `index.html`)
6. **Removed unused deps**: html2canvas, jspdf-autotable, dompurify, canvg from package.json. Added Vite plugin `stubJspdfOptionalDeps()` + `optimizeDeps.esbuildOptions.external` in vite.config.js to handle jsPDF's optional dynamic imports of these packages at both the esbuild optimization phase and the Vite runtime transform phase.
7. **Fixed "Submit for Approval"** — Replaced `alert('coming soon')` with green success animation ("Submitted!" for 4 seconds), matching the existing "Downloaded!" pattern (ActionButtons.jsx)
8. **Professional quote numbers** — `Q-2026-XXXX` format instead of `Q-M5ZGH2K` (quoteGenerator.js line 33)
9. **Added modal animations** — CSS `@keyframes modal-backdrop-in` and `modal-content-in` in index.css, `.modal-backdrop` and `.modal-content` classes added to SettingsModal.jsx and ProposalModal.jsx
10. **Replaced error alert()** with inline red toast above action buttons (ActionButtons.jsx)
11. **Dynamic auto-approve threshold** — DealSummary.jsx now accepts `settings` prop and uses `settings.approvalThresholds.discount[0].maxDiscount / 100` instead of hardcoded `0.15`

#### Gotchas Discovered During Implementation
- **jsPDF optional deps**: Removing canvg/html2canvas/dompurify from package.json breaks both esbuild (dep optimization phase) AND Vite's import-analysis (runtime transform phase). Fix requires BOTH `optimizeDeps.esbuildOptions.external` AND a custom Vite plugin with `resolveId`/`load` hooks that return stub modules. Using `\0stub:` prefix convention for virtual module IDs.
- **Hook ordering in App.jsx**: `useSettings()` must be called BEFORE `useDealState(settings)` since the latter depends on the former's return value.
- **Settings % format**: Settings stores `5` (meaning 5%), pricingEngine expects `0.05`. Every boundary where settings are passed to pricing/approval functions must divide by 100.

#### Files Modified
| File | What Changed |
|------|-------------|
| `src/utils/pricingEngine.js` | Accept settings param in all functions |
| `src/utils/approvalMatrix.js` | Accept settings param in all functions |
| `src/utils/claudeApi.js` | Model version update |
| `src/utils/quoteGenerator.js` | Quote number format |
| `src/utils/emailService.js` | **NEW** — Resend API email sender |
| `src/hooks/useDealState.js` | Accept settings, pass to pricing + approval |
| `src/App.jsx` | Reorder hooks, pass settings to useDealState + DealSummary |
| `src/components/ActionButtons.jsx` | Replace both alert() calls |
| `src/components/ProposalModal.jsx` | Email input + Send button + modal animation |
| `src/components/SettingsModal.jsx` | Modal animation class |
| `src/components/DealSummary.jsx` | Accept settings, dynamic auto-approve |
| `src/index.css` | Modal animation keyframes |
| `vite.config.js` | Stub plugin + esbuild externals + Resend proxy |
| `index.html` | LinkedIn favicon |
| `public/linkedin.svg` | **NEW** — LinkedIn favicon |
| `.env` | Added VITE_RESEND_API_KEY |
| `.env.example` | Added VITE_RESEND_API_KEY placeholder |
| `package.json` | Removed 4 unused deps |

---

## Environment Variables

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_RESEND_API_KEY=re_...   # Get from resend.com (free 200 emails/month)
```

---

## Contact

Project created for LinkedIn Deal Desk demo.
Built with Claude Code.
