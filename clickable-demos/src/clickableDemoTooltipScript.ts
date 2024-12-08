(function () {
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

  interface TooltipData {
    cssValues: Record<string, string>; // Object with CSS variable names as keys and their values as string
    elementXPath: string; // XPath selector of the element
    tooltipContent: string; // Content of the tooltip
    tooltipArrayLen: number; // Total number of steps in the demo
    currentTooltipIndex: number; // Index of the current tooltip
    placement: string; // Placement of the tooltip relative to the element
    mode?: string; // Whether the tooltip is in elementSelection mode or displayTooltip mode
  }
  function showTooltip() {
    const dataString = window.name;
    if (!dataString) {
      return;
    }
    const data = JSON.parse(dataString) as TooltipData;

    // Set CSS variables
    if (data.cssValues) {
      for (const variable in data.cssValues) {
        document.documentElement.style.setProperty(variable, data.cssValues[variable]);
      }
    }
    const { tooltipContent: contentText, currentTooltipIndex, tooltipArrayLen, placement, elementXPath, mode } = data;

    // We don't want to show the tooltip if the mode is elementSelection
    if (mode === 'elementSelection') {
      return;
    }

    const currentDocAndTargetNode = getCurrentContextNodeAndTarget(elementXPath)!;
    if (!currentDocAndTargetNode.targetNode || !currentDocAndTargetNode.currentContextNode) return;

    const { currentContextNode, targetNode, isCurrentContextAndIframe } = currentDocAndTargetNode;

    if (isCurrentContextAndIframe) {
      if (data.cssValues) {
        for (const variable in data.cssValues) {
          currentContextNode.documentElement.style.setProperty(variable, data.cssValues[variable]);
        }
      }
    }

    const target = targetNode as HTMLElement & { _tippy?: any };

    target.classList.add('dodao-target-element');

    // Check if the tooltip already exists and destroy it if it does
    if (target._tippy) {
      target._tippy.destroy();
    }

    const tooltipContent = currentContextNode.createElement('div');
    tooltipContent.classList.add('dodao-tooltip-content');

    const textElement = currentContextNode.createElement('p');
    textElement.textContent = contentText;
    textElement.classList.add('dodao-text-element');
    tooltipContent.appendChild(textElement);

    const horizontalLine = currentContextNode.createElement('hr');
    horizontalLine.classList.add('dodao-horizontal-line');
    tooltipContent.appendChild(horizontalLine);

    const buttonsRow = currentContextNode.createElement('div');
    buttonsRow.classList.add('dodao-buttons-row');

    const backButton = createTooltipButton('Back', 'dodao-back-button', () => {
      target._tippy?.destroy();
      window.parent.postMessage({ backButton: true }, '*');
    });

    if (currentTooltipIndex === 0) backButton.style.visibility = 'hidden';
    buttonsRow.appendChild(backButton);

    const indices = currentContextNode.createElement('span');
    indices.textContent = `${currentTooltipIndex + 1} of ${tooltipArrayLen}`;
    indices.classList.add('dodao-indices');
    buttonsRow.appendChild(indices);

    const isLastTooltip = currentTooltipIndex === tooltipArrayLen - 1;
    const nextButtonText = isLastTooltip ? 'Complete' : 'Next';

    const nextButton = createTooltipButton(nextButtonText, 'dodao-next-button', () => {
      target._tippy?.destroy();
      const messageType = isLastTooltip ? 'completeButton' : 'nextButton';
      window.parent.postMessage({ [messageType]: true }, '*');
    });

    adjustButtonStyles([backButton, nextButton], isLastTooltip);
    buttonsRow.appendChild(nextButton);

    tooltipContent.appendChild(buttonsRow);

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const tooltipWrapper = currentContextNode.createElement('div');
    tooltipWrapper.appendChild(tooltipContent);
    console.log('creating tooltip according to configuration:', {
      elementXPath,
      currentContextNode,
      targetNode,
      isCurrentContextAndIframe,
    });
    window.tippy(target, {
      allowHTML: true,
      placement: placement as any,
      appendTo: currentContextNode.body,
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

  function elementSelector(event: MessageEvent) {
    let selectedElement: HTMLElement | null = null;
    let finalXPath: string | null = null;
    let hoverEnabled = true;
    let hoverTimer: number | undefined;
    let containingIframe: HTMLIFrameElement | null;

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

    function documentClickHandler(event: MouseEvent) {
      if (hoverEnabled) containingIframe = null;
      handleClickOnPageElement(event);
    }

    function documentMouseoverHandler(event: MouseEvent) {
      if (hoverEnabled) containingIframe = null;
      handleMouseOver(event);
    }

    document.addEventListener('mouseover', documentMouseoverHandler);
    document.addEventListener('click', documentClickHandler);

    function handleIframeClick(event: MouseEvent) {
      event.stopPropagation();
      const clickedFrame = (event.currentTarget as HTMLIFrameElement | undefined)?.ownerDocument?.defaultView?.frameElement;
      if (clickedFrame) {
        containingIframe = clickedFrame as HTMLIFrameElement;
        handleClickOnPageElement(event);
      }
    }

    function handleIframeMouseOver(event: MouseEvent) {
      event.stopPropagation();
      // containingIframe = event.currentTarget.ownerDocument.defaultView.frameElement;
      const mouseoverFrame = (event.currentTarget as HTMLIFrameElement | undefined)?.ownerDocument?.defaultView?.frameElement;

      if (mouseoverFrame) {
        containingIframe = mouseoverFrame as HTMLIFrameElement;
        handleMouseOver(event);
      }
    }

    // Function to add event listeners to an iframe
    function addEventListenersToIframe(iframe: HTMLIFrameElement) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.addEventListener('click', handleIframeClick);
          iframeDoc.addEventListener('mouseover', handleIframeMouseOver);
        } else {
          console.error('Unable to access iframe content. It might be cross-origin.');
        }
      } catch (error) {
        console.error('Error accessing or attaching event listeners to iframe content:', error);
      }
    }

    // Function to remove event listeners from an iframe
    function removeEventListenersFromIframe(iframe: HTMLIFrameElement) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.removeEventListener('click', handleIframeClick);
          iframeDoc.removeEventListener('mouseover', handleIframeMouseOver);
        }
      } catch (error) {
        console.error('Error accessing or detaching event listeners from iframe content:', error);
      }
    }

    // Adding event listeners to all iframes
    function addEventListenersToAllIframes() {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        if (iframe instanceof HTMLIFrameElement) {
          addEventListenersToIframe(iframe);
        }
      });
    }

    // Removing event listeners from all iframes
    function removeEventListenersFromAllIframes() {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        if (iframe instanceof HTMLIFrameElement) {
          removeEventListenersFromIframe(iframe);
        }
      });
    }

    addEventListenersToAllIframes();

    function handleSelectButtonClicked() {
      if (selectedElement && finalXPath) {
        console.log('Selected element:', selectedElement);
        console.log('Final XPath:', finalXPath);
        console.log('Sending message to parent window:', { type: 'elementSelected', xpath: finalXPath });
        event.source?.postMessage(
          { type: 'elementSelected', xpath: finalXPath },
          { targetOrigin: '*' } // Use options object instead of just `event.origin`
        );
      }
    }

    function handleClearButtonClicked() {
      selectedElement = null;
      finalXPath = null;
      containingIframe = null;
      hoverEnabled = true;
      const overlay = document.getElementById('dimming-overlay');
      if (overlay) overlay.remove();

      document.body.style.cursor = 'default';
      document.addEventListener('mouseover', documentMouseoverHandler);
      document.addEventListener('click', documentClickHandler);
      disableButtonActions();
    }

    function handleUpButtonClicked() {
      if (finalXPath) navigateSelection('up');
    }

    function handleDownButtonClicked() {
      if (finalXPath) navigateSelection('down');
    }

    function buttonMouseoverHandler(event: MouseEvent) {
      if (finalXPath) (event.target as HTMLButtonElement).style.opacity = '0.7';
    }

    function buttonMouseoutHandler(event: MouseEvent) {
      if (finalXPath) (event.target as HTMLButtonElement).style.opacity = '1';
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
      createOrUpdateOverlay(selectedElement, containingIframe);
      finalXPath = getXPath(selectedElement, containingIframe);
    }

    function createUpDownButtons(): HTMLDivElement {
      const existingContainer = document.getElementById('dodao-up-down-buttons') as HTMLDivElement | undefined;
      if (existingContainer) return existingContainer;

      const container = document.createElement('div');
      container.id = 'dodao-up-down-buttons';
      container.classList.add('dodao-up-down-buttons');

      const existingButtons = document.getElementById('dodao-up-button');
      if (!existingButtons) {
        const minusButton = document.createElement('button');
        minusButton.textContent = '-';
        minusButton.title = 'Click to move to parent of element';
        minusButton.id = 'dodao-up-button';
        addDisableButtonStyles(minusButton);
        container.appendChild(minusButton);
      }

      const existingPlusButton = document.getElementById('dodao-down-button');
      if (!existingPlusButton) {
        const plusButton = document.createElement('button');
        plusButton.textContent = '+';
        plusButton.title = 'Click to move down to first child of element';
        plusButton.id = 'dodao-down-button';
        addDisableButtonStyles(plusButton);
        container.appendChild(plusButton);
      }

      return container;
    }

    function createSelectButton(): HTMLButtonElement {
      const selectButton = document.getElementById('dodao-select-element-button') as HTMLButtonElement | undefined;
      if (selectButton) return selectButton;

      const button = document.createElement('button');
      button.textContent = 'Select';
      button.classList.add('dodao-select-element-button');
      button.id = 'dodao-select-element-button';
      addDisableButtonStyles(button);
      return button;
    }

    function createClearSelectionButton(): HTMLButtonElement {
      const clearButton = document.getElementById('dodao-clear-selection-button') as HTMLButtonElement | undefined;
      if (clearButton) return clearButton;

      const button = document.createElement('button');
      button.textContent = 'Clear Selection';
      button.classList.add('dodao-clear-selection-button');
      button.id = 'dodao-clear-selection-button';
      addDisableButtonStyles(button);
      return button;
    }

    function addEnableButtonStyles(button: HTMLButtonElement) {
      button.style.cursor = 'pointer';
      button.disabled = false;
      button.style.opacity = '1';
      button.addEventListener('mouseover', buttonMouseoverHandler);
      button.addEventListener('mouseout', buttonMouseoutHandler);
    }

    function addDisableButtonStyles(button: HTMLButtonElement) {
      button.style.cursor = 'not-allowed';
      button.disabled = true;
      button.style.opacity = '0.3';
      button.removeEventListener('mouseover', buttonMouseoverHandler);
      button.removeEventListener('mouseout', buttonMouseoutHandler);
    }
    function enableButtonActions() {
      const selectButton: HTMLButtonElement = document.getElementById('dodao-select-element-button') as HTMLButtonElement;
      addEnableButtonStyles(selectButton);
      selectButton.addEventListener('click', handleSelectButtonClicked);

      const clearButton = document.getElementById('dodao-clear-selection-button') as HTMLButtonElement;
      addEnableButtonStyles(clearButton);
      clearButton.addEventListener('click', handleClearButtonClicked);

      const upButton = document.getElementById('dodao-up-button') as HTMLButtonElement;
      addEnableButtonStyles(upButton);
      upButton.addEventListener('click', handleUpButtonClicked);

      const downButton = document.getElementById('dodao-down-button') as HTMLButtonElement;
      addEnableButtonStyles(downButton);
      downButton.addEventListener('click', handleDownButtonClicked);
    }

    function disableButtonActions() {
      const selectButton: HTMLButtonElement = document.getElementById('dodao-select-element-button') as HTMLButtonElement;
      addDisableButtonStyles(selectButton);
      selectButton.removeEventListener('click', handleSelectButtonClicked);

      const clearButton = document.getElementById('dodao-clear-selection-button') as HTMLButtonElement;
      addDisableButtonStyles(clearButton);
      clearButton.removeEventListener('click', handleClearButtonClicked);

      const upButton = document.getElementById('dodao-up-button') as HTMLButtonElement;
      addDisableButtonStyles(upButton);
      upButton.removeEventListener('click', handleUpButtonClicked);

      const downButton = document.getElementById('dodao-down-button') as HTMLButtonElement;
      addDisableButtonStyles(downButton);
      downButton.removeEventListener('click', handleDownButtonClicked);
    }

    function handleMouseOver(e: MouseEvent) {
      e.preventDefault();
      if (hoverEnabled && !selectedElement) {
        clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => {
          const hoveredElement = e.target as HTMLElement;
          if (![selectButton, clearSelectionButton, upDownButtons, ...Array.from(upDownButtons.children)].includes(hoveredElement)) {
            createOrUpdateOverlay(hoveredElement, containingIframe);
          }
        }, 180);
      }
    }

    function handleClickOnPageElement(e: MouseEvent) {
      e.preventDefault();
      const clickedElement = e.target as HTMLElement;
      console.log('clickedElement', clickedElement);
      if (clickedElement === selectButton || clickedElement === clearSelectionButton) return;

      if (Array.from(upDownButtons.children).includes(clickedElement)) return;

      hoverEnabled = false;
      selectedElement = clickedElement;
      createOrUpdateOverlay(selectedElement, containingIframe);
      finalXPath = getXPath(selectedElement, containingIframe);
      removeEventListenersFromAllIframes();
      document.removeEventListener('mouseover', documentMouseoverHandler);
      document.removeEventListener('click', documentClickHandler);
      enableButtonActions();
    }
  }

  //************** Event handler **************//

  async function handleDoDAOParentWindowEvent(event: MessageEvent) {
    const data = event.data as DoDAOEventData;
    const allowedMessageTypes = ['elementSelector', 'showTooltip', 'capturePageScreenshot', 'captureElementScreenshot'];
    if (!allowedMessageTypes.includes(data.type)) return;

    console.log('Received message from parent window:', data);

    if (data.type === 'elementSelector') {
      elementSelector(event);
    }

    if (data.type === 'showTooltip') {
      showTooltip();
    }

    if (data.type === 'capturePageScreenshot') {
      const canvas = await html2canvas(document.body, { useCORS: true });
      const dataURL = canvas.toDataURL('image/png');
      event.source?.postMessage({ type: 'pageScreenshotCaptured', dataURL }, { targetOrigin: '*' });
    }

    if (data.type === 'captureElementScreenshot') {
      const { selector } = data;
      const currentDocAndTargetNode = getCurrentContextNodeAndTarget(selector)!;
      if (!currentDocAndTargetNode.targetNode) {
        console.error('Element not found using selector:', selector);
        event.source?.postMessage({ type: 'elementScreenshotErrored' }, { targetOrigin: '*' });
        return;
      }

      const { currentContextNode, targetNode } = currentDocAndTargetNode;
      console.log('currentContextNode', currentContextNode);
      console.log('targetNode', targetNode);
      const dataURL = await captureScreenshotWithOverlay(
        targetNode as HTMLElement,
        (selector as string).includes('iframe') ? (currentContextNode.documentElement as HTMLIFrameElement) : null
      );

      event.source?.postMessage({ type: 'elementScreenshotCaptured', dataURL }, { targetOrigin: '*' });
    }
  }

  window.onmessage = handleDoDAOParentWindowEvent;
  window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;

  console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);

  window.document.addEventListener('DOMContentLoaded', () => {
    showTooltip();
  });

  //************** Helper functions **************//
  function getCurrentContextNodeAndTarget(elementXPath: string): { currentContextNode: Document; targetNode: Node; isCurrentContextAndIframe: boolean } | null {
    console.log('event.data.elementXPath', elementXPath);
    document.addEventListener('click', (e: Event) => e.preventDefault());
    // Determine if the XPath is intended for an iframe by checking the prefix
    const isIframeXPath = elementXPath.startsWith('/html[1]/body[1]');

    if (isIframeXPath) {
      // Search in all iframes
      const iframes = document.querySelectorAll('iframe')!;
      for (const iframe of iframes) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          try {
            console.log('Evaluating XPath in iframe:', iframeDoc);

            const xpathResult = iframeDoc.evaluate(elementXPath, iframeDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (xpathResult) {
              const targetNode = xpathResult;
              const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];

              const materialStyle = iframeDoc.createElement('link');
              materialStyle.rel = 'stylesheet';
              materialStyle.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/themes/material.css';
              head.appendChild(materialStyle);

              const shiftTowardsStyle = iframeDoc.createElement('link');
              shiftTowardsStyle.rel = 'stylesheet';
              shiftTowardsStyle.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/animations/shift-toward.css';
              head.appendChild(shiftTowardsStyle);

              const tippyData = iframeDoc.createElement('link');
              tippyData.rel = 'stylesheet';
              tippyData.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/stylesheet/tippy-data.css';
              head.appendChild(tippyData);

              const link = iframeDoc.createElement('link');
              link.rel = 'stylesheet';
              link.href = '/clickable-demos-prod-files/clickableDemoTooltipStyles.css';
              iframeDoc.head.appendChild(link);

              return { currentContextNode: iframeDoc, targetNode, isCurrentContextAndIframe: true };
            }
          } catch (error) {
            console.error('Error evaluating XPath in iframe:', error);
          }
        }
      }
    } else {
      const xpathResult = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

      if (xpathResult) {
        console.log('Element found in the main document:', xpathResult);
        const targetNode = xpathResult;
        return { currentContextNode: document, targetNode, isCurrentContextAndIframe: false };
      }
    }

    console.log('Element not found using XPath.');
    // Fallback 1: select element near the middle of the screen
    console.log('Attempting to select a fallback element near the middle of the screen.');
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    const targetNode = document.elementFromPoint(centerX, centerY);

    if (targetNode) {
      console.log('Fallback element selected:', targetNode);
      return { currentContextNode: document, targetNode, isCurrentContextAndIframe: false };
    } else {
      console.log('Fallback failed: Could not find an element at the center of the screen.');

      // Fallback 2: use document.body or document.documentElement
      const targetNode = document.body || document.documentElement;

      if (targetNode) {
        console.log('Defaulting to document body as the target element:', targetNode);
        return { currentContextNode: document, targetNode, isCurrentContextAndIframe: false };
      }
    }

    return null;
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

  function getIframeOffset(iframe: HTMLIFrameElement): { top: number; left: number } {
    let top = 0;
    let left = 0;
    let element: HTMLElement | null = iframe;

    while (element) {
      const rect = element.getBoundingClientRect();
      top += rect.top + (element.ownerDocument.defaultView?.scrollY || 0);
      left += rect.left + (element.ownerDocument.defaultView?.scrollX || 0);
      element = element.ownerDocument.defaultView?.frameElement as HTMLElement | null;
    }

    return { top, left };
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
      zIndex: '2147483646',
    });

    const overlays = ['top', 'left', 'right', 'bottom'].map((position) => createOverlayPart(position, rect, scrollY, scrollHeight));

    overlays.forEach((overlay) => overlayContainer.appendChild(overlay));
    return overlayContainer;
  }

  function createOrUpdateOverlay(element: HTMLElement | null, containerIframe: HTMLIFrameElement | null) {
    if (!element) return;

    // get element's Xpath

    let rect: any = element.getBoundingClientRect();
    let scrollY = window.scrollY;
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    if (containerIframe) {
      const iframeOffset = getIframeOffset(containerIframe!);
      rect = {
        top: rect.top + iframeOffset.top,
        left: rect.left + iframeOffset.left,
        right: rect.right + iframeOffset.left,
        bottom: rect.bottom + iframeOffset.top,
        width: rect.width,
        height: rect.height,
      };
      scrollY = 0;
    }

    const existingOverlay = document.getElementById('dimming-overlay');
    if (existingOverlay) {
      updateOverlay(existingOverlay, rect, scrollY, scrollHeight);
    } else {
      const overlayContainer = createOverlayContainer(rect, scrollY, scrollHeight);
      document.body.appendChild(overlayContainer);
    }
  }

  function getXPath(element: HTMLElement, containerIframe: HTMLIFrameElement | null): string {
    if (!element) return '';
    const segments: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      const tagName = current.tagName.toLowerCase();
      const index = getElementIndex(current);
      segments.unshift(`${tagName}[${index}]`);
      current = current.parentElement;
    }
    if (containerIframe) {
      return `/${segments.join('/')}`;
    }
    return `/html/body/${segments.join('/')}`;
  }

  async function captureScreenshotWithOverlay(element: HTMLElement, containerIframe: HTMLIFrameElement | null): Promise<string> {
    let currentContextNode = document;
    let captureArea;
    const margin = 30;
    const { x: scrollOffsetX, y: scrollOffsetY } = calculateScrollOffsets(element);
    const yScroll = scrollOffsetY + window.scrollY;
    const rect = element.getBoundingClientRect();

    if (containerIframe) {
      captureArea = {
        x: Math.max(0, rect.left + scrollOffsetX - margin),
        y: Math.max(0, rect.top - 2 * margin),
        width: rect.width + margin * 2,
        height: rect.height + margin * 2,
      };
      currentContextNode = containerIframe.contentDocument || containerIframe.contentWindow!.document;
    } else {
      captureArea = {
        x: Math.max(0, rect.left + scrollOffsetX - margin),
        y: Math.max(0, rect.top + yScroll - margin),
        width: rect.width + margin * 2,
        height: rect.height + margin * 2,
      };
    }

    const canvas = await html2canvas(currentContextNode.body, {
      x: captureArea.x,
      y: captureArea.y,
      width: captureArea.width,
      height: captureArea.height,
      windowWidth: document.documentElement.scrollWidth,
      scrollY: scrollOffsetY,
      useCORS: true,
      backgroundColor: null,
      logging: true,
    });
    const dataURL = canvas.toDataURL('image/png');
    return dataURL;
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
})();
