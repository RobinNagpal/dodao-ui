import type * as html2canvasTypes from 'html2canvas';
import type * as tippyTypes from 'tippy.js';

interface TooltipEventData {
  elementXPath: string;
  tooltipContent: string;
  currentTooltipIndex: number;
  tooltipArrayLen: number;
  placement: string;
}

interface DoDAOEventData {
  type: string;
  cssValues?: { [key: string]: string };
  [key: string]: any;
}

export {}; // Ensure this file is treated as a module

declare global {
  function html2canvas(element: HTMLElement, options?: Partial<html2canvasTypes.Options>): Promise<HTMLCanvasElement>;

  function tippy(element: HTMLElement, options: Partial<tippyTypes.DefaultProps>): void;

  interface HTMLElement {
    _tippy?: any; // Adjust the type based on tippy.js types if available
  }

  interface Window {
    handleDoDAOParentWindowEvent: (event: MessageEvent) => void;
  }
}

function showTooltip(event: MessageEvent) {
  const { elementXPath, tooltipContent: contentText, currentTooltipIndex, tooltipArrayLen, placement } = event.data as TooltipEventData;

  console.log('event.data.elementXPath', elementXPath);
  document.addEventListener('click', (e: Event) => e.preventDefault());

  const xpathResult = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  console.log('xpathResult', xpathResult);

  const targetNode = xpathResult.singleNodeValue;
  if (!targetNode || !(targetNode instanceof HTMLElement)) return;

  const target = targetNode as HTMLElement & { _tippy?: any };

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
    target._tippy?.destroy();

    event.source?.postMessage({ backButton: true }, { targetOrigin: event.origin });
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
    target._tippy?.destroy();
    const messageType = isLastTooltip ? 'completeButton' : 'nextButton';
    event.source?.postMessage({ [messageType]: true }, { targetOrigin: event.origin });
  });

  adjustButtonStyles([backButton, nextButton], isLastTooltip);
  buttonsRow.appendChild(nextButton);

  tooltipContent.appendChild(buttonsRow);

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });

  const tooltipWrapper = document.createElement('div');
  tooltipWrapper.appendChild(tooltipContent);

  window.tippy(target, {
    allowHTML: true,
    placement: placement as any,
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
    zIndex: 999999999999999,
  });
}

function createTooltipButton(text: string, className: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add('dodao-tooltip-button', className);
  button.onclick = onClick;
  button.onmouseover = () => {
    button.style.opacity = '0.7';
  };
  button.onmouseout = () => {
    button.style.opacity = '1';
  };
  return button;
}

function adjustButtonStyles(buttons: HTMLButtonElement[], isLastTooltip: boolean): void {
  const maxWidth = isLastTooltip ? '30%' : '20%';
  buttons.forEach((button) => {
    button.style.maxWidth = maxWidth;
  });
}

function replaceIframeWithShadowDom(): void {
  const iframeArr: HTMLCollectionOf<HTMLIFrameElement> = document.getElementsByTagName('iframe');

  if (iframeArr.length === 0) {
    console.log('No iframes found. Exiting function.');
    return;
  }

  for (const iframe of Array.from(iframeArr)) {
    const iframeStyle = window.getComputedStyle(iframe);
    if (iframeStyle.display === 'none') {
      console.log(`Iframe with id: ${iframe.id} and src: ${iframe.src} is set to display: none. Skipping replacement.`);
      continue;
    }

    if (iframe && iframe.srcdoc) {
      const srcdocContent = iframe.srcdoc;

      // Create a new div to host the Shadow DOM
      const hostDiv = document.createElement('div');

      // Apply original attributes
      hostDiv.className = iframe.className;
      hostDiv.id = iframe.id;
      hostDiv.setAttribute('style', iframe.getAttribute('style') || '');

      // Replace the iframe with the host div
      if (iframe.parentNode) {
        iframe.parentNode.replaceChild(hostDiv, iframe);
      }

      // Create a shadow root
      const shadowRoot = hostDiv.attachShadow({ mode: 'open' });

      // Set the innerHTML of the shadow root
      shadowRoot.innerHTML = srcdocContent;
    }
  }
}

