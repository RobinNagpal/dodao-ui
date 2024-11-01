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
    let hoveredElement = null;
    let finalXPath = null;
    let hoverEnabled = true;
    let hoverTimer;
    // Set the cursor for the entire body
    document.body.style.cursor = 'pointer';
    // Create the canvas element
    const canvas = document.createElement('canvas');
    // Set CSS properties to ensure the canvas overlays the entire page
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '100000'; // Ensure it's above other content
    canvas.style.pointerEvents = 'none'; // Allow mouse events to pass through to elements below
    canvas.style.opacity = '0.5'; // Semi-transparent
    // Append the canvas to the body
    document.body.appendChild(canvas);
    console.log('canvas', canvas);
    // Get the canvas drawing context
    const ctx = canvas.getContext('2d');
    // Function to update canvas size based on the window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    // Listen for resize events to adjust the canvas size
    window.addEventListener('resize', resizeCanvas);
    // Initially set the canvas size and fill it
    resizeCanvas();
    // Example of filling the canvas with a semi-transparent color
    ctx.fillStyle = 'rgba(128, 128, 128, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    function updateCanvasForSelectedElement(element) {
        fillCanvas();
        clearArea(element);
    }
    function fillCanvas() {
        console.log('fillCanvas');
        // Fill the canvas with a semi-transparent overlay
        ctx.fillStyle = 'rgba(128, 128, 128, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // Function to clear area based on an element's dimensions
    function clearArea(element) {
        console.log('clearArea', element);
        // const rect = element.getBoundingClientRect();
        const startTime = performance.now();
        const rect = element.getBoundingClientRect();
        function animate(time) {
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / 600, 1);
            const remainingAlpha = 1 - progress;
            // Clear the area with decreasing alpha
            ctx.save();
            ctx.globalAlpha = remainingAlpha;
            ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
            ctx.restore();
            // Continue the animation until the progress is complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
                // Animation complete
                fillCanvas();
                ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
            }
        }
        requestAnimationFrame(animate);
    }
    document.querySelectorAll('input').forEach((input) => {
        input.style.cursor = 'pointer';
    });
    const upDownButtons = createUpDownButtons();
    const selectButton = createSelectButton();
    const clearSelectionButton = createClearSelectionButton();
    document.body.appendChild(upDownButtons);
    document.body.appendChild(selectButton);
    document.body.appendChild(clearSelectionButton);
    document.addEventListener('click', handleClick);
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
        updateCanvasForSelectedElement(selectedElement);
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
    // Add mouseover listener to all elements that need this effect
    document
        .querySelectorAll('div, span, p, img, a, button') // Specify other selectors as needed
        .forEach((el) => {
        el.addEventListener('mouseover', function (e) {
            const htmlElement = el;
            hoveredElement = htmlElement;
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            if (!selectedElement) {
                clearTimeout(hoverTimer);
                hoverTimer = window.setTimeout(() => {
                    const hoveredElement = htmlElement;
                    if (![selectButton, clearSelectionButton, upDownButtons, ...Array.from(upDownButtons.children)].includes(hoveredElement)) {
                        updateCanvasForSelectedElement(hoveredElement);
                    }
                });
            }
            else {
                console.log('element is already selected', selectedElement);
            }
        });
    });
    function handleClick(e) {
        e.preventDefault();
        const clickedElement = e.target;
        if (!hoveredElement || clickedElement === selectButton || clickedElement === clearSelectionButton)
            return;
        if (Array.from(upDownButtons.children).includes(clickedElement))
            return;
        hoverEnabled = false;
        selectedElement = hoveredElement;
        selectButton.disabled = false;
        selectButton.style.opacity = '1';
        clearSelectionButton.disabled = false;
        clearSelectionButton.style.opacity = '1';
        updateCanvasForSelectedElement(selectedElement);
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
