// With the above scripts loaded, you can call `tippy()` with a CSS
      // selector and a `content` prop:
      window.addEventListener('message', (event) => {

        const xpathResult = document.evaluate(
        event.data.elementXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const target = xpathResult.singleNodeValue;

      const tooltipContent = document.createElement("div");

      // Add text content or any other elements to your tooltip as needed
      const textElement = document.createElement("p");
      textElement.textContent = event.data.tooltipContent;
      textElement.style.display = "inline";
      textElement.style.margin = "0 auto";
      textElement.style.fontSize = "1rem";
      textElement.style.fontFamily = "sans-serif";
      textElement.style.fontWeight = "300";

      tooltipContent.style.display = "flex";
      tooltipContent.style.flexDirection = "column";
      tooltipContent.style.justifyContent = "space-around";
      tooltipContent.style.minHeight = "130px"; // Set a minimum height for the tooltip
      tooltipContent.style.minWidth = "300px"; // Set a minimum width for the tooltip
      tooltipContent.style.padding = "3px 12px"; // Add padding to the tooltip
      tooltipContent.appendChild(textElement);

      // textElement.style.marginBottom = "8px"; // Add some space below the text content

      // Add an <hr> element to serve as a horizontal line
      const horizontalLine = document.createElement("hr");
      horizontalLine.style.borderTop = "1px solid #808080"; // Style the line as needed
      horizontalLine.style.margin = "2px 0"; // Add some space around the line
      // Append the horizontal line before the buttons
      tooltipContent.appendChild(horizontalLine);

      const buttonsRow = document.createElement("div");
      buttonsRow.style.display = "flex";
      buttonsRow.style.justifyContent = "space-between";

      // Create the 'Back' button
      const backButton = document.createElement("button");
      backButton.textContent = "Back";
      backButton.onclick = () => {
          event.source.postMessage(
          { backButton: true},
          event.origin,
        );
      };

      // Style the 'Back' button
      backButton.style.padding = "5px 10px"; // Padding for a larger click area
      backButton.style.border = "none"; // Remove default border
      backButton.style.borderRadius = "5px"; // Rounded corners
      backButton.style.backgroundImage =
        "linear-gradient(to right, #6e85b7, #b8c0ff)"; // Gradient background
      backButton.style.color = "white"; // Text color
      backButton.style.fontWeight = "bold"; // Make the text bold
      backButton.style.cursor = "pointer"; // Cursor on hover
      backButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // Box shadow for depth
      backButton.style.transition = "all 0.3s ease"; // Transition for smooth hover effect

      // Align the button at the bottom left
      backButton.style.marginTop = "auto";
      backButton.style.alignSelf = "flex-start";
      backButton.style.marginRight = "auto";

      // Hover effect
      backButton.onmouseover = () => {
        backButton.style.backgroundImage =
          "linear-gradient(to right, #b8c0ff, #6e85b7)";
      };
      backButton.onmouseout = () => {
        backButton.style.backgroundImage =
          "linear-gradient(to right, #6e85b7, #b8c0ff)";
      };
      if (event.data.currentTooltipIndex === 0) backButton.style.visibility = "hidden";

      // Append the button to the container
      buttonsRow.appendChild(backButton);

      const indices = document.createElement("span");
      indices.textContent = `${event.data.currentTooltipIndex + 1} of ${
        event.data.tooltipArrayLen
      }`;

      indices.style.color = "#84868a";
      indices.style.margin = "auto";
      indices.style.fontSize = "small";
      indices.style.fontWeight = "300";

      buttonsRow.appendChild(indices);

      // Create the 'Next' button
      const nextButton = document.createElement("button");
      nextButton.textContent =
        event.data.currentTooltipIndex === event.data.tooltipArrayLen - 1 ? "Complete" : "Next";
      nextButton.onclick = async () => {
          event.source.postMessage(
          { nextButton: true},
          event.origin,
        );
      };

      // Style the 'Next' button
      nextButton.style.padding = "5px 10px"; // Padding for a larger click area
      nextButton.style.border = "none"; // Remove default border
      nextButton.style.borderRadius = "5px"; // Rounded corners
      nextButton.style.backgroundImage =
        "linear-gradient(to left, #FFB6C1, #FF69B4)"; // Gradient background, pink hues
      nextButton.style.color = "white"; // Text color
      nextButton.style.fontWeight = "bold"; // Make the text bold
      nextButton.style.cursor = "pointer"; // Cursor on hover
      nextButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"; // Box shadow for depth
      nextButton.style.transition = "all 0.3s ease"; // Transition for smooth hover effect

      // Align the button at the bottom right
      nextButton.style.marginTop = "auto";
      nextButton.style.alignSelf = "flex-end";
      nextButton.style.marginLeft = "auto";
      nextButton.addEventListener('click', () => {
        console.log("next button clicked");
      });

      // Hover effect
      nextButton.onmouseover = () => {
        nextButton.style.backgroundImage =
          "linear-gradient(to left, #FF69B4, #FFB6C1)";
      };
      nextButton.onmouseout = () => {
        nextButton.style.backgroundImage =
          "linear-gradient(to left, #FFB6C1, #FF69B4)";
      };

      if (event.data.currentTooltipIndex === event.data.tooltipArrayLen - 1)
        nextButton.disabled = true;

      // Append the button to the container
      buttonsRow.appendChild(nextButton);

      tooltipContent.appendChild(buttonsRow);

      if(target){
        target.scrollIntoView({
          behavior: "smooth", // Optional: defines the transition animation
          block: "center", // Vertical alignment: options are 'start', 'center', 'end', or 'nearest'
          inline: "nearest", // Horizontal alignment: options are 'start', 'center', 'end', or 'nearest'
        });
      }

       tippy(target, {
        allowHTML: true,
        placement: "top",
        offset: [0, 10],
        animation: "shift-toward", // Use the 'scale' animation
        interactive: true,
        inertia: true,
        duration: [2000, 250],
        delay: [500, 200],
        content: tooltipContent,
        showOnCreate: true,
        hideOnClick: false,
        trigger: "manual",
        theme: "material",
      });
});