"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function showTooltip(event) {
    const { elementXPath, tooltipContent: contentText, currentTooltipIndex, tooltipArrayLen, placement } = event.data;
    console.log('event.data.elementXPath', elementXPath);
    document.addEventListener('click', (e) => e.preventDefault());
    const xpathResult = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    console.log('xpathResult', xpathResult);
    const targetNode = xpathResult.singleNodeValue;
    if (!targetNode || !(targetNode instanceof HTMLElement))
        return;
    const target = targetNode;
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
        var _a, _b;
        (_a = target._tippy) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = event.source) === null || _b === void 0 ? void 0 : _b.postMessage({ backButton: true }, { targetOrigin: event.origin });
    });
    if (currentTooltipIndex === 0)
        backButton.style.visibility = 'hidden';
    buttonsRow.appendChild(backButton);
    const indices = document.createElement('span');
    indices.textContent = `${currentTooltipIndex + 1} of ${tooltipArrayLen}`;
    indices.classList.add('dodao-indices');
    buttonsRow.appendChild(indices);
    const isLastTooltip = currentTooltipIndex === tooltipArrayLen - 1;
    const nextButtonText = isLastTooltip ? 'Complete' : 'Next';
    const nextButton = createTooltipButton(nextButtonText, 'dodao-next-button', () => {
        var _a, _b;
        (_a = target._tippy) === null || _a === void 0 ? void 0 : _a.destroy();
        const messageType = isLastTooltip ? 'completeButton' : 'nextButton';
        (_b = event.source) === null || _b === void 0 ? void 0 : _b.postMessage({ [messageType]: true }, { targetOrigin: event.origin });
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
        placement: placement,
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
function createTooltipButton(text, className, onClick) {
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
function adjustButtonStyles(buttons, isLastTooltip) {
    const maxWidth = isLastTooltip ? '30%' : '20%';
    buttons.forEach((button) => {
        button.style.maxWidth = maxWidth;
    });
}
function replaceIframeWithShadowDom() {
    const iframeArr = document.getElementsByTagName('iframe');
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
function elementSelector(event) {
    let selectedElement = null;
    let finalXPath = null;
    let hoverEnabled = true;
    let hoverTimer;
    document.body.style.cursor = 'pointer';
    document.querySelectorAll('input').forEach((input) => {
        input.style.cursor = 'pointer';
    });
    const upDownButtons = createUpDownButtons();
    const selectButton = createSelectButton();
    const clearSelectionButton = createClearSelectionButton();
    document.body.appendChild(upDownButtons);
    document.body.appendChild(selectButton);
    document.body.appendChild(clearSelectionButton);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);
    function createOrUpdateOverlay(element) {
        if (!element)
            return;
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const existingOverlay = document.getElementById('dimming-overlay');
        if (existingOverlay) {
            updateOverlay(existingOverlay, rect, scrollY, scrollHeight);
        }
        else {
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
            zIndex: '50000000',
        });
        const overlays = ['top', 'left', 'right', 'bottom'].map((position) => createOverlayPart(position, rect, scrollY, scrollHeight));
        overlays.forEach((overlay) => overlayContainer.appendChild(overlay));
        return overlayContainer;
    }
    function createOverlayPart(position, rect, scrollY, scrollHeight) {
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
    function updateOverlay(container, rect, scrollY, scrollHeight) {
        const overlays = container.children;
        const topOverlay = overlays[0];
        const leftOverlay = overlays[1];
        const rightOverlay = overlays[2];
        const bottomOverlay = overlays[3];
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
    function captureScreenshotWithOverlay(element) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    .then((canvas) => {
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                })
                    .catch((error) => {
                    console.error('Error capturing screenshot:', error);
                    reject(error);
                });
            });
        });
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
    function isScrollable(element) {
        const overflowY = window.getComputedStyle(element).overflowY;
        return overflowY === 'scroll' || overflowY === 'auto';
    }
    function createUpDownButtons() {
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
    function navigateSelection(direction) {
        if (!selectedElement)
            return;
        if (direction === 'up' && selectedElement.parentElement && selectedElement.parentElement !== document.body) {
            selectedElement = selectedElement.parentElement;
        }
        else if (direction === 'down' && selectedElement.firstElementChild) {
            selectedElement = selectedElement.firstElementChild;
        }
        else {
            return;
        }
        createOrUpdateOverlay(selectedElement);
        finalXPath = getXPath(selectedElement);
    }
    function createSelectButton() {
        const button = document.createElement('button');
        button.textContent = 'Select';
        button.classList.add('dodao-select-element-button');
        button.disabled = true;
        button.style.opacity = '0.5';
        button.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (selectedElement && finalXPath) {
                const dataUrl = yield captureScreenshotWithOverlay(selectedElement);
                (_a = event.source) === null || _a === void 0 ? void 0 : _a.postMessage({ xpath: finalXPath, elementImgUrl: dataUrl }, { targetOrigin: event.origin } // Use options object instead of just `event.origin`
                );
            }
        }));
        button.addEventListener('mouseover', () => {
            if (!button.disabled)
                button.style.opacity = '0.7';
        });
        button.addEventListener('mouseout', () => {
            if (!button.disabled)
                button.style.opacity = '1';
        });
        return button;
    }
    function createClearSelectionButton() {
        const button = document.createElement('button');
        button.textContent = 'Clear Selection';
        button.classList.add('dodao-clear-selection-button');
        button.disabled = selectedElement === null;
        button.style.opacity = '0.5';
        button.addEventListener('mouseover', () => {
            if (!button.disabled)
                button.style.opacity = '0.7';
        });
        button.addEventListener('mouseout', () => {
            if (!button.disabled)
                button.style.opacity = '1';
        });
        button.addEventListener('click', () => {
            selectedElement = null;
            finalXPath = null;
            hoverEnabled = true;
            const overlay = document.getElementById('dimming-overlay');
            if (overlay)
                overlay.remove();
            selectButton.disabled = true;
            selectButton.style.opacity = '0.5';
            document.body.style.cursor = 'default';
            button.disabled = true;
            button.style.opacity = '0.5';
        });
        return button;
    }
    function handleMouseOver(e) {
        e.preventDefault();
        if (hoverEnabled && !selectedElement) {
            clearTimeout(hoverTimer);
            hoverTimer = window.setTimeout(() => {
                const hoveredElement = e.target;
                if (![selectButton, clearSelectionButton, upDownButtons, ...Array.from(upDownButtons.children)].includes(hoveredElement)) {
                    createOrUpdateOverlay(hoveredElement);
                }
            }, 180);
        }
    }
    function handleClick(e) {
        e.preventDefault();
        const clickedElement = e.target;
        if (clickedElement === selectButton || clickedElement === clearSelectionButton)
            return;
        if (Array.from(upDownButtons.children).includes(clickedElement))
            return;
        hoverEnabled = false;
        selectedElement = clickedElement;
        selectButton.disabled = false;
        selectButton.style.opacity = '1';
        clearSelectionButton.disabled = false;
        clearSelectionButton.style.opacity = '1';
        createOrUpdateOverlay(selectedElement);
        finalXPath = getXPath(selectedElement);
    }
    function getXPath(element) {
        if (!element)
            return '';
        const segments = [];
        let current = element;
        while (current && current !== document.body) {
            const tagName = current.tagName.toLowerCase();
            const index = getElementIndex(current);
            segments.unshift(`${tagName}[${index}]`);
            current = current.parentElement;
        }
        return `/html/body/${segments.join('/')}`;
    }
    function getElementIndex(element) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.tagName === element.tagName)
                index++;
            sibling = sibling.previousElementSibling;
        }
        return index;
    }
}
function handleDoDAOParentWindowEvent(event) {
    const data = event.data;
    if (data.type === 'showTooltip') {
        replaceIframeWithShadowDom();
        // Check if the page has fully loaded
        if (document.readyState === 'complete') {
            // Page is fully loaded, proceed to show tooltip
            showTooltip(event);
        }
        else {
            // Wait for the page to fully load before showing tooltip
            window.addEventListener('load', () => {
                showTooltip(event);
            }, { once: true }); // Ensure the event is only handled once
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