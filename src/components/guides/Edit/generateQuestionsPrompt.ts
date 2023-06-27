export default function generateQuestionsPrompt(topic: string, numberOfQuestions: number, contents: string) {
  return `
Create ${numberOfQuestions} MCQ questions with four choices related to the following Topic: ${topic} from the below text. Mention the correct choice and the explanation also.

Then populate the questions in the following JSON template


[{
  "content": "Question 1",
  "answerKeys": [
    "B"
  ],
  "explanation": "Explanation for the correct choice",
  "choices": [{
      "content": "Choice A",
      "key": "A"
    },
    {
      "content": "Choice B",
      "key": "B"
    },
    {
      "content": "Choice C",
      "key": "C"
    },
    {
      "content": "Choice D",
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
- Output the questions as json array. 
- Output should be in pure and valid JSON Array format.

focus on this --> "Here is the New content below return me the json array only of the below content Never return tags" .


`;
}
