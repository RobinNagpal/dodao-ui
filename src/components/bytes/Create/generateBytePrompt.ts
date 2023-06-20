export default function generateBytePrompt(topic: string, contents: string) {
  return `
  Use the content provided create the summary of the topic: ${topic} in simple 4-8 paragraphs. Obey the following rules:
  1. The summary should be in simple language and easy to understand.
  2. The summary should be in your own words and not copied from the content provided.
  3. The summary should be between 4-8 paragraphs.
  4. The summary should be related to the topic: ${topic}
  5. Length of each paragraph should be between 100-200 words.
  6. Each paragraph should have at least 2-3 sentences. 
     
  This is the JSON template I have given you the new content and you have to create me the one just like below
  JSON Template:
  {

    "content": "Benefits of Automated Market Maker over Order Book",
    "id": "amm-benefits-uniswap",
    "name": "AMM Benefits",
    
    
    "steps": [{
      "content": "\nAutomated Market Makers (AMMs) and Order Books are two different types of systems for executing trades. An Automated Market Maker (AMM) is a type of decentralized exchange (DEX) protocol that allows traders to trade cryptocurrencies and other digital assets without an order book or an intermediary.\n\nAMMs offer many benefits over order books.",
      "name": "Introduction"
    }, {
      "content": "AMMs provide liquidity to traders with always available prices, while order books require both buyer and seller to agree on a price leading to low liquidity for some assets.",
      "name": "Introduction Evaluation",
    }, {
      "content": "AMMs do not need order matching, using a mathematical formula for price discovery based on the asset ratio in the pool.\n",
      "name": "Step 3"
    }, {
      "content": "Because AMMs utilize smart contracts and mathematical formulas, traders can exchange assets around the clock, while traditional trading is restricted to operating hours.",
      "name": "Step 4"
    }, {
      "content": "AMMs have reduced risks of price manipulation compared to order books that are susceptible to it.",
      "name": "Step 5"
    }, {
      "content": "Additionally, AMMs have lower barriers to entry, allowing traders to add liquidity to the pool and earn fees instead of requiring significant capital to participate in the market.",
      "name": "Step 6"
    }]
  }
  Here is the description of the fields
  id: its a slug string. Infer or formulate it from the heading/name of the paragraph
  content: Few words describing the topic of output.
  name: Infer a heading for paragraph. Slugify this name and then use it in the id field defined above.
  
  steps: Describe the list of paragraphs. Steps have three dynamic fields
  name - infer it for the particular paragraph
  content - contents of the paragraph.
  
  Create the output in the json format and show in markdown code format. 
  focus on this --> "Here is the New content below return me the json only of the below content Never return tags" .
   
   ${contents}`;
}
