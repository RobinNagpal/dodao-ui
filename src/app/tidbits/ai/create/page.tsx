'use client';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useState } from 'react';

const Create = () => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(`
    Step 1 - Introduction
    Uniswap V3's introduction of concentrated liquidity has transformed the game for liquidity providers, offering them an unparalleled level of flexibility through a range of strategic options.
    
    Choice of Pool: Liquidity providers can decide on which pool they wish to deposit their liquidity, offering a level of customization previously unattainable.
    Fee Selection: Providers can now select their fee tier, enabling them to align their liquidity provision with their risk tolerance and expected return on investment.
    Price Range Determination: Upon selecting a pool and fee, providers can then specify the price range within which they wish to place their liquidity.
    While this newfound flexibility brings with it a wealth of opportunities, it also ushers in a level of complexity that can seem daunting, particularly to those new to the DeFi space. This complexity prompts a multitude of questions:
    
    Strategic Approach: What should be the optimal strategy for a liquidity provider?
    Pool Selection: Which pool is the most suitable for their assets and goals?
    Asset Allocation: Should they deposit all their assets as liquidity, or reserve a portion?
    Range Width: Is it more advantageous to choose a wide or a narrow price range?
    Timeframe: What is the ideal duration for liquidity deposit?
    Rebalancing: Should they rebalance their position if their pool shifts out of the selected price range?
    
    These questions represent just a few of the considerations every liquidity provider must grapple with. As we delve further into this guide, we aim to explore these issues and provide guidance on the best strategies for liquidity providers navigating the dynamic world of Uniswap V3.
  `);
  const [response, setResponse] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  const prompt = `Create a tweet thread from the provided text. Try to keep the thread between 6-10 tweets. Keep the tweets short and add more number of tweets in thread.
  The contents of the tweets are for layman, so keep it as simple as possible.
  This is the JSON template I have given you the new content and you have to create me the one just like below 
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
  id: its a slug string. Infer or formulate it from the heading/name of the tweet
  content: Few words describing the topic of tweet thread.
  name: Infer a heading for tweet thread. Slugify this name and then use it in the id field defined above.
  
  steps: Describe the list of tweet threads. Steps have three dynamic fields
  name - infer it for the particular tweet
  content - contents of the tweet.
  
  Create the output in the json format and show in markdown code format. 
  focus on this --> "Here is the New content below return me the json only of the below content Never return tags" .
   
   ${input}`;

  const generateResponse = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResponse('');
    setLoading(true);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    setLoaded(true);
    const data = await response.json();
    console.log('data', data);
    setResponse(JSON.stringify(data, null, 2));
    // let generatedThread = JSON.stringify(response) ;
    // let jsonThread = JSON.parse(generatedThread) ;
    // let byteID = jsonThread.id ;
    // localStorage.setItem(byteID , JSON.stringify(jsonThread)) ;
    setLoading(false);

    // router.push(`tidbits/edit/${byteID}`);
  };

  return (
    <PageWrapper>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl text-white font-md mb-4">Generate Tidbits with AI </h1>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border text-[#212121] border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          rows={10}
          placeholder="Enter The content..."
        ></textarea>
        {!loading ? (
          <button className="w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-black/80" onClick={(e) => generateResponse(e)}>
            Generate Response &rarr;
          </button>
        ) : (
          <button disabled className="w-full rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white">
            <div className="animate-pulse font-medium tracking-widest">Tidbits is Getting Generated by AI </div>
          </button>
        )}
        {loaded && <div className="mt-8 rounded-xl border text-[#212121] bg-white p-4 shadow-md transition hover:bg-gray-100">{response}</div>}
      </div>
    </PageWrapper>
  );
};

export default Create;
