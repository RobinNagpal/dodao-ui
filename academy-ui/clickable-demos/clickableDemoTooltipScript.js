// tooltipScript.js

function showTooltip(event) {
  console.log('event.data.elementXPath', event.data.elementXPath);
  document.addEventListener('click', (e) => e.preventDefault());

  const { elementXPath, tooltipContent: contentText, currentTooltipIndex, tooltipArrayLen, placement } = event.data;
  const xpathResult = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const target = xpathResult.singleNodeValue;

  if (!target) return;

  target.classList.add('dodao-target-element');

  const tooltipContent = document.createElement('div');
  tooltipContent.classList.add('dodao-tooltip-content');

  const textElement = document.createElement('p');
  textElement.textContent = contentText;
  textElement.classList.add('dodao-text-element');
  tooltipContent.appendChild(textElement);

  const horizontalLine = document.createElement('hr');
  horizontalLine.classList.add('dodao-horizontal-line');
  tooltipContent.appendChild(horizontalLine);

  const buttonsRow = document.createElement('div');
  buttonsRow.classList.add('dodao-buttons-row');

  const backButton = createTooltipButton('Back', 'dodao-back-button', () => {
    target._tippy.destroy();
    event.source.postMessage({ backButton: true }, event.origin);
  });
  if (currentTooltipIndex === 0) backButton.style.visibility = 'hidden';
  buttonsRow.appendChild(backButton);

  const indices = document.createElement('span');
  indices.textContent = `${currentTooltipIndex + 1} of ${tooltipArrayLen}`;
  indices.classList.add('dodao-indices');
  buttonsRow.appendChild(indices);

  const isLastTooltip = currentTooltipIndex === tooltipArrayLen - 1;
  const nextButtonText = isLastTooltip ? 'Complete' : 'Next';
  const nextButton = createTooltipButton(nextButtonText, 'dodao-next-button', () => {
    target._tippy.destroy();
    const message = isLastTooltip ? { completeButton: true } : { nextButton: true };
    event.source.postMessage(message, event.origin);
  });
  buttonsRow.appendChild(nextButton);

  adjustButtonStyles([backButton, nextButton], isLastTooltip);

  tooltipContent.appendChild(buttonsRow);

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });

  const tooltipWrapper = document.createElement('div');
  tooltipWrapper.appendChild(tooltipContent);

  tippy(target, {
    allowHTML: true,
    placement,
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

function createTooltipButton(text, className, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add('dodao-tooltip-button', className);
  button.onclick = onClick;
  button.onmouseover = () => (button.style.opacity = '0.7');
  button.onmouseout = () => (button.style.opacity = '1');
  return button;
}

function adjustButtonStyles(buttons, isLastTooltip) {
  const maxWidth = isLastTooltip ? '30%' : '20%';
  buttons.forEach((button) => {
    button.style.maxWidth = maxWidth;
  });
}

function replaceIframeWithDiv() {
  const iframes = document.getElementsByTagName('iframe');
  if (!iframes.length) {
    console.log('No iframes found. Exiting function.');
    return;
  }

  const styles = Array.from(document.querySelectorAll('*')).map((element) => ({
    element,
    style: window.getComputedStyle(element),
  }));

  for (const iframe of iframes) {
    const iframeStyle = window.getComputedStyle(iframe);
    if (iframeStyle.display === 'none') {
      console.log(`Iframe with id: ${iframe.id} and src: ${iframe.src} is set to display: none. Skipping replacement.`);
      continue;
    }

    if (iframe.srcdoc) {
      const div = document.createElement('div');
      div.innerHTML = iframe.srcdoc;
      div.className = iframe.className;
      div.id = iframe.id;
      div.style.width = iframe.style.width;
      div.style.height = iframe.style.height;
      div.dataset.src = iframe.src;
      div.classList.add('reset-styles');
      iframe.parentNode.replaceChild(div, iframe);
    }
  }

  styles.forEach(({ element, style }) => {
    for (const property of style) {
      element.style[property] = style.getPropertyValue(property);
    }
  });
}

function elementSelector(event) {
  let selectedElement = null;
  let finalXPath = null;
  let dataURL;
  let hoverEnabled = true;
  let hoverTimer;

  document.body.style.cursor = 'pointer';
  document.querySelectorAll('input').forEach((input) => (input.style.cursor = 'pointer'));

  const upDownButtons = createUpDownButtons();
  const selectButton = createSelectButton();
  const clearSelectionButton = createClearSelectionButton();

  document.body.appendChild(upDownButtons);
  document.body.appendChild(selectButton);
  document.body.appendChild(clearSelectionButton);

  document.addEventListener('mouseover', (e) => {
    e.preventDefault();
    if (hoverEnabled && !selectedElement) {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        const hoveredElement = e.target;
        if (![...upDownButtons.children, selectButton, clearSelectionButton].includes(hoveredElement)) {
          createOrUpdateOverlay(hoveredElement);
        }
      }, 180);
    }
  });

  document.addEventListener('click', (e) => {
    e.preventDefault();
    const clickedElement = e.target;
    if (clickedElement === selectButton) return;

    if (clickedElement === clearSelectionButton) return;

    if (clickedElement === upDownButtons.querySelector('.minus-button')) {
      navigateSelection('parent');
    } else if (clickedElement === upDownButtons.querySelector('.plus-button')) {
      navigateSelection('child');
    } else {
      hoverEnabled = false;
      selectedElement = clickedElement;
      selectButton.disabled = false;
      selectButton.style.opacity = '1';
      clearSelectionButton.disabled = false;
      clearSelectionButton.style.opacity = '1';
      createOrUpdateOverlay(clickedElement);
      finalXPath = getXPath(clickedElement);
    }
  });

  function navigateSelection(direction) {
    if (!selectedElement) return;
    const newElement = direction === 'parent' ? selectedElement.parentElement : selectedElement.firstElementChild;
    if (!newElement || newElement.tagName.toLowerCase() === 'body') return;
    selectedElement = newElement;
    createOrUpdateOverlay(selectedElement);
    finalXPath = getXPath(selectedElement);
  }

  function createOrUpdateOverlay(element) {
    if (!element) return;
    const existingOverlay = document.getElementById('dimming-overlay');
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (existingOverlay) {
      updateOverlay(existingOverlay, rect, scrollY, scrollHeight);
    } else {
      const overlayContainer = createOverlayContainer(rect, scrollY, scrollHeight);
      document.body.appendChild(overlayContainer);
    }
  }

  function createOverlayContainer(rect, scrollY, scrollHeight) {
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'dimming-overlay';
    Object.assign(overlayContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: `${scrollHeight}px`,
      pointerEvents: 'none',
      zIndex: '999999999999999',
    });

    const overlays = ['top', 'left', 'right', 'bottom'].map((position) => {
      const overlay = document.createElement('div');
      overlay.className = `${position}-overlay`;
      Object.assign(overlay.style, getOverlayStyles(position, rect, scrollY, scrollHeight));
      return overlay;
    });

    overlays.forEach((overlay) => overlayContainer.appendChild(overlay));
    return overlayContainer;
  }

  function updateOverlay(container, rect, scrollY, scrollHeight) {
    const [topOverlay, leftOverlay, rightOverlay, bottomOverlay] = container.children;
    Object.assign(topOverlay.style, getOverlayStyles('top', rect, scrollY, scrollHeight));
    Object.assign(leftOverlay.style, getOverlayStyles('left', rect, scrollY, scrollHeight));
    Object.assign(rightOverlay.style, getOverlayStyles('right', rect, scrollY, scrollHeight));
    Object.assign(bottomOverlay.style, getOverlayStyles('bottom', rect, scrollY, scrollHeight));
  }

  function getOverlayStyles(position, rect, scrollY, scrollHeight) {
    const styles = {
      position: 'absolute',
      backgroundColor: 'rgba(128, 128, 128, 0.6)',
      transition: 'all 0.3s ease',
    };

    switch (position) {
      case 'top':
        Object.assign(styles, {
          top: '0',
          left: '0',
          width: '100%',
          height: `${rect.top + scrollY}px`,
        });
        break;
      case 'left':
        Object.assign(styles, {
          top: `${rect.top + scrollY}px`,
          left: '0',
          width: `${rect.left}px`,
          height: `${scrollHeight - rect.top - scrollY}px`,
        });
        break;
      case 'right':
        Object.assign(styles, {
          top: `${rect.top + scrollY}px`,
          left: `${rect.right}px`,
          width: `calc(100% - ${rect.right}px)`,
          height: `${scrollHeight - rect.top - scrollY}px`,
        });
        break;
      case 'bottom':
        Object.assign(styles, {
          top: `${rect.bottom + scrollY}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${scrollHeight - (rect.bottom + scrollY)}px`,
        });
        break;
    }
    return styles;
  }

  function createUpDownButtons() {
    const container = document.createElement('div');
    container.classList.add('dodao-up-down-buttons');

    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.title = 'Click to move to parent of element';
    minusButton.classList.add('minus-button');

    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.title = 'Click to move down to first child of element';
    plusButton.classList.add('plus-button');

    [minusButton, plusButton].forEach((btn) => container.appendChild(btn));
    return container;
  }

  function createSelectButton() {
    const button = document.createElement('button');
    button.textContent = 'Select';
    button.classList.add('dodao-select-element-button');
    button.disabled = true;
    button.style.opacity = '0.5';
    button.onmouseover = () => {
      if (!button.disabled) button.style.opacity = '0.7';
    };
    button.onmouseout = () => {
      if (!button.disabled) button.style.opacity = '1';
    };
    button.addEventListener('click', () => {
      captureScreenshotWithOverlay(selectedElement).then(() => {
        event.source.postMessage({ xpath: finalXPath, elementImgUrl: dataURL }, event.origin);
      });
    });
    return button;
  }

  function createClearSelectionButton() {
    const button = document.createElement('button');
    button.textContent = 'Clear Selection';
    button.classList.add('dodao-clear-selection-button');
    button.disabled = selectedElement === null;
    button.style.opacity = '0.5';
    button.onmouseover = () => {
      if (!button.disabled) button.style.opacity = '0.7';
    };
    button.onmouseout = () => {
      if (!button.disabled) button.style.opacity = '1';
    };
    button.addEventListener('click', () => {
      selectedElement = null;
      finalXPath = null;
      document.getElementById('dimming-overlay').remove();
      document.querySelector('.dodao-select-element-button').disabled = true;
      document.querySelector('.dodao-select-element-button').style.opacity = '0.5';
      document.body.style.cursor = 'default';
      button.disabled = true;
      button.style.opacity = '0.5';
    });
    return button;
  }

  async function captureScreenshotWithOverlay(element) {
    const margin = 30;
    const scrollOffsets = calculateScrollOffsets(element);
    const yScroll = adjustYScroll(scrollOffsets);

    const rect = element.getBoundingClientRect();
    const captureArea = {
      x: Math.max(0, rect.left + scrollOffsets.x - margin),
      y: Math.max(0, rect.top + yScroll - margin),
      width: rect.width + margin * 2,
      height: rect.height + margin * 2,
    };

    try {
      const canvas = await html2canvas(document.body, {
        x: captureArea.x,
        y: captureArea.y,
        width: captureArea.width,
        height: captureArea.height,
        windowWidth: document.documentElement.scrollWidth,
        scrollY: scrollOffsets.y,
        useCORS: true,
        backgroundColor: null,
        logging: true,
      });
      dataURL = canvas.toDataURL('image/png');
      console.log('Screenshot captured.');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  }

  function calculateScrollOffsets(element) {
    let x = 0;
    let y = 0;
    let parent = element.parentElement;
    while (parent) {
      if (isScrollable(parent)) {
        x += parent.scrollLeft;
        y += parent.scrollTop;
      }
      parent = parent.parentElement;
    }
    return { x, y };
  }

  function adjustYScroll({ y }) {
    return y + (window.scrollY || 0);
  }

  function isScrollable(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }

  function getXPath(element) {
    if (!element) return '';
    let xpath = '';
    let current = element;
    while (current !== document.body) {
      const index = getElementIndex(current);
      xpath = `/${current.tagName.toLowerCase()}[${index}]${xpath}`;
      current = current.parentElement;
    }
    return `/html/body${xpath}`;
  }

  function getElementIndex(element) {
    let index = 1;
    let sibling = element.previousSibling;
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
  const { type, cssValues } = event.data;
  switch (type) {
    case 'showTooltip':
      replaceIframeWithDiv();
      showTooltip(event);
      break;
    case 'setCssVariables':
      for (const variable in cssValues) {
        document.documentElement.style.setProperty(variable, cssValues[variable]);
      }
      break;
    case 'elementSelector':
      replaceIframeWithDiv();
      elementSelector(event);
      break;
  }
}

window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;
console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);
