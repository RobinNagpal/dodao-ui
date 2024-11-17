shell:
	poetry shell

start:
	uvicorn app:app --reload --log-level info

deploy:
	zappa deploy production

remove:
	zappa undeploy production --remove-logs
