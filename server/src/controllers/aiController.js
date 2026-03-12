import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.AI_API_KEY;
const client = new Mistral({ apiKey });

export const getAISuggestions = async (req, res) => {
  const { prompt, context } = req.body;
  try {
    if (!apiKey) {
      return res.status(500).json({ error: 'AI_API_KEY is not configured on the server.' });
    }

    const response = await client.chat.complete({
      model: "mistral-tiny",
      messages: [
        { 
          role: "system", 
          content: "You are an Agentic Travel Assistant. You help users plan trips, suggest itineraries, and manage budgets. Always provide helpful, concise, and structured advice." 
        },
        { 
          role: "user", 
          content: `Context: ${JSON.stringify(context)}. User request: ${prompt}` 
        }
      ],
    });

    res.json({ content: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'AI Agent failed', details: error.message });
  }
};

export const suggestItinerary = async (req, res) => {
  const { destination, days, budget } = req.body;
  try {
    const prompt = `Suggest a ${days}-day itinerary for ${destination} with a budget of ${budget}. Format the output as a JSON-like structure with Day, Time, and Activity.`;
    
    const response = await client.chat.complete({
      model: "mistral-tiny",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    res.json({ itinerary: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Itinerary suggestion failed', details: error.message });
  }
};
