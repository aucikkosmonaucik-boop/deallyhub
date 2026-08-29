FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Railway automatically sets PORT
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
