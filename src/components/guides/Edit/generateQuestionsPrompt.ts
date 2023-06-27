export default function generateQuestionsPrompt(topic: string, numberOfQuestions: number, contents: string) {
  return `
Create ${numberOfQuestions} MCQ questions with four choices related to the following Topic: ${topic} from the below text. Mention the correct choice and the explanation also.

Then populate the questions in the following JSON template


[{
  "content": "What is an asset?",
  "answerKeys": [
    "A"
  ],
  "explanation": "Property owned by a person or company, regarded as having value and available to meet debts, commitments, or legacies.",
  "choices": [{
      "content": "Something that is owned by a person or company and increases in value over time",
      "key": "A"
    },
    {
      "content": "Something that you buy from a shop",
      "key": "B"
    },
    {
      "content": "Something that decreases in value over time",
      "key": "C"
    },
    {
      "content": "Something that you buy for fun",
      "key": "D"
    }
  ]
}]    

Here is the description of the fields
- content is the question
- explanation field includes the explanation for the correct choice
- answerKeys includes the "key" field corresponding to the correct choice. The choices are present in the choices field that is explained below.
- choices has two fields. "content" field is the content of the choice and a random character from A,B,C,D goes into the "key" Field. The key corresponding to the correct choice goes in "answerKeys" field. Make sure the correct choice is random for every question.

    
Here is the text for creating the questions 
${contents}



Make sure
- Only one choice is correct and rest are incorrect.
- Output the questions as json array. 
- Output should be in pure and valid JSON Array format.

The JSON object:
`.trim();
}
