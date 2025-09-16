<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1d5UgC1F6o0cGkyaXb6B9X8kYLKjjs2re

## Run Locally

**Prerequisites:**  Node.js and Google Cloud Project

### Setup Google Cloud Vertex AI

1. **Create a Google Cloud Project** (if you don't have one)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Vertex AI API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Vertex AI API" and enable it

3. **Create a Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name like "vertex-ai-service"
   - Grant it the "Vertex AI User" role

4. **Download Service Account Key**
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > "JSON"
   - Download the JSON file

5. **Set Environment Variables**
   - Create a `.env.local` file in the project root
   - Add the following variables:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

### Install and Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```
