terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  required_version = ">= 1.3.0"
}

variable "private_key_path" {
  description = "Path to the private key file for SSH connection"
  type        = string
}

provider "aws" {
  region = "us-east-1"
}

# ---------------------------
# 1️⃣ ECR Repository
# ---------------------------
resource "aws_ecr_repository" "intervieuai" {
  name = "intervieuai"
}

# ---------------------------
# 2️⃣ Build and Push Docker Images
# ---------------------------
resource "null_resource" "build_and_push_images" {
  depends_on = [aws_ecr_repository.intervieuai]

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-Command"]
    command     = "./build_push.bat"
  }
}

# ---------------------------
# 3️⃣ Security Group
# ---------------------------
resource "aws_security_group" "intervieuai_sg" {
  name_prefix = "intervieuai-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --------------------------- 
# 3.5️⃣ IAM Role for EC2
# --------------------------- 
resource "aws_iam_role" "intervieuai_ec2_role" {
  name = "intervieuai-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "intervieuai_ec2_ecr_policy" {
  role       = aws_iam_role.intervieuai_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "intervieuai_ec2_profile" {
  name = "intervieuai-ec2-profile"
  role = aws_iam_role.intervieuai_ec2_role.name
}

# --------------------------- 
# 4️⃣ EC2 Instance (Ubuntu)
# --------------------------- 
resource "aws_instance" "intervieuai_ec2" {
  ami                    = "ami-0ecb62995f68bb549"
  instance_type          = "t2.micro"
  key_name               = "Intervieu_Ai"
  security_groups        = [aws_security_group.intervieuai_sg.name]
  iam_instance_profile   = aws_iam_instance_profile.intervieuai_ec2_profile.name

  root_block_device {
    volume_size = 30  # Increase disk size to 30GB to accommodate Docker images
  }

  depends_on = [null_resource.build_and_push_images]

  provisioner "remote-exec" {
    inline = [
      "set -e",
      "echo '=== Updating and installing Docker ==='",
      "sudo apt-get update -y",
      "sudo apt-get install -y docker.io unzip",
      "echo '=== Installing AWS CLI v2 ==='",
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",
      "sudo systemctl start docker",
      "sudo systemctl enable docker",
      "sudo usermod -aG docker ubuntu",
      "echo '=== Logging into ECR ==='",
      "aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin 529088255515.dkr.ecr.us-east-1.amazonaws.com",
      "echo '=== Pulling and running MongoDB ==='",
      "sudo docker run -d --name mongodb -p 27017:27017 mongo:latest",
      "echo '=== Pulling and running Backend ==='",
      "sudo docker pull 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:backend",
      "sudo docker run -d --name backend -p 5000:5000 --link mongodb:mongodb -e MONGODB_URI=mongodb://mongodb:27017/interviewai -e PORT=5000 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:backend",
      "echo '=== Pulling and running Frontend ==='",
      "sudo docker pull 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:frontend",
      "sudo docker run -d --name frontend -p 80:80 --link backend:backend 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:frontend",
      "echo '=== Setup complete! ==='"
    ]

    connection {
      type        = "ssh"
      host        = self.public_ip
      user        = "ubuntu"
      private_key = file(var.private_key_path)
    }
  }

  tags = {
    Name = "IntervieuAI-Instance"
  }
}

# ---------------------------
# 5️⃣ Wait for EC2 to be reachable
# ---------------------------
resource "null_resource" "wait_for_ec2" {
  depends_on = [aws_instance.intervieuai_ec2]

  provisioner "local-exec" {
    command = <<EOT
      echo "Waiting 60 seconds for EC2 setup to complete..."
      sleep 60
      echo "EC2 setup should now be ready."
    EOT
  }
}

# ---------------------------
# 6️⃣ Output EC2 Public IP
# ---------------------------
output "ec2_public_ip" {
  value = aws_instance.intervieuai_ec2.public_ip
}
