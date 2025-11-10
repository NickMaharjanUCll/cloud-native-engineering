# Use Azure Functions Node.js runtime base image
FROM mcr.microsoft.com/azure-functions/node:4-node20

# Set environment variables required for Azure Functions
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

# Set the working directory inside the container
WORKDIR /home/site/wwwroot

# Install dependencies
COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build
