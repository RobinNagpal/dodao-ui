pull-image:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 729763663166.dkr.ecr.us-east-1.amazonaws.com
	docker pull 729763663166.dkr.ecr.us-east-1.amazonaws.com/crowd-fund-analysis:latest

run-image:
	docker stop cf-analysis-container || true
	docker rm cf-analysis-container || true
	docker run -it -p 9500:5000 --name cf-analysis-container 729763663166.dkr.ecr.us-east-1.amazonaws.com/crowd-fund-analysis:latest env

