# ###############################################################################
# # terraform/ecr.tf
# ###############################################################################
#
# resource "aws_ecr_repository" "langflow" {
#   name                 = "langflow"
#   image_tag_mutability = "MUTABLE"
#
#   image_scanning_configuration {
#     scan_on_push = true
#   }
# }
#
# # Optionally, you can define a lifecycle policy, encryption, etc.
