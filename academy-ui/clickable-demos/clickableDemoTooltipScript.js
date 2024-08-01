// tooltipScript.js

function showTooltip(event) {
  console.log('event.data.elementXPath', event.data.elementXPath);
  document.addEventListener('click', function (event) {
    event.preventDefault();
  });
  const xpathResult = document.evaluate(event.data.elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  console.log('xpathResult', xpathResult);

  const target = xpathResult.singleNodeValue;

  target.classList.add('dodao-target-element');

  const tooltipContent = document.createElement('div');

  // Add text content or any other elements to your tooltip as needed
  const textElement = document.createElement('p');
  textElement.textContent = event.data.tooltipContent;
  textElement.classList.add('dodao-text-element');

  tooltipContent.classList.add('dodao-tooltip-content');
  tooltipContent.appendChild(textElement);

  // Add an <hr> element to serve as a horizontal line
  const horizontalLine = document.createElement('hr');
  horizontalLine.classList.add('dodao-horizontal-line');
  tooltipContent.appendChild(horizontalLine);

  const buttonsRow = document.createElement('div');
  buttonsRow.classList.add('dodao-buttons-row');

  // Create the 'Back' button
  const backButton = document.createElement('button');
  backButton.textContent = 'Back';
  backButton.onclick = () => {
    const instance = target._tippy;
    instance.destroy();
    event.source.postMessage({ backButton: true }, event.origin);
  };

  // Add class to the 'Back' button
  backButton.classList.add('dodao-tooltip-button', 'dodao-back-button');

  backButton.onmouseover = () => {
    backButton.style.opacity = '0.7';
  };
  backButton.onmouseout = () => {
    backButton.style.opacity = '1';
  };

  if (event.data.currentTooltipIndex === 0) backButton.style.visibility = 'hidden';

  buttonsRow.appendChild(backButton);

  const indices = document.createElement('span');
  indices.textContent = `${event.data.currentTooltipIndex + 1} of ${event.data.tooltipArrayLen}`;
  indices.classList.add('dodao-indices');
  buttonsRow.appendChild(indices);

  // Create the 'Next' button
  const nextButton = document.createElement('button');
  nextButton.textContent = event.data.currentTooltipIndex === event.data.tooltipArrayLen - 1 ? 'Complete' : 'Next';
  nextButton.onclick = async () => {
    if (nextButton.textContent === 'Next') {
      const instance = target._tippy;
      instance.destroy();
      event.source.postMessage({ nextButton: true }, event.origin);
    } else {
      event.source.postMessage({ completeButton: true }, event.origin);
    }
  };

  // Style the 'Next' button
  nextButton.classList.add('dodao-tooltip-button', 'dodao-next-button');
  if (nextButton.textContent === 'Complete') {
    nextButton.style.maxWidth = '30%';
    backButton.style.maxWidth = '30%';
  } else {
    nextButton.style.maxWidth = '20%';
    backButton.style.maxWidth = '20%';
  }

  nextButton.onmouseover = () => {
    nextButton.style.opacity = '0.7';
  };
  nextButton.onmouseout = () => {
    nextButton.style.opacity = '1';
  };

  buttonsRow.appendChild(nextButton);

  tooltipContent.appendChild(buttonsRow);

  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }

  const tooltipWrapper = document.createElement('div');
  tooltipWrapper.append(tooltipContent);

  tippy(target, {
    allowHTML: true,
    placement: event.data.placement,
    appendTo: document.body,
    offset: [0, 10],
    animation: 'shift-toward',
    interactive: true,
    inertia: true,
    duration: [500, 250],
    delay: [500, 200],
    content: tooltipWrapper,
    showOnCreate: true,
    hideOnClick: false,
    trigger: 'manual',
    theme: 'material',
  });
}

