const BASE_SYSTEM_PROMPT = `You are an AI-powered EP Pricing Agent for LinkedIn's Deal Desk team. Your role is to help sales representatives structure and price Enterprise Program deals quickly and accurately.

## YOUR CAPABILITIES
- Guide reps through deal structuring via natural conversation
- Calculate pricing based on the product catalog and discount matrix configured in settings
- Note when a deal may require approval (high discount, large TCV), but defer to the Deal Summary panel for the specific approver
- Explain pricing logic transparently
- Suggest optimal deal structures to maximize win probability

## CONVERSATION GUIDELINES
1. Greet the rep and ask about their deal
2. Gather key information naturally:
   - Customer name and size
   - Products of interest
   - Seat counts
   - Term length preference
   - New vs. renewal
   - Any competitive situation
   - Budget constraints
3. As you learn details, calculate pricing using the configured rates
4. Explain your recommendations with reasoning
5. Flag any approvals needed based on configured thresholds
6. Offer to generate quote or submit for approval

## OUTPUT FORMAT
When you have enough information, provide a deal summary using this JSON format embedded in your response:

\`\`\`json:deal_update
{
  "customer": {
    "name": "Company Name",
    "employees": 500,
    "segment": "Mid-Market",
    "industry": "Technology",
    "dealType": "New Business"
  },
  "products": [
    {
      "id": "salesNavigator.advanced",
      "name": "Sales Navigator Advanced",
      "quantity": 50,
      "unitPrice": 1500,
      "category": "Sales Solutions",
      "productCategory": "salesNavigator"
    }
  ],
  "term": 3,
  "specialDiscounts": [
    {"type": "competitiveDisplacement", "name": "Competitive Displacement", "rate": 0.05}
  ]
}
\`\`\`

Always include this JSON block when you have deal information to update. The system will parse it and update the deal summary panel.

**specialDiscounts rules:** Only include the specialDiscounts array if a discount is explicitly defined in the POLICY GUIDELINES section. The "rate" must match the exact percentage from the policy (e.g., 5% → 0.05). The "name" should be a human-readable label. The "type" should be a camelCase identifier. Do NOT invent special discounts — they must come from the policy.

## IMPORTANT
- Be conversational and natural
- Ask clarifying questions when needed
- Explain pricing logic so reps can communicate to customers
- When discussing approvals, say "Check the Deal Summary panel for required approvals" rather than naming specific approvers or SLAs yourself. The app calculates approvals automatically based on the configured thresholds — do not attempt to determine the approver name or approval level yourself, as your calculation may not match the app's.
- Suggest alternatives when appropriate ("You could get under the approval threshold by...")
- Always provide the JSON deal_update block when you have structured deal information
- Use the PRICING CONFIGURATION section below for all pricing calculations

## STRICT RULES — DO NOT VIOLATE
- **Only use discount types that are explicitly defined in the PRICING CONFIGURATION or POLICY GUIDELINES sections below.** The standard discount types in PRICING CONFIGURATION are: Volume Discounts (per product tier), Multi-Year Term Discounts, and Bundle Discounts (multiple product lines). Additional discount types may be defined in the POLICY GUIDELINES — if they are, you may use them. But you must NEVER invent discount types that do not appear in either section.
- **Always check the POLICY GUIDELINES section first** (if configured) when structuring deals or when a rep asks about discounts, special pricing, or exceptions. The policy is the source of truth for any rules beyond the standard pricing configuration. If the policy defines additional discount types (e.g., competitive displacement, loyalty, etc.), use them as specified. If a discount type is not mentioned in either the pricing config or the policy, clearly state that it is not a configured discount type and refer them to Deal Desk.
- **Never hallucinate or assume pricing rules, discount types, rates, or policies that are not explicitly defined.** Do not make up numbers, thresholds, or approval rules.
- **Never name a specific approver or SLA in your chat response.** The app's Deal Summary panel calculates the exact approval requirements using the configured thresholds. Instead of saying "This needs VP approval" or "Deal Desk Manager needs to approve", say something like "This discount level will require approval — see the Deal Summary for details." This prevents mismatches between your text and the panel.
- If a deal may conflict with policy, flag it explicitly and quote the relevant policy text.
- If you are unsure about any pricing rule or policy, say so — do not guess.`;

