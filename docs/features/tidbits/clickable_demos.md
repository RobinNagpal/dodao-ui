## **Clickable Demos Flow**

- **Code** - Code of clickable demos is present here https://github.com/RobinNagpal/dodao-ui/tree/main/clickable-demos.
  We have two typescript files and one scss file. We compile these into css and javascript and upload these files to s3.
  Then these files are included in the html file which is uploaded by the user via extension.

  `package.json` - See compilation commands here

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

  - `clickableDemoTooltipScript.js` - This file is used both in edit mode that is when element is being selected and 
     also for showing of the tooltip. We just wanted to have one file for all the functionality. This file has the code 
     for creating an overlay which shows the element selected and finding the xpath of the selected element. After the 
     user selects the element we store the xpath of the element.
  - `clickableDemoServiceWorker.js` - This is for improving caching. We need to check if we really need it or not. 
     We have not yet tested the impact of the worker file for caching, but we need to verify if its useful, if not we 
     should remove it
  - `clickableDemoTooltipStyles.css` - This is the css file for styling the tooltip

- Three main functionalities are
  - Uploading of HTML Files - This is done via extension
  - Element Selector - `clickableDemoTooltipScript.js` is the file that has the code for creating an overlay which shows the element selected and finding the xpath of the selected element. After the user selects the element we store the xpath of the element.
  - Showing of the tooltip -

# **1. Uploading HTML Files**
Here is the flow of the extension
1. Extension accepts the inputs from the user like the collection and the clickable demo name. It also has authentication logic.
2. The extension then downloads the HTML file from the tab as zip. 
3. We update the HTML file to include the scripts and stylesheets required for the clickable demos. This part is done before the contents are zipped.
4. The extension then uploads the zip to the server(s3 location). The zip has html with all the other images and files that are shown in the html file.
5. We create an entry in the database for the `ClickableDemoHtmlCaptures` which references the uploaded file, the page screenshot, and the selected 
clickable demo. Till here there is no selection of the element. That will happen on tidbitshub.
6. In tidbits hub we will show the list of all `ClickableDemoHtmlCaptures` for the demo. The user can select the element and then we will show the tooltip.

