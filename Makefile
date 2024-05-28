upload-to-s3:
	aws s3 cp clickable-demos/clickableDemoTooltipScript.js s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoTooltipScript --acl public-read
	aws s3 cp clickable-demos/clickableDemoTooltipStyles.css s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoTooltipStyles.css --acl public-read