function replaceIframeWithDiv() {
  const iframeArr = document.getElementsByTagName('iframe');

  // Check if there are any iframes present
  if (iframeArr.length === 0) {
    console.log('No iframes found. Exiting function.');
    return;
  }

  const elements = document.querySelectorAll('*');
  const styles = [];

  // Capture current styles, excluding tooltips and specific classes
  elements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const styleObj = {};

    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      styleObj[property] = computedStyle.getPropertyValue(property);
    }

    styles.push({
      element,
      style: styleObj,
    });
  });

  // Replace iframes with divs
  for (const iframe of iframeArr) {
    const iframeStyle = window.getComputedStyle(iframe);
    if (iframeStyle.display === 'none') {
      console.log(`Iframe with id: ${iframe.id} and src: ${iframe.src} is set to display: none. Skipping replacement.`);
      return;
    }

    if (iframe && iframe.srcdoc) {
      const srcdocContent = iframe.srcdoc;

      // Save original attributes and styles
      const originalAttributes = {
        class: iframe.className,
        id: iframe.id,
        style: {
          width: iframe.style.width,
          height: iframe.style.height,
        },
        dataset: {
          src: iframe.src,
        },
      };

      // Create a new div element
      const div = document.createElement('div');
      div.innerHTML = srcdocContent;

      // Apply saved attributes and styles to the div
      div.className = originalAttributes.class;
      div.id = originalAttributes.id;
      div.style.width = originalAttributes.style.width;
      div.style.height = originalAttributes.style.height;
      div.dataset.src = originalAttributes.dataset.src;
      div.classList.add('reset-styles');

      // Replace the iframe with the new div
      iframe.parentNode.replaceChild(div, iframe);
    }
  }

  // Reapply the captured styles, excluding tooltips and specific classes
  styles.forEach((styleObj) => {
    const { element, style } = styleObj;

    for (let property in style) {
      element.style[property] = style[property];
    }
  });
}

