export function getChartPrompt(content: string) {
  return (
    '' +
    `
Create two charts focusing  on the effects of tariffs. Follow the following rules for charts
- Within the graph add a 2-3 line "Caption" explaining what this graph is.
- Below the graph and above the "Caption", explain each label in detail. Add one line for each label 
-  The labels should not overlap one another. 
- Allocate ~25-35% of the height of the full graph just for the information i.e. the label information and the Caption. 
- Insert line breaks in label description and Caption if they are too long and wont fit in one line easily.
- Use the relevant type of chart for showing the information 
- The charts should be black theme based and the colors should be some shades of "#4F46E5" color. 
`
  );
}
