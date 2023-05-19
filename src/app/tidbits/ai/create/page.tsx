
import PageWrapper from "@/components/core/page/PageWrapper"
import { useState } from 'react';
import axios from 'axios';


  
const Create = () => {
  const [inputValue, setInputValue] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Instead of  the API endpoint  i Wrote '/api' 
      const response = await axios.post('/api', {
        prompt: inputValue,
      });

      const { generatedText } = response.data;
      setGeneratedText(generatedText);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
   <PageWrapper>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Text with GPT-4</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-indigo-500"
          rows={4}
          placeholder="Enter The content..."
        ></textarea>
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 mt-2 rounded hover:bg-indigo-600"
        >
          Generate
        </button>
      </form>
      </div>


   </PageWrapper>
  )
}

export default Create