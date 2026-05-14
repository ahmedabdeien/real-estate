#!/bin/bash
set -e

echo "🚀 Setting up Railway environment variables..."

# Login
railway login

# Link to project (will prompt to select)
railway link

# Set all required variables
railway variables set \
  NODE_ENV="production" \
  JWT_SECRET="bde9cbfd267bc258d20fde87ac4ccf40a7bff6808a8c23aefbfded337d6793ae830b035b919aebcb7b66b9f63792dbe2" \
  ALLOWED_ORIGINS="real-estate-mu-sandy-14.vercel.app,real-estate-ahmeds-projects-1c49758f.vercel.app" \
  MONGO="mongodb+srv://ahmedabdeien:kkzgqLNNFTRaGHrD@new-projects.wj56gx8.mongodb.net/elsarh?retryWrites=true&w=majority&appName=new-projects" \
  FIREBASE_PROJECT_ID="elsarh-real-estate"

echo "✅ Done! Railway will redeploy automatically in ~1 minute."
