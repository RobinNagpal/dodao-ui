create-migration:
	yarn prisma migrate dev --create-only

restore-db:
	docker exec -it insights-ui-db psql -U admin -d insights_ui_db -c "CREATE ROLE postgres WITH LOGIN SUPERUSER;"
	docker exec -i insights-ui-db psql -U admin -d insights_ui_db --set ON_ERROR_STOP=on < "/Users/robintc/Desktop/v2_api_prod-2025_10_17_18_12_20-dump.sql"

dump-from-local:
	docker exec -e PGPASSWORD=admin insights-ui-db \
      pg_dump -U admin -d insights_ui_db \
      > "/Users/robintc/Desktop/insights_ui_db-$(date +%F_%H%M%S).sql"
