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
(function () {
    function showTooltip() {
        const dataString = window.name;
        if (!dataString) {
            return;
        }
        const data = JSON.parse(dataString);
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
        const currentDocAndTargetNode = getCurrentContextNodeAndTarget(elementXPath);
        if (!currentDocAndTargetNode.targetNode || !currentDocAndTargetNode.currentContextNode)
            return;
        const { currentContextNode, targetNode } = currentDocAndTargetNode;
        const target = targetNode;
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
            var _a;
            (_a = target._tippy) === null || _a === void 0 ? void 0 : _a.destroy();
            window.parent.postMessage({ backButton: true }, '*');
        });
        if (currentTooltipIndex === 0)
            backButton.style.visibility = 'hidden';
        buttonsRow.appendChild(backButton);
        const indices = currentContextNode.createElement('span');
        indices.textContent = `${currentTooltipIndex + 1} of ${tooltipArrayLen}`;
        indices.classList.add('dodao-indices');
        buttonsRow.appendChild(indices);
        const isLastTooltip = currentTooltipIndex === tooltipArrayLen - 1;
        const nextButtonText = isLastTooltip ? 'Complete' : 'Next';
        const nextButton = createTooltipButton(nextButtonText, 'dodao-next-button', () => {
            var _a;
            (_a = target._tippy) === null || _a === void 0 ? void 0 : _a.destroy();
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
        window.tippy(target, {
            allowHTML: true,
            placement: placement,
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
    function elementSelector(event) {
        let selectedElement = null;
        let finalXPath = null;
        let hoverEnabled = true;
        let hoverTimer;
        let containingIframe;
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
        function documentClickHandler(event) {
            if (hoverEnabled)
                containingIframe = null;
            handleClickOnPageElement(event);
        }
        function documentMouseoverHandler(event) {
            if (hoverEnabled)
                containingIframe = null;
            handleMouseOver(event);
        }
        document.addEventListener('mouseover', documentMouseoverHandler);
        document.addEventListener('click', documentClickHandler);
        function handleIframeClick(event) {
            var _a, _b, _c;
            event.stopPropagation();
            const clickedFrame = (_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView) === null || _c === void 0 ? void 0 : _c.frameElement;
            if (clickedFrame) {
                containingIframe = clickedFrame;
                handleClickOnPageElement(event);
            }
        }
        function handleIframeMouseOver(event) {
            var _a, _b, _c;
            event.stopPropagation();
            // containingIframe = event.currentTarget.ownerDocument.defaultView.frameElement;
            const mouseoverFrame = (_c = (_b = (_a = event.currentTarget) === null || _a === void 0 ? void 0 : _a.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView) === null || _c === void 0 ? void 0 : _c.frameElement;
            if (mouseoverFrame) {
                containingIframe = mouseoverFrame;
                handleMouseOver(event);
            }
        }
        // Function to add event listeners to an iframe
        function addEventListenersToIframe(iframe) {
            var _a;
            try {
                const iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                if (iframeDoc) {
                    iframeDoc.addEventListener('click', handleIframeClick);
                    iframeDoc.addEventListener('mouseover', handleIframeMouseOver);
                }
                else {
                    console.error('Unable to access iframe content. It might be cross-origin.');
                }
            }
            catch (error) {
                console.error('Error accessing or attaching event listeners to iframe content:', error);
            }
        }
        // Function to remove event listeners from an iframe
        function removeEventListenersFromIframe(iframe) {
            var _a;
            try {
                const iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                if (iframeDoc) {
                    iframeDoc.removeEventListener('click', handleIframeClick);
                    iframeDoc.removeEventListener('mouseover', handleIframeMouseOver);
                }
            }
            catch (error) {
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
            var _a;
            if (selectedElement && finalXPath) {
                console.log('Selected element:', selectedElement);
                console.log('Final XPath:', finalXPath);
                console.log('Sending message to parent window:', { type: 'elementSelected', xpath: finalXPath });
                (_a = event.source) === null || _a === void 0 ? void 0 : _a.postMessage({ type: 'elementSelected', xpath: finalXPath }, { targetOrigin: '*' } // Use options object instead of just `event.origin`
                );
            }
        }
        function handleClearButtonClicked() {
            selectedElement = null;
            finalXPath = null;
            containingIframe = null;
            hoverEnabled = true;
            const overlay = document.getElementById('dimming-overlay');
            if (overlay)
                overlay.remove();
            document.body.style.cursor = 'default';
            document.addEventListener('mouseover', documentMouseoverHandler);
            document.addEventListener('click', documentClickHandler);
            disableButtonActions();
        }
        function handleUpButtonClicked() {
            if (finalXPath)
                navigateSelection('up');
        }
        function handleDownButtonClicked() {
            if (finalXPath)
                navigateSelection('down');
        }
        function buttonMouseoverHandler(event) {
            if (finalXPath)
                event.target.style.opacity = '0.7';
        }
        function buttonMouseoutHandler(event) {
            if (finalXPath)
                event.target.style.opacity = '1';
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
            createOrUpdateOverlay(selectedElement, containingIframe);
            finalXPath = getXPath(selectedElement, containingIframe);
        }
        function createUpDownButtons() {
            const existingContainer = document.getElementById('dodao-up-down-buttons');
            if (existingContainer)
                return existingContainer;
            const container = document.createElement('div');
            container.id = 'dodao-up-down-buttons';
            container.classList.add('dodao-up-down-buttons');
            const existingButtons = document.getElementById('dodao-up-button');
            if (!existingButtons) {
                const minusButton = document.createElement('button');
                minusButton.textContent = '-';
                minusButton.title = 'Click to move to parent of element';
                minusButton.id = 'dodao-up-button';
                minusButton.style.opacity = '0.3';
                minusButton.style.cursor = 'not-allowed';
                minusButton.disabled = true;
                container.appendChild(minusButton);
            }
            const existingPlusButton = document.getElementById('dodao-down-button');
            if (!existingPlusButton) {
                const plusButton = document.createElement('button');
                plusButton.textContent = '+';
                plusButton.title = 'Click to move down to first child of element';
                plusButton.id = 'dodao-down-button';
                plusButton.style.opacity = '0.3';
                plusButton.style.cursor = 'not-allowed';
                plusButton.disabled = true;
                container.appendChild(plusButton);
            }
            return container;
        }
        function createSelectButton() {
            const selectButton = document.getElementById('dodao-select-element-button');
            if (selectButton)
                return selectButton;
            const button = document.createElement('button');
            button.textContent = 'Select';
            button.classList.add('dodao-select-element-button');
            button.id = 'dodao-select-element-button';
            button.disabled = true;
            button.style.opacity = '0.3';
            button.style.cursor = 'not-allowed';
            return button;
        }
        function createClearSelectionButton() {
            const clearButton = document.getElementById('dodao-clear-selection-button');
            if (clearButton)
                return clearButton;
            const button = document.createElement('button');
            button.textContent = 'Clear Selection';
            button.classList.add('dodao-clear-selection-button');
            button.id = 'dodao-clear-selection-button';
            button.disabled = selectedElement === null;
            button.style.opacity = '0.3';
            button.style.cursor = 'not-allowed';
            return button;
        }
        function enableButtonActions() {
            const selectButton = document.getElementById('dodao-select-element-button');
            selectButton.style.cursor = 'pointer';
            selectButton.disabled = false;
            selectButton.style.opacity = '1';
            selectButton.addEventListener('mouseover', buttonMouseoverHandler);
            selectButton.addEventListener('mouseout', buttonMouseoutHandler);
            selectButton.addEventListener('click', handleSelectButtonClicked);
            const clearButton = document.getElementById('dodao-clear-selection-button');
            clearButton.style.cursor = 'pointer';
            clearButton.disabled = false;
            clearButton.style.opacity = '1';
            clearButton.addEventListener('mouseover', buttonMouseoverHandler);
            clearButton.addEventListener('mouseout', buttonMouseoutHandler);
            clearButton.addEventListener('click', handleClearButtonClicked);
            const upButton = document.getElementById('dodao-up-button');
            upButton.style.cursor = 'pointer';
            upButton.disabled = false;
            upButton.style.opacity = '1';
            upButton.addEventListener('mouseover', buttonMouseoverHandler);
            upButton.addEventListener('mouseout', buttonMouseoutHandler);
            upButton.addEventListener('click', handleUpButtonClicked);
            const downButton = document.getElementById('dodao-down-button');
            downButton.style.cursor = 'pointer';
            downButton.disabled = false;
            downButton.style.opacity = '1';
            downButton.addEventListener('mouseover', buttonMouseoverHandler);
            downButton.addEventListener('mouseout', buttonMouseoutHandler);
            downButton.addEventListener('click', handleDownButtonClicked);
        }
        function disableButtonActions() {
            const selectButton = document.getElementById('dodao-select-element-button');
            selectButton.style.cursor = 'not-allowed';
            selectButton.disabled = true;
            selectButton.style.opacity = '0.3';
            selectButton.removeEventListener('click', handleSelectButtonClicked);
            const clearButton = document.getElementById('dodao-clear-selection-button');
            clearButton.style.cursor = 'not-allowed';
            clearButton.disabled = true;
            clearButton.style.opacity = '0.3';
            clearButton.removeEventListener('click', handleClearButtonClicked);
            const upButton = document.getElementById('dodao-up-button');
            upButton.style.cursor = 'not-allowed';
            upButton.disabled = true;
            upButton.style.opacity = '0.3';
            upButton.removeEventListener('click', handleUpButtonClicked);
            const downButton = document.getElementById('dodao-down-button');
            downButton.style.cursor = 'not-allowed';
            downButton.disabled = true;
            downButton.style.opacity = '0.3';
            downButton.removeEventListener('click', handleDownButtonClicked);
        }
        function handleMouseOver(e) {
            e.preventDefault();
            if (hoverEnabled && !selectedElement) {
                clearTimeout(hoverTimer);
                hoverTimer = window.setTimeout(() => {
                    const hoveredElement = e.target;
                    if (![selectButton, clearSelectionButton, upDownButtons, ...Array.from(upDownButtons.children)].includes(hoveredElement)) {
                        createOrUpdateOverlay(hoveredElement, containingIframe);
                    }
                }, 180);
            }
        }
        function handleClickOnPageElement(e) {
            e.preventDefault();
            const clickedElement = e.target;
            console.log('clickedElement', clickedElement);
            if (clickedElement === selectButton || clickedElement === clearSelectionButton)
                return;
            if (Array.from(upDownButtons.children).includes(clickedElement))
                return;
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
    function handleDoDAOParentWindowEvent(event) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const data = event.data;
            const allowedMessageTypes = ['elementSelector', 'showTooltip', 'capturePageScreenshot', 'captureElementScreenshot'];
            if (!allowedMessageTypes.includes(data.type))
                return;
            console.log('Received message from parent window:', data);
            if (data.type === 'elementSelector') {
                elementSelector(event);
            }
            if (data.type === 'showTooltip') {
                showTooltip();
            }
            if (data.type === 'capturePageScreenshot') {
                const canvas = yield html2canvas(document.body, { useCORS: true });
                const dataURL = canvas.toDataURL('image/png');
                (_a = event.source) === null || _a === void 0 ? void 0 : _a.postMessage({ type: 'pageScreenshotCaptured', dataURL }, { targetOrigin: '*' });
            }
            if (data.type === 'captureElementScreenshot') {
                const { selector } = data;
                const currentDocAndTargetNode = getCurrentContextNodeAndTarget(selector);
                if (!currentDocAndTargetNode.targetNode) {
                    console.error('Element not found using selector:', selector);
                    (_b = event.source) === null || _b === void 0 ? void 0 : _b.postMessage({ type: 'elementScreenshotErrored' }, { targetOrigin: '*' });
                    return;
                }
                const { currentContextNode, targetNode } = currentDocAndTargetNode;
                console.log('currentContextNode', currentContextNode);
                console.log('targetNode', targetNode);
                const dataURL = yield captureScreenshotWithOverlay(targetNode, selector.includes('iframe') ? currentContextNode.documentElement : null);
                (_c = event.source) === null || _c === void 0 ? void 0 : _c.postMessage({ type: 'elementScreenshotCaptured', dataURL }, { targetOrigin: '*' });
            }
        });
    }
    window.onmessage = handleDoDAOParentWindowEvent;
    window.handleDoDAOParentWindowEvent = handleDoDAOParentWindowEvent;
    console.log('handleDoDAOParentWindowEvent is defined on window', window.handleDoDAOParentWindowEvent);
    window.document.addEventListener('DOMContentLoaded', () => {
        showTooltip();
    });
    //************** Helper functions **************//
    function getCurrentContextNodeAndTarget(elementXPath) {
        var _a;
        console.log('event.data.elementXPath', elementXPath);
        document.addEventListener('click', (e) => e.preventDefault());
        let currentContextNode = document;
        // Determine if the XPath is intended for an iframe by checking the prefix
        const isIframeXPath = elementXPath.startsWith('/html[1]/body[1]');
        let targetNode = null;
        if (isIframeXPath) {
            // Search in all iframes
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                const iframeDoc = iframe.contentDocument || ((_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document);
                if (iframeDoc) {
                    try {
                        const xpathResult = iframeDoc.evaluate(elementXPath, iframeDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (xpathResult) {
                            targetNode = xpathResult;
                            currentContextNode = iframeDoc;
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
                            break;
                        }
                    }
                    catch (error) {
                        console.error('Error evaluating XPath in iframe:', error);
                    }
                }
            }
            if (!targetNode) {
                console.log('Element not found in any iframe.');
            }
        }
        else {
            const xpathResult = document.evaluate(elementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (xpathResult) {
                console.log('Element found in the main document:', xpathResult);
                targetNode = xpathResult;
            }
            else {
                console.log('Element not found in the main document.');
            }
        }
        if (targetNode) {
            return { currentContextNode, targetNode };
        }
        else {
            console.log('Element not found using XPath.');
            // Fallback 1: select element near the middle of the screen
            console.log('Attempting to select a fallback element near the middle of the screen.');
            const viewportWidth = currentContextNode.documentElement.clientWidth;
            const viewportHeight = currentContextNode.documentElement.clientHeight;
            const centerX = viewportWidth / 2;
            const centerY = viewportHeight / 2;
            targetNode = currentContextNode.elementFromPoint(centerX, centerY);
            if (targetNode) {
                console.log('Fallback element selected:', targetNode);
                return { currentContextNode, targetNode };
            }
            else {
                console.log('Fallback failed: Could not find an element at the center of the screen.');
                // Fallback 2: use document.body or document.documentElement
                targetNode = currentContextNode.body || currentContextNode.documentElement;
                if (targetNode) {
                    console.log('Defaulting to document body as the target element:', targetNode);
                    return { currentContextNode, targetNode };
                }
                else {
                    console.log('No suitable default element found. Exiting function.');
                    return null;
                }
            }
        }
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
    function getIframeOffset(iframe) {
        var _a, _b, _c;
        let top = 0;
        let left = 0;
        let element = iframe;
        while (element) {
            const rect = element.getBoundingClientRect();
            top += rect.top + (((_a = element.ownerDocument.defaultView) === null || _a === void 0 ? void 0 : _a.scrollY) || 0);
            left += rect.left + (((_b = element.ownerDocument.defaultView) === null || _b === void 0 ? void 0 : _b.scrollX) || 0);
            element = (_c = element.ownerDocument.defaultView) === null || _c === void 0 ? void 0 : _c.frameElement;
        }
        return { top, left };
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
            zIndex: '2147483646',
        });
        const overlays = ['top', 'left', 'right', 'bottom'].map((position) => createOverlayPart(position, rect, scrollY, scrollHeight));
        overlays.forEach((overlay) => overlayContainer.appendChild(overlay));
        return overlayContainer;
    }
    function createOrUpdateOverlay(element, containerIframe) {
        if (!element)
            return;
        // get element's Xpath
        let rect = element.getBoundingClientRect();
        let scrollY = window.scrollY;
        const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        if (containerIframe) {
            const iframeOffset = getIframeOffset(containerIframe);
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
        }
        else {
            const overlayContainer = createOverlayContainer(rect, scrollY, scrollHeight);
            document.body.appendChild(overlayContainer);
        }
    }
    function getXPath(element, containerIframe) {
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
        if (containerIframe) {
            return `/${segments.join('/')}`;
        }
        return `/html/body/${segments.join('/')}`;
    }
    function captureScreenshotWithOverlay(element, containerIframe) {
        return __awaiter(this, void 0, void 0, function* () {
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
                currentContextNode = containerIframe.contentDocument || containerIframe.contentWindow.document;
            }
            else {
                captureArea = {
                    x: Math.max(0, rect.left + scrollOffsetX - margin),
                    y: Math.max(0, rect.top + yScroll - margin),
                    width: rect.width + margin * 2,
                    height: rect.height + margin * 2,
                };
            }
            const canvas = yield html2canvas(currentContextNode.body, {
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
})();
