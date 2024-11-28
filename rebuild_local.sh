#!/bin/bash

# Function to print an info block
print_info() {
    local msg="$1"
    local border_char="#"
    local color="\033[1;34m"    # Blue text color
    local reset="\033[0m"       # Reset color
    local width=60              # Width of the info block

    # Calculate padding
    local padding=$(( (width - ${#msg} - 2) / 2 ))
    local padded_msg=$(printf "%*s%s%*s" $padding "" "$msg" $padding "")

    # Print the info block
    echo "${color}"
    printf "%${width}s\n" | tr " " "$border_char"
    echo  "${border_char}${padded_msg}${border_char}"
    printf "%${width}s\n" | tr " " "$border_char"
    echo "${reset}"
}


#swap config
print_info "Swapping Config"
mv .env.local .env.local.bak
mv .env.prd .env.local

# npm build
print_info "Building React App"
npm install
npm run build

# build it
print_info "Building Docker Image"
docker-compose build

#swap config
print_info "Swapping Config"
mv .env.local .env.prd
mv .env.local.bak .env.local


#  login to docker on aws
print_info "Logging into AWS ECR"
aws --profile venture ecr get-login-password | docker login --username AWS --password-stdin 920373001884.dkr.ecr.us-east-1.amazonaws.com

# tag it
print_info "Tagging Docker Image"
docker tag venture-web:latest 920373001884.dkr.ecr.us-east-1.amazonaws.com/venture/venture-ui:prod

print_info "Pushing Docker Image"
docker push 920373001884.dkr.ecr.us-east-1.amazonaws.com/venture/venture-ui:prod

print_info "Deploying to EC2"
ssh -i  ~/Documents/AWS/Keys/venture-prod.pem ubuntu@18.215.179.243 'bash /home/ubuntu/build.sh'