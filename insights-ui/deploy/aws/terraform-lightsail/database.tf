# OPTIONAL Lightsail managed Postgres. Enable with create_managed_db=true.
# Default is to use an existing managed DB (pass DATABASE_URL via app_secrets). See plan §11.

resource "random_password" "db" {
  count   = var.create_managed_db ? 1 : 0
  length  = 32
  special = false
}

resource "aws_lightsail_database" "app" {
  count = var.create_managed_db ? 1 : 0

  relational_database_name = "${var.name_prefix}-db"
  availability_zone        = "${var.aws_region}a"
  master_database_name     = "insights_ui_db"
  master_username          = "insights_admin"
  master_password          = random_password.db[0].result

  blueprint_id = var.db_blueprint_id
  bundle_id    = var.db_bundle_id

  # Keep the DB private to the Lightsail network; the container service reaches it over SSL.
  publicly_accessible = false

  backup_retention_enabled = true
  skip_final_snapshot      = false
  final_snapshot_name      = "${var.name_prefix}-db-final"
}
