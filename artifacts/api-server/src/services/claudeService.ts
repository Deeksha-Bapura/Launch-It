// =============================================================
// CLAUDE AI SERVICE
// To activate: add ANTHROPIC_API_KEY to your environment secrets,
// then uncomment the Anthropic section below and delete the mock.
// =============================================================

// import Anthropic from '@anthropic-ai/sdk';
//
// const client = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });
//
// const SYSTEM_PROMPT = `
// You are LaunchIt, a friendly and knowledgeable business guide
// for people who are already making money informally and want to
// understand how to run their business properly and legally.
//
// Your goals:
// 1. Understand what the person sells or does using plain
//    conversational language. Never ask them to fill out a form
//    or use business jargon like "entity type" or "EIN."
// 2. Through natural conversation, extract:
//    - What they sell or do
//    - Where they are (city — you only have data for Houston and Austin, TX)
//    - Whether they work from home or a physical location
//    - Whether they have employees or work alone
//    - Rough sense of how much they make
// 3. Map their situation to the specific permits, registrations,
//    and tax obligations required in their city and county.
//    For Houston: Harris County rules. For Austin: Travis County.
// 4. Give step-by-step guidance in plain English. Short responses.
//    One question at a time. Never bullet-point dump.
// 5. When you have enough information, offer to generate one of:
//    a simple invoice template, a profit/loss tracker, a pricing
//    calculator, or a social media post template.
// 6. Surface compliance deadlines proactively. Example:
//    "Texas quarterly sales tax is due April 20. Here is what you do."
// 7. Tone: warm, direct, non-patronising. Like a smart friend who
//    knows business law — not a government website.
//
// IMPORTANT LIMITATIONS:
// - You only have accurate permit data for Houston (Harris County)
//   and Austin (Travis County), TX.
// - If someone is elsewhere, say so clearly and offer general
//   guidance only with a clear disclaimer.
// - Never give legal advice. Give guidance and information only.
// - Always end responses that involve permits or legal steps with:
//   "Worth double-checking this with the relevant agency — rules
//   do change, and I want to make sure you have the latest."
// `;
//
// export async function chat(conversationHistory: Array<{role: string; content: string}>): Promise<string> {
//   const response = await client.messages.create({
//     model: 'claude-opus-4-5',
//     max_tokens: 1024,
//     system: SYSTEM_PROMPT,
//     messages: conversationHistory as any,
//   });
//   return (response.content[0] as any).text;
// }

// =============================================================
// MOCK RESPONSE — active until API key is added
// Delete this function once you uncomment the real one above
// =============================================================
export async function chat(conversationHistory: Array<{ role: string; content: string }>): Promise<string> {
  const lastMessage = conversationHistory[conversationHistory.length - 1].content.toLowerCase();

  if (lastMessage.includes('cake') || lastMessage.includes('bak') || lastMessage.includes('cookie')) {
    return "Love it — a home baking business! Quick question before anything else: are you selling just to people you know personally, or are you also thinking about farmers markets or local stores? That changes which rules apply to you.";
  }
  if (lastMessage.includes('tamale') || lastMessage.includes('taco') || lastMessage.includes('food') || lastMessage.includes('cook') || lastMessage.includes('meal')) {
    return "A home food business — great starting point. Are you in Houston or Austin? I have the specific permit requirements for both. Just want to make sure I give you the right info, not a generic answer.";
  }
  if (lastMessage.includes('hair') || lastMessage.includes('nail') || lastMessage.includes('lash') || lastMessage.includes('braid') || lastMessage.includes('beauty')) {
    return "Got it — beauty services. Quick one: are you working from home, going to clients, or both? That actually matters for which licenses apply in Texas.";
  }
  if (lastMessage.includes('houston')) {
    return "Houston — you're in Harris County. Good news: Texas is actually pretty business-friendly for people just starting out. For most home-based businesses, the first thing to figure out is whether you need a permit at all, or just a simple registration. What do you sell or do?";
  }
  if (lastMessage.includes('austin')) {
    return "Austin, Travis County — got it. Texas has some great options for home-based businesses. Tell me what you sell or do and I can tell you exactly what applies to you, because the rules are pretty different depending on your type of business.";
  }
  if (lastMessage.includes('clean') || lastMessage.includes('maid') || lastMessage.includes('housekeep')) {
    return "Cleaning services — solid business. In Texas, this is one of the simpler ones to set up. Are you working alone or do you have anyone helping you? And are you in Houston or Austin?";
  }
  if (lastMessage.includes('lawn') || lastMessage.includes('yard') || lastMessage.includes('landscap') || lastMessage.includes('mow')) {
    return "Lawn and landscaping — another good one in Texas. Are you solo or do you have helpers? And Houston or Austin? Those two things will shape everything else.";
  }
  if (lastMessage.includes('jewelry') || lastMessage.includes('craft') || lastMessage.includes('sell') || lastMessage.includes('make')) {
    return "Nice — handmade or resale business. Are you selling in person, online, or both? And where are you based?";
  }
  if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey') || lastMessage.includes('start') || lastMessage.includes('help')) {
    return "Hey! Tell me a bit about what you sell or do — even just one sentence is enough. Something like 'I bake cakes and sell them to my neighbors' or 'I do people's nails at home.' I'll take it from there.";
  }

  return "That's helpful. Can you tell me a bit more about where you're based — Houston or Austin? And are you working from home or somewhere else? I want to make sure I give you the right information for your specific situation, not a generic answer.";
}