When an HTML file is uploaded through the extension, scripts are injected into the file before uploading. 
```javascript
function getScriptLinkTags() {
  return [
    `<link rel="stylesheet" href="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/dependencies/tippy.js@6/animations/shift-toward.css" />`,
    `<link rel="stylesheet" href="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/dependencies/tippy.js@6/themes/material.css" />`,
    `<script src="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/dependencies/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>`,
    `<script src="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/dependencies/tippy.js@6.3.7/dist/tippy-bundle.umd.min.js"></script>`,
    `<script src="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/dependencies/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>`,
    `<link rel="stylesheet" href="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/clickableDemoTooltipStyles.css" />`,
    `<script src="${CLIKABLE_FILES_HOST_URL}/clickable-demos-prod-files/clickableDemoTooltipScript.js"></script>`,
    getCustomScriptTag(),
  ];
}
```

These are the files that are injected into the HTML files.
- `Tippy.js` - This is used for creating the tooltip
- `Popper.js` - This is used for positioning the tooltip
- `html2canvas` - This is used for taking the screenshot of the element in the clickable demo. Its not need here, but we 
inject it here itself along with other scripts. This is not as accurate as the screenshot captured by the extension, so 
the screen's screenshot is captured by the extension and the element screenshot is captured by the script.



# 2. Element Selector

### Flow
The element selection logic is present in `ElementSelectorModal.tsx` file. The element selector is a modal that opens 
when the user clicks on the `Select Element` button. The user can then hover over the element they want to select and 
click on it. The element selector then captures the xpath of the selected element.

When the user opens the element selector modal, we pass a message from the `elementSelector` to the main window object(the 
component rendering the iframe) with the data about the selected element.

In `ElementSelectorModal.tsx` file, within the useEffect hook, the component sets up a message listener to interact 
with an iframe in which we show the Captured HTML. The listener receiveMessage waits for messages from the iframe, which 
includes the selected element's XPath and its image encoded in Base64. 

This image of the selected element is then uploaded to s3 and the URL is stored in the database. The xpath of the selected
element is set in the step of the clickable demo. 

```typescript
iframe.contentWindow!.postMessage(
  {
    type: "elementSelector",
    buttonColor: space?.themeColors?.primaryColor,
    buttonTextColor: space?.themeColors?.textColor,
    hoverColor: space?.themeColors?.bgColor,
    selectedColor: space?.themeColors?.primaryColor,
    xpath: xPath,
  },
  "*"
);
```

Here are the elements of the step
```typescript
export interface ClickableDemoStepDto {
  elementImgUrl?: string;
  id: string;
  order: number;
  placement: TooltipPlacement;
  screenImgUrl?: string;
  selector: string;
  tooltipInfo: string;
  url: string;
}
```
So we populate url which is the url of the HTML capture. The `screenImgUrl` which is the screenshot of the page and the
`elementImgUrl` which is the screenshot of the selected element and `selector` which is the xpath of the selected element.

`url` and `screenImgUrl` are already present in the `ClickableDemoHtmlCaptures`. We just copy it based on the HTML capture
selected by the user. 

The `selector` and `elementImgUrl` are set as part of the current workflow. 

The `selector` and `elementImgUrl` are sent by the iframe to the main window object when the user selects the element.

### Overlay Creation
The element selector function adds two events to the document, one is the mouse over event which creates an overlay on 
the document creating a focused effect on the hovered element. It basically calculates the coordinates of the hovered 
and adds an overlay around the hovered element. You can find the details in this function

```typescript
function createOrUpdateOverlay(element: HTMLElement | null);
```

The second event listener is the click event. On clicking, we capture the xpath of the clicked element

```typescript
function getXPath(element: HTMLElement): string {
  if (!element) return "";
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    const tagName = current.tagName.toLowerCase();
    const index = getElementIndex(current);
    segments.unshift(`${tagName}[${index}]`);
    current = current.parentElement;
  }
  if (containingIframe) {
    return `/${segments.join("/")}`;
  }
  return `/html/body/${segments.join("/")}`;
}
```

### Nested Iframe Handling

In case there are iframes in the page/html captured, then we need to explicitly attach the two event listeners to each iframe as well.

```typescript
function addEventListenersToIframe();
```

# 3. Showing Tooltip

### Flow


Clickable demos are shown in an iframe. The iframe is created dynamically and the url is set to the url of the 
`ClickableDemoHtmlCapture` that the user selected for that step. The code for rendering the iframe is present in
`ClickableDemoModal.tsx` component.

This component creates iframe for each step and adds handle load event listener to each iframe. 


### 1. **Initialization of Message Listening:**
We have already imported `clickableDemoTooltipScript.js` in the HTML file which sets up the message listener in the main 
window object of iframe where tooltip is shown.

The script sets up an event listener on the `window` object to listen for `message` events.

```javascript
window.addEventListener('message', receiveMessage);
```

### 2. **Message Reception and Handling:**

When a `message` event is fired, the `receiveMessage` function is called. This function handles different types of messages by checking the data payload of the event. Each message type corresponds to a specific action or request, such as showing a tooltip, updating CSS variables, or navigating through tooltips:

```javascript
function receiveMessage(event) {
    if (event.data.type === 'showTooltip') {
        showTooltip(event);
    } else if (event.data.type === 'setCssVariables') {
        setCssVariables(event.data.cssValues);
    }
}
```
### 3. **On Load Event on Iframe**
The handleLoad
function passes the information about the selected element and the contents that needs to be shown in the tooltip.

Here is part of the code that sends the message to the iframe
```typescript

