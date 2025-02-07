###############################################################################
# terraform/ecr.tf
###############################################################################

resource "aws_ecr_repository" "langflow" {
  name                 = "langflow"
  image_tag_mutability = "MUTABLE"
}

# Optionally, you can define a lifecycle policy, encryption, etc.
