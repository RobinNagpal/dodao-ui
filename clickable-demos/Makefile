upload-clickable-demo-files-to-prod:
	aws s3 cp prod-files/clickableDemoTooltipScript.js s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoTooltipScript.js --acl public-read
	aws s3 cp prod-files/clickableDemoServiceWorker.js s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoServiceWorker.js --acl public-read
	aws s3 cp prod-files/clickableDemoTooltipStyles.css s3://dodao-prod-public-assets/clickable-demos-prod-files/clickableDemoTooltipStyles.css --acl public-read

upload-clickable-demo-dependencies-to-prod:
	aws s3 cp clickable-demos/dependencies s3://dodao-prod-public-assets/clickable-demos-prod-files/dependencies/ --recursive --acl public-read

upload-clickable-demo-files-to-dev:
	aws s3 cp prod-files/clickableDemoTooltipScript.js s3://dodao-dev-public-assets/clickable-demos-prod-files/clickableDemoTooltipScript.js --acl public-read
	aws s3 cp prod-files/clickableDemoServiceWorker.js s3://dodao-dev-public-assets/clickable-demos-prod-files/clickableDemoServiceWorker.js --acl public-read
	aws s3 cp prod-files/clickableDemoTooltipStyles.css s3://dodao-dev-public-assets/clickable-demos-prod-files/clickableDemoTooltipStyles.css --acl public-read

upload-clickable-demo-dependencies-to-dev:
	aws s3 cp prod-files/dependencies s3://dodao-dev-public-assets/clickable-demos-prod-files/dependencies/ --recursive --acl public-read

create-migration:
	yarn prisma migrate dev --create-only
