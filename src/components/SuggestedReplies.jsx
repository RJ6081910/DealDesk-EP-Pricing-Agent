import { Sparkles } from 'lucide-react';

const SAMPLE_DEAL_PROMPT = `I have a tech company called Acme Technologies with 2,000 employees. They're looking to consolidate their sales tech stack. Here's what they need:

- 50 Sales Navigator Advanced seats for their sales team
- 10 Recruiter Corporate seats for talent acquisition
- 500 LinkedIn Learning licenses for company-wide professional development

They want a 3-year deal. This is a competitive displacement from ZoomInfo for the sales intelligence side. Their VP of Sales is the main champion and they have budget approval pending. What's the best pricing we can offer?`;

const SuggestedReplies = ({ onSelect, messageCount, hasDealData, messages = [], dealState = {} }) => {
  const getSuggestions = () => {
    const lastMessages = messages.slice(-3);
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')?.content?.toLowerCase() || '';
    const allContent = messages.map(m => m.content).join(' ').toLowerCase();

    const hasCustomer = !!dealState?.customer;
    const hasProducts = dealState?.products?.length > 0;
    const hasPricing = !!dealState?.pricing;

    // Detect what the agent is asking about
    const agentAskedAbout = {
      products: /which products|what products|interested in|looking for|what.*solutions|what.*need/i.test(lastAssistantMsg),
      quantity: /how many|seat count|number of (seats|users|licenses)|team size/i.test(lastAssistantMsg),
      term: /term length|how long|commitment|multi-year|contract duration/i.test(lastAssistantMsg),
      customer: /customer|company|organization|who.*working with|tell me about/i.test(lastAssistantMsg),
      budget: /budget|price range|spending|afford|cost/i.test(lastAssistantMsg),
      competitive: /competitor|currently using|switching from|displacing|alternative/i.test(lastAssistantMsg),
      dealType: /new business|renewal|expansion|upsell|new customer/i.test(lastAssistantMsg)
    };

    // Detect keywords in conversation
    const mentioned = {
      salesNav: /sales nav/i.test(allContent),
      recruiter: /recruiter/i.test(allContent),
      learning: /learning/i.test(allContent),
      competitor: /zoominfo|seamless|apollo|lusha|6sense|gong|outreach/i.test(allContent),
      budget: /budget|\$\d|cost|spend/i.test(allContent),
      term: /\d-year|multi-year|annual|term/i.test(allContent)
    };

    // Stage 1: Initial — first message only
    if (messageCount <= 1) {
      return [
        {
          label: "Create sample deal",
          text: SAMPLE_DEAL_PROMPT
        },
        {
          label: "Start a new deal",
          text: "I have a tech company called Acme Technologies with 500 employees. They're interested in Sales Navigator for their 50-person sales team."
        },
        {
          label: "Mid-market deal",
          text: "I'm working with a financial services company, 300 employees. They want Sales Navigator Advanced for 40 reps and LinkedIn Learning for everyone."
        },
        {
          label: "Enterprise bundle",
          text: "I have a Fortune 500 manufacturing company with 15,000 employees interested in a full suite - Sales Navigator, Recruiter, and LinkedIn Learning."
        }
      ];
    }

    // Stage 2: Agent asked about products
    if (agentAskedAbout.products) {
      return [
        {
          label: "Sales Navigator",
          text: "They're primarily interested in Sales Navigator Advanced for their sales team."
        },
        {
          label: "Recruiter seats",
          text: "They need Recruiter Corporate seats for their talent acquisition team."
        },
        {
          label: "Learning licenses",
          text: "They want LinkedIn Learning for company-wide professional development."
        },
        {
          label: "Full suite",
          text: "They're interested in the full suite — Sales Navigator, Recruiter, and LinkedIn Learning."
        }
      ];
    }

    // Stage 3: Agent asked about quantity
    if (agentAskedAbout.quantity) {
      return [
        {
          label: "Small team (10-25)",
          text: "They need about 15 seats for the core team."
        },
        {
          label: "Mid team (25-75)",
          text: "We're looking at approximately 50 seats for the department."
        },
        {
          label: "Large team (100+)",
          text: "They need around 150 seats across multiple regions."
        }
      ];
    }

    // Stage 4: Agent asked about term
    if (agentAskedAbout.term) {
      return [
        {
          label: "1-year start",
          text: "They want to start with a 1-year contract to test things out."
        },
        {
          label: "2-year deal",
          text: "They're open to a 2-year commitment if the pricing makes sense."
        },
        {
          label: "3-year commitment",
          text: "They prefer a 3-year commitment for the best possible pricing."
        }
      ];
    }

    // Stage 5: Agent asked about competitive situation or deal type
    if (agentAskedAbout.competitive || agentAskedAbout.dealType) {
      return [
        {
          label: "New customer",
          text: "It's a new customer, they're currently not using any LinkedIn products."
        },
        {
          label: "Competitive deal",
          text: "They're currently using ZoomInfo and looking to switch to LinkedIn."
        },
        {
          label: "Renewal + expansion",
          text: "This is a renewal — they currently have 25 Sales Navigator seats and want to expand to 50."
        }
      ];
    }

    // Stage 6: Has customer but no products yet
    if (hasCustomer && !hasProducts) {
      return [
        {
          label: "Add Sales Navigator",
          text: "They want Sales Navigator Advanced for their 40-person sales team."
        },
        {
          label: "Add Recruiter",
          text: "They also need 10 Recruiter Corporate seats for hiring."
        },
        {
          label: "Add Learning",
          text: "They want LinkedIn Learning for all 500 employees."
        },
        {
          label: "Full bundle",
          text: "Let's add Sales Navigator, Recruiter, and Learning all together."
        }
      ];
    }

    // Stage 7: Has products, refining deal
    if (hasProducts && !hasPricing) {
      const suggestions = [];
      if (!mentioned.budget) {
        suggestions.push({
          label: "Budget conscious",
          text: "Their budget is around $150,000 per year. Can we make it work?"
        });
      }
      if (!mentioned.term) {
        suggestions.push({
          label: "3-year term",
          text: "They prefer a 3-year commitment if the pricing works out."
        });
      }
      if (!mentioned.competitor) {
        suggestions.push({
          label: "Competitive switch",
          text: "They're switching from ZoomInfo — can we offer a competitive displacement discount?"
        });
      }
      suggestions.push({
        label: "Add more products",
        text: "They also want to add 10 Recruiter Corporate seats for their talent team."
      });
      return suggestions.slice(0, 4);
    }

    // Stage 8: Has pricing — refinement and quote stage
    if (hasPricing) {
      const suggestions = [];
      if (!mentioned.learning) {
        suggestions.push({
          label: "Add Learning",
          text: "Can we add LinkedIn Learning for 500 users to this deal?"
        });
      }
      suggestions.push({
        label: "Reduce to fit budget",
        text: "What if we reduce seat counts to get under the approval threshold?"
      });
      suggestions.push({
        label: "Strategic account",
        text: "This is a strategic account for us. Can we apply an additional discount?"
      });
      suggestions.push({
        label: "Generate quote",
        text: "This looks good. Can you summarize the final pricing and generate a quote?"
      });
      return suggestions.slice(0, 4);
    }

    // Default fallback — general follow-up suggestions
    return [
      {
        label: "3-year term",
        text: "They prefer a 3-year commitment if the pricing works out."
      },
      {
        label: "Add more products",
        text: "They also want to add 10 Recruiter Corporate seats for their talent team."
      },
      {
        label: "Budget conscious",
        text: "Their budget is around $150,000 per year. Can we make it work?"
      }
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#0A66C2]" />
        <span className="text-xs font-medium text-gray-500">Suggested replies</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className="px-3 sm:px-2.5 py-2 sm:py-1 text-xs bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedReplies;
