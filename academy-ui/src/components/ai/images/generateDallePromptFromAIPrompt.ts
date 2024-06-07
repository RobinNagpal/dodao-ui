export default function generateDallePromptFromAIPrompt(topic: string, details: string) {
  return `
TOPIC = "${topic}"
DETAILS = "${details}"

Generate an image description (within 30 words) with the theme as TOPIC and image
depicts DETAILS. Strictly ensure the following rules while generating the description:
- Depict the basic essence of the DETAILS
- Do not use terms like representing and symbolizing in the description.
- The image must not include any numbers, digits, alphabets, texts, irrelevant, absurd, or odd icons/signs, even if suggested by the DETAILS or TOPIC.
- Also refrain from mentioning anything particular in image description which can only be described in numbers/digits or quantitative values.
- Do not invent or add any details that are not suggested by the DETAILS.
- The image should be of high quality, preferably no less than 300 dpi for print or 72 dpi for web.
- The image should be clear, without any ambiguous elements.
- The image should be visually appealing, avoiding overly bright or clashing colours.
`;
}
