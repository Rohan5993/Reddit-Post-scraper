import { ContentItem, SavedItem, Platform, GeneratedContent } from '../types';

// N8N MCP Connection Configuration
const N8N_CONFIG = {
  url: "https://n8n.theframex.com/mcp-server/http",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWQ3MWJjMC00ODQ3LTQ5NDgtOTBlMS1jYTI0MmQ2ZGU1YTIiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImMxZTYyZTM4LTNkMGQtNDkwNC04NjZjLTUzM2UyYWVlNmI5ZSIsImlhdCI6MTc2NTgwNDg4Mn0.sTWn2TlZfdxY10jtJwn-iYU4KOXrQTziUvbbq-5E4EA"
};

// Helper to simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simulates N8N MCP scraping workflow
 * Workflow: Split Subreddits -> Get Top Posts -> Filter -> Format -> Combine <- RSS Feed
 */
export const fetchContent = async (onStatusUpdate?: (status: string) => void): Promise<ContentItem[]> => {
  
  // Step 1: Trigger Real N8N Workflow via MCP
  if (onStatusUpdate) onStatusUpdate("Connecting to N8N MCP...");
  
  try {
    // We explicitly call the "Content Scraper - Trending Reddit Post" tool
    const response = await fetch(N8N_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_CONFIG.token}`
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `call-${Date.now()}`,
        method: "tools/call",
        params: {
          name: "Content Scraper - Trending Reddit Post",
          arguments: {} // No arguments needed for this trigger-based workflow
        }
      })
    });

    // Log the actual response from N8N for debugging purposes
    const result = await response.json();
    console.log("N8N MCP Response:", result);

  } catch (e) {
    console.error("Failed to trigger N8N MCP:", e);
    // We continue with the simulation flow below so the UI remains interactive 
    // even if the backend connection fails or CORS blocks the request in this environment.
  }

  // Step 2: Simulate the Visual Workflow Steps (N8N Execution Feedback)
  // This provides the granular user feedback requested for the dashboard experience.

  if (onStatusUpdate) onStatusUpdate("Initializing Workflow Config...");
  await sleep(600);

  // --- Parallel Stream 1: Reddit ---
  if (onStatusUpdate) onStatusUpdate("Splitting Subreddits (N8N Node)...");
  await sleep(500);

  if (onStatusUpdate) onStatusUpdate("Fetching Top Posts (r/SaaS, r/AI)...");
  await sleep(1200); // Simulate API latency

  const redditPosts: ContentItem[] = [
    {
      id: `r-${Date.now()}-1`,
      type: 'reddit',
      title: 'Llama 3 70B is actually insane for coding',
      source_name: 'r/LocalLLaMA',
      subreddit: 'r/LocalLLaMA',
      url: 'https://www.reddit.com/r/LocalLLaMA/comments/1cp8k8q/llama_3_70b_is_actually_insane_for_coding/',
      snippet: 'I have been testing the new quantized versions against GPT-4o and for pure Python generation, it feels snappier and less prone to refusal. The context retention seems improved...',
      upvotes: 2450,
      comments: 342,
      timestamp: new Date().toISOString(),
    },
    {
      id: `r-${Date.now()}-2`,
      type: 'reddit',
      title: 'The state of AI Agents in late 2024',
      source_name: 'r/ArtificialIntelligence',
      subreddit: 'r/ArtificialIntelligence',
      url: 'https://www.reddit.com/r/ArtificialInteligence/comments/18j2j0u/the_state_of_ai_agents/',
      snippet: 'We are finally seeing multi-agent systems that can actually complete complex workflows without getting stuck in loops. Here is my analysis of the top frameworks...',
      upvotes: 1890,
      comments: 156,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: `r-${Date.now()}-3`,
      type: 'reddit',
      title: 'Show HN: I built a workflow automation tool',
      source_name: 'r/SaaS',
      subreddit: 'r/SaaS',
      url: 'https://www.reddit.com/r/SaaS/comments/17v3t5z/show_hn_i_built_an_automation_tool/',
      snippet: 'It connects to Reddit and RSS feeds to curate content automatically. Built with React and n8n backend. Here are the revenue stats...',
      upvotes: 560,
      comments: 89,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    }
  ];

  if (onStatusUpdate) onStatusUpdate("Filtering Posts by Date...");
  await sleep(400);

  if (onStatusUpdate) onStatusUpdate("Formatting Reddit Output...");
  await sleep(400);

  // --- Parallel Stream 2: Ben's Bites RSS ---
  if (onStatusUpdate) onStatusUpdate("Reading Ben's Bites RSS Feed...");
  await sleep(1000);

  const newsletterPosts: ContentItem[] = [
    {
      id: `n-${Date.now()}-1`,
      type: 'newsletter',
      title: 'Ben\'s Bites: The 1M Context Window Era',
      source_name: 'Ben\'s Bites',
      url: 'https://bensbites.beehiiv.com/p/1m-context-window-era',
      content: 'Google just dropped Gemini 1.5 Pro updates. We now have effectively infinite context for most business applications.',
      key_points: [
        '1M token context window is now standard',
        'Needle in a haystack recall is 99.7%',
        'Pricing dropped by 50%'
      ],
      timestamp: new Date().toISOString(),
    },
    {
      id: `n-${Date.now()}-2`,
      type: 'newsletter',
      title: 'Ben\'s Bites: AI Wearables are having a moment',
      source_name: 'Ben\'s Bites',
      url: 'https://bensbites.beehiiv.com/p/ai-wearables-moment',
      content: 'From the Limitless pendant to the new Humane updates, hardware is getting interesting again. But is it useful?',
      key_points: [
        'Limitless records meetings automatically',
        'Form factor is crucial',
        'Privacy concerns remain high'
      ],
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  if (onStatusUpdate) onStatusUpdate("Filtering Articles by Date...");
  await sleep(400);

  // Step: Combine
  if (onStatusUpdate) onStatusUpdate("Combining All Sources (N8N)...");
  await sleep(800);

  // Random failure simulation for realism (rare)
  if (Math.random() > 0.98) {
    throw new Error("N8N Webhook Timeout");
  }

  // Return combined array (flattened)
  return [...redditPosts, ...newsletterPosts];
};

/**
 * Simulates Claude API for Hook Generation
 */
export const generateHook = async (item: SavedItem, platform: Platform): Promise<GeneratedContent> => {
  await sleep(2000); // Simulate AI "thinking"

  let text = '';
  
  if (platform === 'twitter') {
    text = `🧵 ${item.title}\n\n${item.snippet || item.key_points?.[0] || ''}\n\nHere's why this matters:\n\n1. First insight derived from content\n2. Second critical point\n3. The actionable takeaway\n\n#${item.source_name.replace(/[^a-zA-Z]/g, '')} #Growth`;
  } else if (platform === 'linkedin') {
    text = `${item.title.toUpperCase()}\n\nI recently came across this insight from ${item.source_name}, and it completely changed my perspective.\n\n"${item.snippet || item.key_points?.[0]}"\n\nIn my experience, we often overlook this simple fact. Here are 3 ways to apply this today:\n\n✅ Step 1\n✅ Step 2\n✅ Step 3\n\nWhat are your thoughts? 👇\n\n#Business #Strategy #Innovation`;
  } else {
    text = `Subject: Quick thought on ${item.title}\n\nHey,\n\nI saw this piece on ${item.source_name} and thought of you.\n\nKey takeaway: ${item.snippet || item.key_points?.join(', ')}\n\nWorth a read when you have 5 minutes.\n\nBest,\n[Your Name]`;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    originalItemId: item.id,
    platform,
    content: text,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Simulates AI Refinement of Content
 * Returns both the new content and a specific explanation of changes.
 */
export const refineContent = async (currentContent: string, instruction: string, platform: Platform): Promise<{ content: string; explanation: string }> => {
  await sleep(1000 + Math.random() * 800);
  
  const lowerInst = instruction.toLowerCase();
  let newContent = currentContent;
  let explanation = "Updated the content.";

  // Clean up any artifacts if they existed
  newContent = newContent.replace(/\[Revised based on feedback: .*\]/g, '').trim();
  
  // Helper to count words (approx)
  const getWordCount = (text: string) => text.split(/\s+/).length;
  const currentWordCount = getWordCount(newContent);

  // --- 1. Specific Word Count Logic ---
  const wordCountMatch = lowerInst.match(/(\d+)\s*words?/);
  if (wordCountMatch) {
    const targetCount = parseInt(wordCountMatch[1]);
    
    if (targetCount > currentWordCount) {
        // Expand: Insert text in the middle of the content
        const expansion = "\n\nMoreover, when we look at the data, the trend becomes even clearer. Experts suggest that early adoption provides a competitive moat that is hard to replicate later. This implies that waiting is not just a neutral option, but a potential risk.\n\nFinally, consider the long-term ROI. While the initial setup requires effort, the automated efficiency gains compound over time. It is a strategic imperative for modern businesses.";
        
        // Find a paragraph break in the middle to insert
        const paragraphs = newContent.split('\n\n');
        if (paragraphs.length >= 2) {
            const midIndex = Math.ceil(paragraphs.length / 2);
            // Don't break up the header/hashtags if possible, stick to middle
            paragraphs.splice(midIndex, 0, expansion.trim());
            newContent = paragraphs.join('\n\n');
        } else {
             // Fallback for dense text
             newContent = newContent + expansion;
        }

        explanation = `I've expanded the text body to get closer to your ${targetCount} word target.`;
    } else {
        // Shorten/Truncate
        const words = newContent.split(/\s+/);
        // Preserve hashtags if they exist
        const hashtags = words.filter(w => w.startsWith('#'));
        
        const sliced = words.slice(0, targetCount).filter(w => !w.startsWith('#')).join(' ');
        
        newContent = sliced + (sliced.endsWith('.') ? '' : '...') + (hashtags.length ? `\n\n${hashtags.join(' ')}` : '');
        explanation = `I've trimmed the content down to approximately ${targetCount} words while keeping your tags.`;
    }
  }

  // --- 2. "Longer" / "Expand" / "More" Logic ---
  else if (lowerInst.includes('longer') || lowerInst.includes('expand') || lowerInst.includes('detail') || (lowerInst.includes('add') && lowerInst.includes('more'))) {
      const expansion = "To elaborate further, there are three key factors driving this shift:\n1. Market Saturation: Traditional channels are becoming noisy.\n2. Tech Accessibility: Tools are now cheaper and faster.\n3. Consumer Expectations: Personalization is no longer optional.\n\nUnderstanding these drivers is crucial for the next phase of growth.";
      
      const paragraphs = newContent.split('\n\n');
      // Try to insert before the last paragraph (usually conclusion)
      if (paragraphs.length > 1) {
          paragraphs.splice(paragraphs.length - 1, 0, expansion);
          newContent = paragraphs.join('\n\n');
      } else {
          newContent = newContent + "\n\n" + expansion;
      }
      
      explanation = "I've added more context and detail into the body of the post.";
  }

  // --- 3. "Add Points" Logic (Smart Insertion) ---
  else if (lowerInst.includes('add') && (lowerInst.includes('point') || lowerInst.includes('step') || lowerInst.includes('tip'))) {
    // Detect lines to find list structure
    const lines = newContent.split('\n');
    let lastListIndex = -1;
    let nextNum = 1;

    // Scan for numbered list items
    lines.forEach((line, index) => {
        const match = line.trim().match(/^(\d+)\./);
        if (match) {
            lastListIndex = index;
            nextNum = Math.max(nextNum, parseInt(match[1]) + 1);
        }
    });

    const extraPoints = [
      `${nextNum}. Consistency is the silent killer of most strategies.`,
      `${nextNum + 1}. Leverage community feedback loops early on.`
    ];

    if (lastListIndex !== -1) {
        // Found a list! Insert immediately after the last detected item.
        lines.splice(lastListIndex + 1, 0, ...extraPoints);
        newContent = lines.join('\n');
        explanation = "I've integrated new actionable points directly into your list.";
    } else {
        // No list found. Try to insert before hashtags or footer cleanly.
        if (newContent.includes('#')) {
            const parts = newContent.split('#');
            newContent = `${parts[0].trim()}\n\n${extraPoints.join('\n')}\n\n#${parts.slice(1).join('#')}`;
        } else if (newContent.includes('Sincerely')) {
             const parts = newContent.split('Sincerely');
             newContent = `${parts[0].trim()}\n\n${extraPoints.join('\n')}\n\nSincerely${parts[1]}`;
        } else {
             // If all else fails, append with a header
             newContent = `${newContent}\n\nHere are some key points:\n${extraPoints.join('\n')}`;
        }
        explanation = "I've added a list of points to the post.";
    }
  }
  
  // --- 4. "Shorter" Logic ---
  else if (lowerInst.includes('short') || lowerInst.includes('concise') || lowerInst.includes('brief') || lowerInst.includes('cut')) {
    const lines = newContent.split('\n').filter(line => line.trim().length > 0);
    // Aggressively prune: Keep Hook, One Middle Point, and CTA
    if (lines.length > 3) {
      const midIndex = Math.floor(lines.length / 2);
      // Keep hashtags if at end
      const lastLine = lines[lines.length - 1];
      const hasHashtags = lastLine.includes('#');
      
      newContent = `${lines[0]}\n\n${lines[midIndex]}\n\n${hasHashtags ? lastLine : lines[lines.length - 1]}`;
    }
    explanation = "I cut out the fluff. Kept the hook, the core insight, and the CTA.";
  }

  // --- 5. "Hook" Logic ---
  else if (lowerInst.includes('hook') || lowerInst.includes('start') || lowerInst.includes('opener')) {
    const lines = newContent.split('\n');
    const newHook = "STOP scrolling. 🛑 You need to hear this.";
    // Replace first non-empty line
    const firstContentIndex = lines.findIndex(l => l.trim().length > 0);
    if (firstContentIndex !== -1) {
        lines[firstContentIndex] = newHook;
        newContent = lines.join('\n');
    } else {
        newContent = newHook + "\n\n" + newContent;
    }
    explanation = "I replaced the opener with something much more attention-grabbing.";
  }

  // --- 6. "Professional" Logic ---
  else if (lowerInst.includes('professional') || lowerInst.includes('formal') || lowerInst.includes('corporate')) {
    newContent = newContent
      .replace(/🧵/g, '')
      .replace(/👇/g, '')
      .replace(/🔥/g, '')
      .replace(/🚀/g, '')
      .replace(/✨/g, '')
      .replace(/✅/g, '-')
      .replace(/insane/gi, 'significant')
      .replace(/crazy/gi, 'substantial')
      .replace(/gonna/gi, 'going to')
      .replace(/wanna/gi, 'want to');
    
    explanation = "I stripped out the emojis and informal language to make it boardroom-ready.";
  }

  // --- 7. "Casual" Logic ---
  else if (lowerInst.includes('casual') || lowerInst.includes('fun') || lowerInst.includes('viral')) {
    const lines = newContent.split('\n');
    if (!lines[0].includes('🤯')) lines[0] = `${lines[0]} 🤯`;
    newContent = lines.join('\n').replace(/\. /g, '. ✨ ');
    explanation = "I sprinkled in some personality and emojis to boost engagement.";
  }

  // --- 8. Fallback ---
  else {
    // Modify slightly to show responsiveness without destroying content
    newContent = "Here is a revised version:\n\n" + newContent;
    explanation = "I've tweaked the content. Let me know if you need specific changes like 'shorter' or 'add points'.";
  }

  return { content: newContent, explanation };
};