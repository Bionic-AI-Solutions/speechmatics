# Google Cloud TTS Setup for Organizations

This guide helps you set up Google Cloud Text-to-Speech when your organization restricts service account key creation.

## 🔐 Authentication Methods

### Method 1: Application Default Credentials (Recommended)

This is the most secure method for organizations:

#### Option A: gcloud CLI Authentication
```bash
# Install gcloud CLI if not already installed
# https://cloud.google.com/sdk/docs/install

# Authenticate with your Google account
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Verify authentication
gcloud auth list
```

#### Option B: Workload Identity (for GKE/Cloud Run)
If running on Google Cloud infrastructure, ADC automatically uses the service account attached to the compute resource.

#### Option C: Metadata Service (for Compute Engine)
If running on Google Compute Engine, ADC automatically uses the service account attached to the VM.

### Method 2: Ask Your Admin for Credentials

If you can't use ADC, ask your Google Cloud admin to:

1. **Create a service account** with Text-to-Speech API permissions
2. **Provide you with**:
   - Project ID
   - Service account email
   - Private key (if allowed by org policy)

3. **Add to your .env.local**:
```bash
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
```

### Method 3: Use Existing Service Account

If your organization already has a service account with TTS permissions:

1. **Ask your admin** for the service account details
2. **Use the credentials** they provide in your .env.local

## 🚀 Quick Setup Steps

### Step 1: Enable TTS API
Ask your admin to enable the Text-to-Speech API in your project, or if you have permissions:

```bash
gcloud services enable texttospeech.googleapis.com
```

### Step 2: Set Up Authentication
Choose one of the methods above and configure your `.env.local` file.

### Step 3: Test the Setup
```bash
# Restart your app
npm run dev

# Test with a Hindi persona
# Select "Priya Sharma (Bank Loan Officer)" and start a conversation
```

## 🔧 Troubleshooting

### Error: "Authentication failed"
- Verify your project has TTS API enabled
- Check that your account has the necessary permissions
- Ensure your authentication method is working

### Error: "Project not found"
- Verify the project ID is correct
- Check that you have access to the project

### Error: "Permission denied"
- Ask your admin to grant you "Text-to-Speech API User" role
- Or ask them to create a service account with TTS permissions

## 📞 Getting Help

If you're still having issues:

1. **Contact your Google Cloud admin** - they can help with:
   - Enabling APIs
   - Creating service accounts
   - Granting permissions
   - Setting up authentication

2. **Check your organization's policies** - they might have specific requirements for:
   - Service account creation
   - API access
   - Authentication methods

3. **Use the fallback** - The app will still work without TTS, just without the enhanced voice features

## 💡 Pro Tips

- **Free Tier**: Google TTS has 1 million characters free per month
- **Security**: ADC is more secure than service account keys
- **Fallback**: The app works without TTS - you'll just get the default Speechmatics voice
- **Testing**: You can test the app functionality before setting up TTS