function elementSelector(event: MessageEvent) {
  let selectedElement: HTMLElement | null = null;
  let finalXPath: string | null = null;
  let hoverEnabled = true;
  let hoverTimer: number | undefined;

  document.body.style.cursor = 'pointer';
  document.querySelectorAll('input').forEach((input) => {
    (input as HTMLElement).style.cursor = 'pointer';
  });

  const upDownButtons = createUpDownButtons();
  const selectButton = createSelectButton();
  const clearSelectionButton = createClearSelectionButton();

  document.body.appendChild(upDownButtons);
  document.body.appendChild(selectButton);
  document.body.appendChild(clearSelectionButton);

  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('click', handleClick);

  function createOrUpdateOverlay(element: HTMLElement | null) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const existingOverlay = document.getElementById('dimming-overlay');

    if (existingOverlay) {
      updateOverlay(existingOverlay, rect, scrollY, scrollHeight);
    } else {
      const overlayContainer = createOverlayContainer(rect, scrollY, scrollHeight);
      document.body.appendChild(overlayContainer);
    }
  }

  function createOverlayContainer(rect: DOMRect, scrollY: number, scrollHeight: number): HTMLDivElement {
    const overlayContainer: HTMLDivElement = document.createElement('div');
    overlayContainer.id = 'dimming-overlay';
    Object.assign(overlayContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: `${scrollHeight}px`,
      pointerEvents: 'none',
      zIndex: '50000000',
    });

    const overlays = ['top', 'left', 'right', 'bottom'].map((position) => createOverlayPart(position, rect, scrollY, scrollHeight));

    overlays.forEach((overlay) => overlayContainer.appendChild(overlay));
    return overlayContainer;
  }

  function createOverlayPart(position: string, rect: DOMRect, scrollY: number, scrollHeight: number): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = `${position}-overlay`;
    overlay.style.position = 'absolute';
    overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.6)';
    overlay.style.transition = 'all 0.3s ease';

    switch (position) {
      case 'top':
        Object.assign(overlay.style, {
          top: '0',
          left: '0',
          width: '100%',
          height: `${rect.top + scrollY}px`,
        });
        break;
      case 'left':
        Object.assign(overlay.style, {
          top: `${rect.top + scrollY}px`,
          left: '0',
          width: `${rect.left}px`,
          height: `${scrollHeight - rect.top - scrollY}px`,
        });
        break;
      case 'right':
        Object.assign(overlay.style, {
          top: `${rect.top + scrollY}px`,
          left: `${rect.right}px`,
          width: `calc(100% - ${rect.right}px)`,
          height: `${scrollHeight - rect.top - scrollY}px`,
        });
        break;
      case 'bottom':
        Object.assign(overlay.style, {
          top: `${rect.bottom + scrollY}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${scrollHeight - rect.bottom - scrollY}px`,
        });
        break;
    }
    return overlay;
  }

  function updateOverlay(container: HTMLElement, rect: DOMRect, scrollY: number, scrollHeight: number) {
    const overlays = container.children;
    const topOverlay = overlays[0] as HTMLElement;
    const leftOverlay = overlays[1] as HTMLElement;
    const rightOverlay = overlays[2] as HTMLElement;
    const bottomOverlay = overlays[3] as HTMLElement;

    topOverlay.style.height = `${rect.top + scrollY}px`;
    leftOverlay.style.top = `${rect.top + scrollY}px`;
    leftOverlay.style.height = `${scrollHeight - rect.top - scrollY}px`;
    leftOverlay.style.width = `${rect.left}px`;
    rightOverlay.style.top = `${rect.top + scrollY}px`;
    rightOverlay.style.left = `${rect.right}px`;
    rightOverlay.style.width = `calc(100% - ${rect.right}px)`;
    rightOverlay.style.height = `${scrollHeight - rect.top - scrollY}px`;
    bottomOverlay.style.top = `${rect.bottom + scrollY}px`;
    bottomOverlay.style.left = `${rect.left}px`;
    bottomOverlay.style.width = `${rect.width}px`;
    bottomOverlay.style.height = `${scrollHeight - rect.bottom - scrollY}px`;
  }

  async function captureScreenshotWithOverlay(element: HTMLElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const margin = 30;
      const { x: scrollOffsetX, y: scrollOffsetY } = calculateScrollOffsets(element);
      const yScroll = scrollOffsetY + window.scrollY;
      const rect = element.getBoundingClientRect();

      const captureArea = {
        x: Math.max(0, rect.left + scrollOffsetX - margin),
        y: Math.max(0, rect.top + yScroll - margin),
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
        .then((canvas: HTMLCanvasElement) => {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        })
        .catch((error: Error) => {
          console.error('Error capturing screenshot:', error);
          reject(error);
        });
    });
  }

  function calculateScrollOffsets(element: HTMLElement): {
    x: number;
    y: number;
  } {
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

  function isScrollable(element: HTMLElement): boolean {
    const overflowY = window.getComputedStyle(element).overflowY;
    return overflowY === 'scroll' || overflowY === 'auto';
  }

  function createUpDownButtons(): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add('dodao-up-down-buttons');

    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.title = 'Click to move to parent of element';
    minusButton.addEventListener('click', () => navigateSelection('up'));
    container.appendChild(minusButton);

    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.title = 'Click to move down to first child of element';
    plusButton.addEventListener('click', () => navigateSelection('down'));
    container.appendChild(plusButton);

    return container;
  }

  function navigateSelection(direction: 'up' | 'down') {
    if (!selectedElement) return;

    if (direction === 'up' && selectedElement.parentElement && selectedElement.parentElement !== document.body) {
      selectedElement = selectedElement.parentElement;
    } else if (direction === 'down' && selectedElement.firstElementChild) {
      selectedElement = selectedElement.firstElementChild as HTMLElement;
    } else {
      return;
    }
    createOrUpdateOverlay(selectedElement);
    finalXPath = getXPath(selectedElement);
  }

  function createSelectButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = 'Select';
    button.classList.add('dodao-select-element-button');
    button.disabled = true;
    button.style.opacity = '0.5';

    button.addEventListener('click', async () => {
      if (selectedElement && finalXPath) {
        const dataUrl = await captureScreenshotWithOverlay(selectedElement);

        event.source?.postMessage(
          { xpath: finalXPath, elementImgUrl: dataUrl },
          { targetOrigin: event.origin } // Use options object instead of just `event.origin`
        );
      }
    });

    button.addEventListener('mouseover', () => {
      if (!button.disabled) button.style.opacity = '0.7';
    });

    button.addEventListener('mouseout', () => {
      if (!button.disabled) button.style.opacity = '1';
    });

    return button;
  }

  function createClearSelectionButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = 'Clear Selection';
    button.classList.add('dodao-clear-selection-button');
    button.disabled = selectedElement === null;
    button.style.opacity = '0.5';

    button.addEventListener('mouseover', () => {
      if (!button.disabled) button.style.opacity = '0.7';
    });

    button.addEventListener('mouseout', () => {
      if (!button.disabled) button.style.opacity = '1';
    });

    button.addEventListener('click', () => {
      selectedElement = null;
      finalXPath = null;
      hoverEnabled = true;
      const overlay = document.getElementById('dimming-overlay');
      if (overlay) overlay.remove();
      selectButton.disabled = true;
      selectButton.style.opacity = '0.5';
      document.body.style.cursor = 'default';
      button.disabled = true;
      button.style.opacity = '0.5';
    });

    return button;
  }

  function handleMouseOver(e: MouseEvent) {
    e.preventDefault();
    if (hoverEnabled && !selectedElement) {
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        const hoveredElement = e.target as HTMLElement;
        if (![selectButton, clearSelectionButton, upDownButtons, ...Array.from(upDownButtons.children)].includes(hoveredElement)) {
          createOrUpdateOverlay(hoveredElement);
        }
      }, 180);
    }
  }

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    const clickedElement = e.target as HTMLElement;

    if (clickedElement === selectButton || clickedElement === clearSelectionButton) return;

    if (Array.from(upDownButtons.children).includes(clickedElement)) return;

    hoverEnabled = false;
    selectedElement = clickedElement;
    selectButton.disabled = false;
    selectButton.style.opacity = '1';
    clearSelectionButton.disabled = false;
    clearSelectionButton.style.opacity = '1';
    createOrUpdateOverlay(selectedElement);
    finalXPath = getXPath(selectedElement);
  }

  function getXPath(element: HTMLElement): string {
    if (!element) return '';
    const segments: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      const tagName = current.tagName.toLowerCase();
      const index = getElementIndex(current);
      segments.unshift(`${tagName}[${index}]`);
      current = current.parentElement;
    }
    return `/html/body/${segments.join('/')}`;
  }

  function getElementIndex(element: HTMLElement): number {
    let index = 1;
    let sibling = element.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === element.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    return index;
  }
}

function handleDoDAOParentWindowEvent(event: MessageEvent) {
  const data = event.data as DoDAOEventData;

  if (data.type === 'showTooltip') {
    replaceIframeWithShadowDom();

    // Check if the page has fully loaded
    if (document.readyState === 'complete') {
      // Page is fully loaded, proceed to show tooltip
      showTooltip(event);
    } else {
      // Wait for the page to fully load before showing tooltip
      window.addEventListener(
        'load',
        () => {
          showTooltip(event);
        },
        { once: true }
      ); // Ensure the event is only handled once
    }
  }

  if (data.type === 'setCssVariables') {
    const cssValues = data.cssValues;
    if (cssValues) {
      for (const variable in cssValues) {
        document.documentElement.style.setProperty(variable, cssValues[variable]);
      }
    }
  }

  if (data.type === 'elementSelector') {
    replaceIframeWithShadowDom();
    elementSelector(event);
  }
}

window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;

console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);