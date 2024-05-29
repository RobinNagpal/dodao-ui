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
  textElement.style.display = 'inline';
  textElement.style.margin = '0 auto';
  textElement.style.fontSize = '1rem';
  textElement.style.fontFamily = 'sans-serif';
  textElement.style.fontWeight = '300';
  textElement.style.textAlign = 'center';

  tooltipContent.style.display = 'flex';
  tooltipContent.style.flexDirection = 'column';
  tooltipContent.style.justifyContent = 'space-around';
  tooltipContent.style.minHeight = '130px'; // Set a minimum height for the tooltip
  tooltipContent.style.minWidth = '300px'; // Set a minimum width for the tooltip
  tooltipContent.style.padding = '3px 12px'; // Add padding to the tooltip
  tooltipContent.appendChild(textElement);

  // Add an <hr> element to serve as a horizontal line
  const horizontalLine = document.createElement('hr');
  horizontalLine.style.borderTop = '1px solid #808080'; // Style the line as needed
  horizontalLine.style.margin = '2px 0'; // Add some space around the line
  tooltipContent.appendChild(horizontalLine);

  const buttonsRow = document.createElement('div');
  buttonsRow.style.display = 'flex';
  buttonsRow.style.justifyContent = 'space-between';

  // Create the 'Back' button
  const backButton = document.createElement('button');
  backButton.textContent = 'Back';
  backButton.onclick = () => {
    const instance = target._tippy;
    instance.destroy();
    event.source.postMessage({ backButton: true }, event.origin);
  };

  // Style the 'Back' button
  backButton.style.padding = '5px 10px';
  backButton.style.border = 'none';
  backButton.style.borderRadius = '5px';
  backButton.style.backgroundColor = event.data.buttonColor;
  backButton.style.color = event.data.buttonTextColor;
  backButton.style.fontWeight = 'bold';
  backButton.style.cursor = 'pointer';
  backButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  backButton.style.transition = 'all 0.3s ease';
  backButton.style.marginTop = 'auto';
  backButton.style.alignSelf = 'flex-start';
  backButton.style.marginRight = 'auto';

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
  indices.style.color = '#84868a';
  indices.style.margin = 'auto';
  indices.style.fontSize = 'small';
  indices.style.fontWeight = '300';
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
  nextButton.style.padding = '5px 10px';
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '5px';
  nextButton.style.backgroundColor = event.data.buttonColor;
  nextButton.style.color = event.data.buttonTextColor;
  nextButton.style.fontWeight = 'bold';
  nextButton.style.cursor = 'pointer';
  nextButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  nextButton.style.transition = 'all 0.3s ease';
  if (nextButton.textContent === 'Complete') {
    nextButton.style.maxWidth = '30%';
    backButton.style.maxWidth = '30%';
  } else {
    nextButton.style.maxWidth = '20%';
    backButton.style.maxWidth = '20%';
  }

  nextButton.style.marginTop = 'auto';
  nextButton.style.alignSelf = 'flex-end';
  nextButton.style.marginLeft = 'auto';
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

function handleDoDAOParentWindowEvent(event) {
  if (event.data.type === 'showTooltip') {
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
