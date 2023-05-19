import axios from 'axios';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Define the initial prompt
      const prompt = `Create a tweet thread from the provided text. Try to keep the thread between 6-10 tweets. Keep the tweets short and add more number of tweets in thread.The contents of the tweets are for layman, so keep it as simple as possible.This is the JSON template I have given you the new content and you have to create me the one just like below
       {
          "postSubmissionStepContent": null,
          "content": "Benefits of Automated Market Maker over Order Book",
          "created": "2023-04-13T18:58:14.031Z",
          "id": "amm-benefits-uniswap",
          "name": "AMM Benefits",
          "publishStatus": "Live",
          "admins": [],
          "tags": [],
          "priority": 0,
          "steps": [{
              "content": "\nAutomated Market Makers (AMMs) and Order Books are two different types of systems for executing trades. An Automated Market Maker (AMM) is a type of decentralized exchange (DEX) protocol that allows traders to trade cryptocurrencies and other digital assets without an order book or an intermediary.\n\nAMMs offer many benefits over order books.",
              "stepItems": [],
              "name": "Introduction",
              "order": 0,
              "uuid": "7f31e672-0c52-4d89-9d40-9f348c5f5e5b"
          }, {
              "content": "AMMs provide liquidity to traders with always available prices, while order books require both buyer and seller to agree on a price leading to low liquidity for some assets.",
              "stepItems": [],
              "name": "Introduction Evaluation",
              "order": 1,
              "uuid": "e0b6f53b-3dc4-4e4c-af25-90f4cd7d9d9a"
          }, {
              "content": "AMMs do not need order matching, using a mathematical formula for price discovery based on the asset ratio in the pool.\n",
              "stepItems": [],
              "name": "Step 3",
              "order": 2,
              "uuid": "7d56df42-bafc-4dcb-9e9b-6b3811f32e3c"
          }, {
              "content": "Because AMMs utilize smart contracts and mathematical formulas, traders can exchange assets around the clock, while traditional trading is restricted to operating hours.",
              "stepItems": [],
              "name": "Step 4",
              "order": 3,
              "uuid": "5b52f5f5-5d5d-4325-8c43-882106b69838"
          }, {
              "content": "AMMs have reduced risks of price manipulation compared to order books that are susceptible to it.",
              "stepItems": [],
              "name": "Step 5",
              "order": 4,
              "uuid": "9f2b07f1-964d-4b10-ae5e-97d53b29b95a"
          }, {
              "content": "Additionally, AMMs have lower barriers to entry, allowing traders to add liquidity to the pool and earn fees instead of requiring significant capital to participate in the market.",
              "stepItems": [],
              "name": "Step 6",
              "order": 5,
              "uuid": "c6a3b2f2-1e9c-4a8b-bcf6-01896c28f0de"
          }]
      }Here is the discription of the fields
      id: its a slug string. Infer or formulate it from the heading/name of the tweet
      content: Few words describing the topic of tweet thread.
      name: Infer a heading for tweet thread. Slugify this name and then use it in the id field defined above.
      steps: Describe the list of tweet threads. Steps have three dynamic fields
      name - infer it for the particulat tweet
      content - contents of the tweet.
      uuid - random generated uuid4. Generate a new random uuidv4 for each uuid field.
      created: is the ISO date reperesentation of the current date and time
      other fields are all static and dont change.
      Create the output in the json format and show in markdown code format. 
      Here is the New content below return me the json only of the below content .`
       ;  
      
      // Get the user text from the request body
      const { userText } = req.body;

      // Call the GPT-4 API with the prompt and user text to generate the Twitter thread
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: `${prompt}\n\n${userText}`,
          max_tokens: 2048,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer GPT4_API_KEY', 
            // I haven't added the gptkey in .env
          },
        }
      );

      // Extract the generated Twitter thread from the API response
      const generatedThread = response.data.choices[0].text.trim();


      // Still have confusion in this part . 
      // Read the existing JSON file
      const filePath = 'json/file.json';
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(jsonData);

      // Update the data with the modified values
      data.content = prompt;
      data.steps[0].content = generatedThread;

      // Write the updated data back to the JSON file
      fs.writeFileSync(filePath, JSON.stringify(data));

      // Send the modified data as the API response
      res.status(200).json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
