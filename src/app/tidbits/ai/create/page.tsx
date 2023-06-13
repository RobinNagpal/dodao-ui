'use client';
import UnstyledTextareaAutosize from '@/components/app/TextArea/UnstyledTextareaAutosize';
import LoadingComponent from '@/components/core/loaders/Loading';
import { NotificationProps } from '@/components/core/notify/Notification';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { AskChatCompletionAiQuery, ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiQuery } from '@/graphql/generated/generated-types';
import { ApolloQueryResult } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Create = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('Generate response');
  const { refetch: askChatCompletionAiQuery } = useAskChatCompletionAiQuery({ skip: true });

  const [input, setInput] =
    useState(`Uniswap V3's introduction of concentrated liquidity has transformed the game for liquidity providers, offering them an unparalleled level of flexibility through a range of strategic options.
   
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

  const { showNotification } = useNotificationContext();
  const handleShowNotification = (notificationProps: NotificationProps) => {
    showNotification(notificationProps);
  };

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
    if (!e) {
      return;
    }

    const timeoutDuration = 50000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutDuration);
    });

    try {
      const responsePromise = askChatCompletionAiQuery({
        messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: prompt }],
      });

      const response = (await Promise.race([responsePromise, timeoutPromise])) as ApolloQueryResult<AskChatCompletionAiQuery>;

      const data = await response.data?.askChatCompletionAI.choices?.[0]?.message?.content;

      if (!data) {
        throw new Error(JSON.stringify(response));
      }

      const parsedData = JSON.parse(data);
      setLoaded(true);
      console.log('data', data);
      setResponse(data);
      setLoading(false);
      setText('Generated');

      if (data) {
        localStorage.setItem(parsedData.id, data);
        router.push(`/tidbits/edit/${parsedData.id}`);
      } else {
        handleShowNotification({
          heading: 'Error',
          type: 'error',
          message: 'The Tidbit Was not generated properly either the content given was inappropriate or server issue please try again later ',
        });
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      handleShowNotification({ heading: 'TimeOut Error', type: 'error', message: 'This request Took More time then Expected Please Try Again' });
    }
  };

  return (
    <PageWrapper>
      <div className=" md:ml-20">
        <div className=" container  mx-auto p-4 flex flex-col ">
          <h1 className="md:text-5xl text-4xl text-[#9291cd] font-semibold mb-10">Create Tidbits Via AI </h1>

          <UnstyledTextareaAutosize
            autosize={true}
            modelValue={input}
            onUpdate={(e) => setInput(String(e))}
            className="border-solid border-2 border-[#9291cd]"
            maxHeight={500}
          />
          {!loading ? (
            <button
              className="mt-5 md:w-[40%] w-[50%] rounded-xl bg-[#9291cd] px-4 py-2 font-medium text-white/80 hover:b hover:text-white hover:border-white"
              onClick={(e) => generateResponse(e)}
            >
              {text} &rarr;
            </button>
          ) : (
            <button
              disabled
              className="mt-5 md:w-[40%] w-[50%] rounded-xl bg-[#9291cd] px-4 py-2 font-medium text-white/80 hover:b hover:text-white hover:border-white"
            >
              <div className="flex flex-row justify-around">
                <div className="animate-pulse font-lg tracking-widest ">AI is generating... </div> <LoadingComponent />{' '}
              </div>
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Create;