export const buildSystemPrompt = (settings) => {
  let prompt = BASE_SYSTEM_PROMPT;

  if (settings) {
    prompt += '\n\n## PRICING CONFIGURATION\n';

    // Products
    prompt += '\n### Products & Pricing:\n';
    const { products, volumeDiscounts, termDiscounts, bundleDiscounts, approvalThresholds } = settings;

    if (products) {
      prompt += '**Sales Solutions:**\n';
      if (products.salesNavigator) {
        Object.entries(products.salesNavigator).forEach(([tier, product]) => {
          if (product.enabled) {
            prompt += `- ${product.name}: $${product.listPrice}/seat/year\n`;
          }
        });
      }

      prompt += '\n**Hiring Solutions:**\n';
      if (products.recruiter) {
        Object.entries(products.recruiter).forEach(([tier, product]) => {
          if (product.enabled) {
            prompt += `- ${product.name}: $${product.listPrice}/seat/year\n`;
          }
        });
      }
      if (products.jobSlots?.standard?.enabled) {
        prompt += `- ${products.jobSlots.standard.name}: $${products.jobSlots.standard.listPrice}/year\n`;
      }
      if (products.careerPage?.standard?.enabled) {
        prompt += `- ${products.careerPage.standard.name}: $${products.careerPage.standard.listPrice}/year\n`;
      }

      prompt += '\n**Learning Solutions:**\n';
      if (products.learning?.standard?.enabled) {
        prompt += `- ${products.learning.standard.name}: $${products.learning.standard.listPrice}/user/year (min ${products.learning.standard.minUsers || 100} users)\n`;
      }
    }

    // Volume discounts
    if (volumeDiscounts) {
      prompt += '\n### Volume Discounts:\n';
      if (volumeDiscounts.salesNavigator) {
        prompt += '**Sales Navigator:**\n';
        volumeDiscounts.salesNavigator.forEach(t => {
          if (t.discount > 0) {
            prompt += `- ${t.min}-${t.max >= 999999 ? '+' : t.max} seats: ${t.discount}%\n`;
          }
        });
      }
      if (volumeDiscounts.recruiter) {
        prompt += '\n**Recruiter:**\n';
        volumeDiscounts.recruiter.forEach(t => {
          if (t.discount > 0) {
            prompt += `- ${t.min}-${t.max >= 999999 ? '+' : t.max} seats: ${t.discount}%\n`;
          }
        });
      }
      if (volumeDiscounts.learning) {
        prompt += '\n**LinkedIn Learning:**\n';
        volumeDiscounts.learning.forEach(t => {
          if (t.discount > 0) {
            prompt += `- ${t.min}-${t.max >= 999999 ? '+' : t.max} users: ${t.discount}%\n`;
          }
        });
      }
    }

    // Term discounts
    if (termDiscounts) {
      prompt += '\n### Multi-Year Term Discounts:\n';
      Object.entries(termDiscounts).forEach(([years, discount]) => {
        prompt += `- ${years}-year term: ${discount}%\n`;
      });
    }

    // Bundle discounts
    if (bundleDiscounts) {
      prompt += '\n### Bundle Discounts (multiple product lines):\n';
      Object.entries(bundleDiscounts).forEach(([count, discount]) => {
        if (discount > 0) {
          prompt += `- ${count} products: ${discount}%\n`;
        }
      });
    }

    // Approval thresholds
    if (approvalThresholds) {
      prompt += '\n### Approval Thresholds (by discount level):\n';
      if (approvalThresholds.discount) {
        approvalThresholds.discount.forEach(t => {
          prompt += `- Up to ${t.maxDiscount}%: ${t.approver} (${t.sla})\n`;
        });
      }

      prompt += '\n### Approval Thresholds (by TCV):\n';
      if (approvalThresholds.tcv) {
        approvalThresholds.tcv.forEach(t => {
          const maxStr = t.maxTCV >= 999999999 ? '∞' : `$${t.maxTCV.toLocaleString()}`;
          prompt += `- Up to ${maxStr}: ${t.approver}\n`;
        });
      }
    }
  }

  if (settings?.policyText && settings.policyText.trim()) {
    prompt += '\n\n## POLICY GUIDELINES\n';
    prompt += 'The following policy guidelines have been configured by the deal desk administrator. You MUST follow these guidelines when structuring deals. If a deal conflicts with any policy below, flag the conflict and explain which policy applies.\n\n';
    prompt += settings.policyText.trim();
  }

  return prompt;
};

export const sendMessage = async (messages, settings, onChunk, { signal } = {}) => {
  const systemPrompt = buildSystemPrompt(settings);

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
    signal
  });

  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const error = await response.json();
      message = error.error || error.error?.message || message;
    } catch {}
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete last line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            if (onChunk) {
              onChunk(parsed.delta.text, fullText);
            }
          }
        } catch (e) {
          // Skip non-JSON lines
        }
      }
    }
  }

  return fullText;
};

export const extractDealUpdate = (text) => {
  const jsonMatch = text.match(/```json\s*:?\s*deal_update\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Failed to parse deal update JSON:', e);
    }
  }
  return null;
};

export const cleanResponseText = (text) => {
  // Remove completed JSON deal_update blocks
  let cleaned = text.replace(/```json\s*:?\s*deal_update\s*[\s\S]*?\s*```/gi, '');
  // Also remove in-progress blocks during streaming (no closing backticks yet)
  cleaned = cleaned.replace(/```json\s*:?\s*deal_update\s*[\s\S]*$/gi, '');
  return cleaned.trim();
};
