
## **Clickable Demos Flow**
- **Code** - Code of clickable demos is present here https://github.com/RobinNagpal/dodao-ui/tree/main/clickable-demos. 
  We have two typescript files and one scss file. We compile these into css and javascript and upload these files to s3. 
  Then these files are included in the html file which is uploaded by the user via extension.

   `package.json`  - See compilation commands here
   ```
    "compile": "tsc",
    "build:scss": "sass --no-source-map src/styles/clickableDemoTooltipStyles.scss prod-files/clickableDemoTooltipStyles.css",
    "build": "tsc && npm run build:scss",

   ```
  
    `Makefile` - See upload commands here
    ```
     upload-clickable-demo-files-to-prod:
  	 aws s3 cp prod-files/clickableDemoTooltipScript.js s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoTooltipScript.js --acl public-read
  	 aws s3 cp prod-files/clickableDemoServiceWorker.js s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoServiceWorker.js --acl public-read
  	 aws s3 cp prod-files/clickableDemoTooltipStyles.css s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoTooltipStyles.css --acl public-read

     upload-clickable-demo-dependencies-to-prod:
     aws s3 cp prod-files/dependencies s3://dodao-prod-public-assets/clickable-demos-prod-files/dependencies/ --recursive --acl public-read
     ```
- Main files are 
  - `clickableDemoTooltipScript.js` 
  - `clickableDemoServiceWorker.js` 
  - `clickableDemoTooltipStyles.css`

- Three main functionalities are 
  - Uploading of HTML Files - This is done via extension
  - Element Selector - `clickableDemoTooltipScript.js` is the file that has the code for creating an overlay which shows the element selected and finding the xpath of the selected element. After the user selects the element we store the xpath of the element.
  - Showing of the tooltip -



# **1. Uploading HTML Files**

When an HTML file is uploaded through the extension, scripts are injected into the file before uploading. Mention a bit about which files are injected, and tell about the three files we have on outside which we maintain.




TODO - We have not yet tested the impact of the worker file for caching, but we need to verify if its useful, if not we should remove it

These scripts act as event listeners for handling interactions initiated via the web app. Events are communicated using a message-passing technique, and there are three primary events:


# 2. Element Selector
- Explain the message passing
- Explain how overlay is created
- Explain how xpath is found
- Explain handling of nested iframes

### Nested Iframe Handling

# 3. Showing Tooltip
- Explain how message passing works
- Message passing on Next and Back buttons 
- Explain the iframes crated for caching
- Explain handling of nested iframes

### Nested Iframe Handling


-------------------

### **2. Events Overview**


#### **a. Showing Tooltip**

This event is triggered when:



* A user opens a clickable demo.
* The ‘Next’ or ‘Back’ button is pressed on the tooltip.

**Flow:**



1. **Document Readiness Check**:
    * The script ensures the document is fully loaded by waiting for the `onLoad` event if necessary.
2. **Tooltip Rendering**:
    * The event includes the `xpath` of the target element and the text to display.
    * If the target element is inside an iframe:
        * Required stylesheets are attached to the iframe, as iframes cannot inherit styles from the parent document.
    * The script identifies the target element via `xpath` and attaches a Tippy.js tooltip to it.
3. **Button Event Listeners**:
    * Click event listeners are attached to the ‘Next’ and ‘Back’ buttons.
    * These listeners send events back to the web app, indicating the button clicked. The web app then updates the display, showing the next iframe while hiding the current one.


---


#### **b. Element Selector**

This event is triggered when the user opens the element selector modal.

**Flow:**



1. **Event Listeners**:

We attach the following event listeners to document:



    * **Mouse Over Event**: Creates an overlay effect on the hovered element for visual focus.
    * **Click Event**: Calculates the `xpath` of the selected element.
    * If the document contains iframes:
        * These event listeners are attached to each iframe individually.
2. **Zoom Options**:
    * Users can zoom in to the next sibling or zoom out to the parent of the currently selected element.
3. **Element Selection**:
    * On clicking the select button, the script captures a screenshot of the selected element using the `html2canvas` library.


---


#### **c. Setting CSS Variables**

This event is used to dynamically apply themes to the document.

**Flow:**



1. **CSS Variable Injection**:
    * The web app passes theme-related CSS variables to the document.
    * These variables are applied to the document’s styles.
2. **Iframe Handling**:
    * If the document contains iframes, the variables are iteratively applied to each iframe to ensure consistent styling.
