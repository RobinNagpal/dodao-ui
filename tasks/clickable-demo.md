# Clickable demo issues

## In extension

- [ ] Input field (save file name) doesnt get into focus for typing. Have to click like 10 times
- [ ] Upon saving the file, 'Updating..' stops to happen if i dont stay on the same tab. But its not 100% sure
- [ ] Wording can be improved

## In platform

- [ ] Sometimes the 'Select' button doesnt get clicked
- [ ] The element selector doesnt have a button to unselect the selection
- [ ] The upload in element selector shows the captures but there isnt any button to delete those captures as i accidently saved some and they got clustered in there. Suggestion: We can have a small cross button on the top right of each capture.
- [ ] The element selector opens up pretty slow
- [ ] On UI, when we open a clickable demo, the second step doesnt show the tooltip on first attempt. If we close and opens again then it works.
- [ ] The time interval to show the tooltip can be reduced


### Checklist of Issues

1. **Save Button Clicks**  
   - Need to click the save button multiple times for it to register.

2. **Image Distortion**  
   - Images appear distorted after being loaded or manipulated.

3. **Slow Element Selector**  
   - Element selector takes a long time to load or respond.

4. **Error Message**  
   - Occasionally received the following error message:
     ```
     TypeError: Cannot read properties of null (reading 'postMessage')
     ```

5. **Previous Frame Issue**  
   - When opening the element selector, the previous frame sometimes appears in the selector instead of the current frame.

6. **Tooltip Visibility**  
   - Tooltips do not appear on the first attempt; they only show up after reloading the demo.

7. **Tooltip Distortion**  
   - The tooltip occasionally distorts or overlaps awkwardly over the selected element.

8. **Accordion Elements Not Showing in Selector**  
   - When attempting to select an element inside an accordion, the selector doesn’t display the expanded accordion contents most of the time.

9. **Iframe Replacement not working properly**
   - Since we are replacing the iframe with srcdoc, there are certain iframes where srcdoc is an empty string, we need to fetch the html from the src url in that case.