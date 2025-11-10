@echo off
echo Logging in to AWS ECR...
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 529088255515.dkr.ecr.us-east-1.amazonaws.com

echo Building and pushing frontend image...
docker build -t intervieuai:frontend ./frontend
docker tag intervieuai:frontend 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:frontend
docker push 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:frontend

echo Building and pushing backend image...
docker build -t intervieuai:backend ./backend
docker tag intervieuai:backend 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:backend
docker push 529088255515.dkr.ecr.us-east-1.amazonaws.com/intervieuai:backend

echo Done!