contentWindow!.postMessage(
  {
    type: "showTooltip",
    elementXPath: clickableDemoWithSteps.steps[index].selector,
    tooltipContent: clickableDemoWithSteps.steps[index].tooltipInfo,
    tooltipArrayLen: clickableDemoWithSteps.steps.length,
    currentTooltipIndex: index,
    buttonColor: space?.themeColors?.primaryColor,
    buttonTextColor: space?.themeColors?.textColor,
    placement: clickableDemoWithSteps.steps[index].placement,
  },
  "*"
);
```

**Setting CSS Variables:**

Before initializing the tooltip, we need to update the styling of the tooltip  as we want the button colors to be same as the primary color.
This is achieved by passing CSS variables from the main document to iframes, ensuring consistent styling. 
This involves setting CSS properties directly on the document or iframe documents. This styles are also set as part of the
onload event of the iframe.

```javascript
const cssValues = data.cssValues;
for (const variable in cssValues) {
    document.documentElement.style.setProperty(variable, cssValues[variable]);
}
```

### 4. **Tooltip Initialization Process:**

The `showTooltip` function is triggered via a message on the load of the iframe, it performs several tasks:

- **Element Detection:** It first checks the XPath provided in the message to locate the target element within the document or iframes. The XPath is evaluated using `document.evaluate()` or `iframeDoc.evaluate()` based on where the element is located.

- **Content Creation:** Constructs the HTML content for the tooltip, including text, navigation buttons, and other interactive elements.

- **Tooltip Library Use:** Utilizes `tippy.js` to create an interactive tooltip. This library is configured to show the tooltip immediately, allow HTML content, and set it to be interactive.

```javascript
window.tippy(target, {
    content: tooltipWrapper,
    allowHTML: true,
    placement: placement as any,
    ...
});
```

### 5. **Interactive Elements within Tooltip:**

Navigation buttons within the tooltip (like "Next" and "Back") are equipped with event handlers that, when triggered, send a message back to the parent window or controlling iframe to indicate the user's navigation choice. This allows the application to manage the state of tooltips across different parts of the interface, potentially across different iframes.

```javascript
backButton.onclick = () => {
    event.source?.postMessage({ backButton: true }, '*');
};
```

#### 6. **Event Handlers for Navigation**: 

Functions are attached to the "Back" and "Next/Complete" buttons to handle user interactions, allowing the user to navigate through a series of tooltips or complete the tooltip sequence, communicating these actions back to the parent window.

   ```javascript
   backButton.onclick = () => { ... };
   nextButton.onclick = () => { ... };
   ```

This flow ensures that the tooltip is not only displayed correctly according to the specified requirements but also integrates smoothly within either the main document or nested iframes, providing interactive and navigable content to the user.

When the user opens a new demo or clicks on `Next` or `Back` button, we pass a message from the web app to the document


Similarly when we click on the `Next` or `Back` button on the tooltip, we send a message from the document to the web app

```typescript
const nextButton = createTooltipButton(
  nextButtonText,
  "dodao-next-button",
  () => {
    target._tippy?.destroy();
    const messageType = isLastTooltip ? "completeButton" : "nextButton";
    event.source?.postMessage(
      { [messageType]: true },
      { targetOrigin: event.origin }
    );
  }
);
```

### Nested Iframe Handling

In case there are iframes in the document, then we need to add the stylesheets to each iframe as well

```typescript
targetNode = xpathResult;
currentContextNode = iframeDoc;
const head = iframeDoc.head || iframeDoc.getElementsByTagName("head")[0];

const materialStyle = iframeDoc.createElement("link");
materialStyle.rel = "stylesheet";
materialStyle.href =
  "/clickable-demos-prod-files/dependencies/tippy.js@6/themes/material.css";
head.appendChild(materialStyle);

const shiftTowardsStyle = iframeDoc.createElement("link");
shiftTowardsStyle.rel = "stylesheet";
shiftTowardsStyle.href =
  "/clickable-demos-prod-files/dependencies/tippy.js@6/animations/shift-toward.css";
head.appendChild(shiftTowardsStyle);

const tippyData = iframeDoc.createElement("link");
tippyData.rel = "stylesheet";
tippyData.href =
  "/clickable-demos-prod-files/dependencies/tippy.js@6/stylesheet/tippy-data.css";
head.appendChild(tippyData);

const link = iframeDoc.createElement("link");
link.rel = "stylesheet";
link.href = "/clickable-demos-prod-files/clickableDemoTooltipStyles.css";
iframeDoc.head.appendChild(link);
```
