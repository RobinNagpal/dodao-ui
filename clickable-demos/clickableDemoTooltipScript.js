// tooltipScript.js

function showTooltip(event) {
  console.log('event.data.elementXPath', event.data.elementXPath);
  document.addEventListener('click', function(event) {
    event.preventDefault();
  });
  const xpathResult = document.evaluate(event.data.elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  console.log('xpathResult', xpathResult);

  const target = xpathResult.singleNodeValue;

  console.log('target', target);

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
    offset: [0, 10],
    animation: 'shift-toward',
    interactive: true,
    inertia: true,
    duration: [2000, 250],
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

  for (const iframe of iframeArr) {
    if (iframe && iframe.srcdoc) {
        const srcdocContent = iframe.srcdoc;

        // Create a new div element
        const div = document.createElement('div');
        div.innerHTML = srcdocContent;

        // Apply classes to reset and adjust styles
        div.classList.add('reset-styles');

        // Replace the iframe with the new div
        iframe.parentNode.replaceChild(div, iframe);
    }
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
}

window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;

console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);
