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

When the user opens the element selector modal, we pass a message from the `elementSelector` to the document with some data.

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

The element selector function adds two events to the document, one is the mouse over event which creates an overlay on the document creating a focused effect on the hovered element. It basically calculates the coordinates of the hovered element and adds an overlay around the hovered element. You can find the details in this function

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

In case there are iframes in the document, then we need to explicity attach the two event listeners to each iframe as well.

```typescript
function addEventListenersToIframe();
```

# 3. Showing Tooltip

When the user opens a new demo or clicks on `Next` or `Back` button, we pass a message from the web app to the document

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