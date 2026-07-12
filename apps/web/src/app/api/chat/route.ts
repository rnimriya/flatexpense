import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { getToken, userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = await getToken();

    let contextString = "Demo Apartment Context: 4 active roommates (Alice, Bob, Charlie, You). Total expenses this month: $1294.00. Upcoming bill: Electric ($120.50). You owe Bob $45.50.";
    try {
      const contextRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/context`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (contextRes.ok) {
        const data = await contextRes.json();
        contextString = data.context;
      }
    } catch (err) {
      console.warn("DB Connection failed. Using demo context for AI.");
    }

    const systemPrompt = `You are a helpful, witty, and precise financial and household assistant for an apartment shared by roommates. 
You help them manage their expenses, settle debts, and keep track of chores. 
Here is the current live context of the apartment:
---
${contextString}
---
Answer the user's questions based on this context. Be concise and friendly. If they ask about something not in the context, gently tell them you don't have that information.`;

    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
