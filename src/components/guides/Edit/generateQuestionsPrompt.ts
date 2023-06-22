export default function generateQuestionsPrompt(topic: string, numberOfQuestions: number, contents: string) {
  return `
Create ${numberOfQuestions} MCQ questions with four choices related to the following Topic: ${topic} from the below text. Mention the correct choice and the explanation also.

Then populate the questions in the following JSON template


[{
  "content": "What are some of the reasons for exchanging cryptocurrencies?",
  "answerKeys": [
    "B"
  ],
  "explanation": "Cryptocurrencies are exchanged for reasons like investment, trading, hedging, risk management, payment purposes, access to new tokens and projects, and regulatory compliance.",
  "choices": [{
      "content": "For gaming purposes only",
      "key": "A"
    },
    {
      "content": "Investment, trading, hedging, risk management, payment purposes, access to new tokens and projects, and regulatory compliance",
      "key": "B"
    },
    {
      "content": "For online shopping only",
      "key": "C"
    },
    {
      "content": "As a means to exchange physical goods",
      "key": "D"
    }
  ]
}]    

Here is the description of the fields
- content is the question
- explanation field includes the explanation for the correct choice
- answerKeys includes the "key" field corresponding to the correct choice. The choices are present in the choices field that is explained below.
- choices has two fields. "content" field is the content of the choice and a random character from A,B,C,D goes into the "key" Field. The key corresponding to the correct choice goes in "answerKeys" field. Make sure the correct choice is random for every question.

Output the questions as json array. 

focus on this --> "Here is the New content below return me the json array only of the below content Never return tags" .
    
Here is the text for creating the questions 
${contents}`;
}