function elementSelector(event) {
  let selectedElement = null;
  let final_xpath = null;
  let dataURL;
  function createOrUpdateOverlay(selectedElement) {
    // Remove any existing overlay
    // Check if there's a selected element
    if (!selectedElement) return;
    // Check if there's an existing overlay
    const existingOverlay = document.getElementById('dimming-overlay');
    const rect = selectedElement.getBoundingClientRect();
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (existingOverlay) {
      const topOverlay = existingOverlay.children[0];
      const leftOverlay = existingOverlay.children[1];
      const rightOverlay = existingOverlay.children[2];
      const bottomOverlay = existingOverlay.children[3];

      topOverlay.style.height = rect.top + window.scrollY + 'px';
      leftOverlay.style.top = rect.top + window.scrollY + 'px';
      leftOverlay.style.height = scrollHeight - rect.top - window.scrollY + 'px';
      leftOverlay.style.width = rect.left + 'px';
      rightOverlay.style.top = rect.top + window.scrollY + 'px';
      rightOverlay.style.left = rect.right + 'px';
      rightOverlay.style.width = `calc(100% - ${rect.right}px)`;
      rightOverlay.style.height = scrollHeight - rect.top - window.scrollY + 'px';
      bottomOverlay.style.top = rect.bottom + window.scrollY + 'px';
      bottomOverlay.style.left = rect.left + 'px';
      bottomOverlay.style.width = rect.width + 'px';
      bottomOverlay.style.height = scrollHeight - (rect.bottom + window.scrollY) + 'px';
    } else {
      // Create the overlay container
      const overlayContainer = document.createElement('div');
      overlayContainer.id = 'dimming-overlay';
      overlayContainer.style.position = 'absolute';
      overlayContainer.style.top = '0';
      overlayContainer.style.left = '0';
      overlayContainer.style.width = '100%';
      overlayContainer.style.height = scrollHeight + 'px';
      overlayContainer.style.pointerEvents = 'none'; // Allow click events to "fall through" to the target
      overlayContainer.style.zIndex = '99999'; // Ensure it's above other content

      // Create four overlay parts with transitions
      const topOverlay = document.createElement('div');
      topOverlay.className = 'top-overlay';
      topOverlay.style.position = 'absolute';
      topOverlay.style.top = '0';
      topOverlay.style.left = '0';
      topOverlay.style.width = '100%';
      topOverlay.style.height = rect.top + window.scrollY + 'px';
      topOverlay.style.backgroundColor = 'rgba(128, 128, 128, 0.6) ';
      topOverlay.style.transition = 'all 0.3s ease';

      const leftOverlay = document.createElement('div');
      leftOverlay.className = 'left-overlay';
      leftOverlay.style.position = 'absolute';
      leftOverlay.style.top = rect.top + window.scrollY + 'px';
      leftOverlay.style.left = '0';
      leftOverlay.style.width = rect.left + 'px';
      leftOverlay.style.height = scrollHeight - rect.top - window.scrollY + 'px';
      leftOverlay.style.backgroundColor = 'rgba(128, 128, 128, 0.6) ';
      leftOverlay.style.transition = 'all 0.3s ease';

      const rightOverlay = document.createElement('div');
      rightOverlay.className = 'right-overlay';
      rightOverlay.style.position = 'absolute';
      rightOverlay.style.top = rect.top + window.scrollY + 'px';
      rightOverlay.style.left = rect.right + 'px';
      rightOverlay.style.width = `calc(100% - ${rect.right}px)`;
      rightOverlay.style.height = scrollHeight - rect.top - window.scrollY + 'px';
      rightOverlay.style.backgroundColor = 'rgba(128, 128, 128, 0.6) ';
      rightOverlay.style.transition = 'all 0.3s ease';

      const bottomOverlay = document.createElement('div');
      bottomOverlay.className = 'bottom-overlay';
      bottomOverlay.style.position = 'absolute';
      bottomOverlay.style.top = rect.bottom + window.scrollY + 'px';
      bottomOverlay.style.left = rect.left + 'px';
      bottomOverlay.style.width = rect.width + 'px';
      bottomOverlay.style.height = scrollHeight - (rect.bottom + window.scrollY) + 'px';
      bottomOverlay.style.backgroundColor = 'rgba(128, 128, 128, 0.6) ';
      bottomOverlay.style.transition = 'all 0.3s ease';

      // Append overlay parts to the main overlay container
      overlayContainer.appendChild(topOverlay);
      overlayContainer.appendChild(leftOverlay);
      overlayContainer.appendChild(rightOverlay);
      overlayContainer.appendChild(bottomOverlay);
      document.body.appendChild(overlayContainer);
    }

    // Get the bounding rectangle of the selected element
  }

  function captureScreenshotWithOverlay(element) {
    function checkScrollBar(element) {
      let res = !!element.scrollTop;
      if (!res) {
        element.scrollTop = 1;
        res = !!element.scrollTop;
        element.scrollTop = 0;
      }
      return res;
    }

    function isScrollable(element) {
      const hasVerticalScroll = checkScrollBar(element);

      return hasVerticalScroll;
    }
    const margin = 30;
    let parent = element.parentElement;

    // Calculate total scroll offsets from all scrollable ancestors
    let scrollOffsetX = 0;
    let scrollOffsetY = 0;
    let noOfScrolls = 0;

    while (parent) {
      isScrollable(parent) && noOfScrolls++;
      // console.log(parent);
      scrollOffsetX += parent.scrollLeft;
      if (parent.scrollTop != 0) {
        scrollOffsetY += parent.scrollTop;
      }
      // console.log(scrollOffsetY);
      parent = parent.parentElement;
    }
    let y_scroll = scrollOffsetY;
    // console.log(window.scrollY);
    if (scrollOffsetY === window.scrollY && noOfScrolls > 0) {
      y_scroll = noOfScrolls * scrollOffsetY;
    } else {
      y_scroll += window.scrollY;
    }
    // console.log(y_scroll);
    // console.log(noOfScrolls);
    // Calculate the area to capture, considering all scroll offsets and window scroll position
    let rect = element.getBoundingClientRect();
    const captureArea = {
      x: Math.max(0, rect.left + scrollOffsetX - margin),
      y: Math.max(0, rect.top + y_scroll - margin),
      width: rect.width + margin * 2,
      height: rect.height + margin * 2,
    };
    html2canvas(document.body, {
      x: captureArea.x,
      y: captureArea.y,
      width: captureArea.width,
      height: captureArea.height,
      windowWidth: document.documentElement.scrollWidth,
      scrollY: scrollOffsetY,
      useCORS: true,
      backgroundColor: null,
      logging: true,
    })
      .then((canvas) => {
        // Convert the canvas to a data URL
        dataURL = canvas.toDataURL('image/png');
        // console.log("Data URL created:", dataURL);
        // dataURL = canvas;
        // Create an image element to preview the screenshot
      })
      .catch((error) => {
        console.error('Error capturing screenshot:', error);
      });
    console.log('Function execution ended.');
  }

  document.body.style.cursor = 'pointer';
  const inputs = document.querySelectorAll('input');
  inputs.forEach((input) => {
    input.style.cursor = 'pointer';
  });

  const UpDownButtons = document.createElement('div');
  UpDownButtons.classList.add('dodao-up-down-buttons');

  const minusButton = document.createElement('button');
  minusButton.textContent = '-';
  minusButton.title = 'Click to move to parent of element'; // Tooltip text for minus button

  UpDownButtons.appendChild(minusButton);

  const plusButton = document.createElement('button');
  plusButton.textContent = '+';
  plusButton.title = 'Click to move down to first child of element'; // Tooltip text for plus button

  UpDownButtons.appendChild(plusButton);

  document.body.appendChild(UpDownButtons);
  // Event listener for hover to show the tooltip
  minusButton.addEventListener('mouseover', function () {
    // Tooltip will be shown by the browser due to the title attribute
  });

  plusButton.addEventListener('mouseover', function () {
    // Tooltip will be shown by the browser due to the title attribute
  });

  const button = document.createElement('button');
  // Set the button's text
  button.textContent = 'Select';
  button.classList.add('dodao-select-element-button');
  button.disabled = selectedElement === null;
  button.style.opacity = button.disabled ? '0.5' : '1'; // Dim button if disabled
  button.onmouseover = () => {
    if (button.disabled) return;
    button.style.opacity = '0.7'; // Set opacity to 0.7 on hover
  };
  button.onmouseout = () => {
    if (button.disabled) return;
    button.style.opacity = '1'; // Reset opacity to 1 when not hovering
  };
  // Optionally, add an event listener for click events
  button.addEventListener('click', () => {
    captureScreenshotWithOverlay(selectedElement);
    setTimeout(() => {
      elementImgUrl = dataURL;
    }, 200);
    setTimeout(() => {
      event.source.postMessage({ xpath: final_xpath, elementImgUrl: elementImgUrl }, event.origin);
    }, 200);
  });
  // Append the button to the body
  document.body.appendChild(button);

  let hoverTimer;
  let hoverEnabled = true;
  document.addEventListener('mouseover', function (event) {
    event.preventDefault();
    if (hoverEnabled && !selectedElement) {
      // Clear any existing timer to ensure only one timer is active
      clearTimeout(hoverTimer);

      // Set a new timer to wait for 180 milliseconds before executing the function
      hoverTimer = setTimeout(() => {
        // Handle the clicked element
        var hoveredElement = event.target;
        if (hoveredElement === minusButton || hoveredElement === plusButton || hoveredElement === button || hoveredElement === UpDownButtons) return;
        createOrUpdateOverlay(hoveredElement);
      }, 180);
    } // Delay of 180 milliseconds
  });
  document.addEventListener('click', function (event) {
    event.preventDefault();

    var clickedElement = event.target;
    // Handle your logic based on the clicked element (minusButton, plusButton, etc.)
    if (clickedElement === button) {
      return;
    }
    if (clickedElement === minusButton) {
      // Handle minusButton logic
      if (!selectedElement || !selectedElement.parentNode) return;
      if (selectedElement.parentNode.tagName.toLowerCase() === 'body') {
        return;
      } // Check for body tag
      selectedElement = selectedElement.parentNode;

      createOrUpdateOverlay(selectedElement);
      final_xpath = getXPath(selectedElement);
      return;
    } else if (clickedElement === plusButton) {
      // Handle plusButton logic
      if (!selectedElement || !selectedElement.firstElementChild) return;
      selectedElement = selectedElement.firstElementChild;
      createOrUpdateOverlay(selectedElement);
      final_xpath = getXPath(selectedElement);
      return;
    }
    hoverEnabled = false;
    selectedElement = clickedElement;
    button.disabled = false;
    button.style.opacity = '1';
    createOrUpdateOverlay(clickedElement);
    final_xpath = getXPath(clickedElement);
  });
  function getXPath(element) {
    if (!element) return '';
    var xpath = '';
    var currentElement = element;
    while (currentElement !== document.body) {
      var tagName = currentElement.tagName.toLowerCase();
      var index = getIndex(currentElement);
      xpath = '/' + tagName + '[' + index + ']' + xpath;
      currentElement = currentElement.parentElement;
    }
    xpath = '/html/body' + xpath;
    return xpath;
  }
  function getIndex(element) {
    var index = 1;
    var sibling = element.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    return index;
  }
}

function handleDoDAOParentWindowEvent(event) {
  if (event.data.type === 'showTooltip') {
    replaceIframeWithDiv();
    showTooltip(event);
  }

  if (event.data.type === 'setCssVariables') {
    const cssValues = event.data.cssValues;
    for (const variable in cssValues) {
      document.documentElement.style.setProperty(variable, cssValues[variable]);
    }
  }

  if (event.data.type === 'elementSelector') {
    replaceIframeWithDiv();
    elementSelector(event);
  }
}

window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;

console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);
