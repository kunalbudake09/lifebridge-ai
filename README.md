# LifeBridge AI - Emergency Response & Disaster Assistant (India Version)

**LifeBridge AI** is a high-fidelity, interactive emergency dashboard and civic assistance tool designed to help citizens and emergency responders navigate disasters (monsoons, floods, cyclones, and medical accidents). This version is localized for the Indian context—specifically the **Mumbai Metropolitan Region**—and configured for serverless deployment on **Google Cloud Platform (GCP)**.

---

## 🌟 Key Features

* **🚨 Emergency SOS Beacon**: An instant SOS distress broadcast system that simulates active coordinates transmission (`LAT: 19.0760° N, LON: 72.8777° E`) and alerts search & rescue teams.
* **🌪️ Real-Time Cyclone Radar**: Simulated meteorological widget tracking **Cyclone Biparjoy (Category 4)** landfall speed, coordinates, pressure, and warning levels.
* **💬 AI Emergency Assistant**: A smart chatbot with pre-coded offline emergency replies (first aid, road blocks, cyclone safety, kit checklist) and a configuration panel to plug in a live **Google Gemini API Key** directly in the browser.
* **🏠 Shelter Directory**: Searchable list of nearby relief camps—including *NDRF Transit Camp (Bandra)*, *BMC School Camp (Kurla)*, and *Xavier Gymkhana Hall (Marine Drive)*—with filter checklists for pet friendliness, medical aid, and occupancy rates.
* **🗺️ Interactive Safe Route Map**: Visual SVG road map displaying active routes, waterlogged roads (L.B.S. Marg), open highway corridors (Western Express Highway), and dynamic community-reported hazards.
* **🏥 Community Hazard Reporter**: Allows citizens to report local blocks, fallen trees, deep waterlogging, or live downed wires, instantly pinning them on the vector map and updating dashboard counters.
* **❤️ Audio-Visual CPR Guide**: A web-audio synthesizer metronome clicking at **110 BPM** to guide users in pacing chest compressions accurately during cardiac arrest events.
* **🎒 Survival Prep Checklist**: Interactive preparedness kit builder saving checklist items (water, ration kits, Aadhaar card, flashlights) to browser `localStorage` and animating a readiness gauge.
* **📥 Offline Resource Vault**: Generates and downloads virtual text/JSON files (Offline Safety Manuals, Local Shelter Coordinates, Emergency Contacts Cards) to local devices for when telecom towers fail.
* **🌐 Multilingual Accessibility**: Quick UI toggle translating key navigation buttons and headers to **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.

---

## 🛠️ Technology Stack
1. **Frontend**: Pure HTML5 structure, semantic styling with native CSS3 glassmorphism, responsive grid system, and vanilla ES6 JavaScript logic.
2. **GCP Configuration**: `app.yaml` file for static App Engine Standard hosting.
3. **CI/CD**: GitHub Actions deployment script (`.github/workflows/deploy.yml`).

---

## 💻 Running the Project Locally

Since this is a lightweight static application, you can run it locally without installing Node.js dependencies:

1. Clone or download the codebase.
2. Start a simple local server using Python (already available on most systems):
   ```bash
   python -m http.server 8080
   ```
3. Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## ☁️ Deploying to Google Cloud Run

### 1. Manual CLI Deployment
If you have the **Google Cloud SDK** installed, deploy directly from your workspace directory:
```bash
# Log in to Google Cloud
gcloud auth login

# Set active GCP Project ID
gcloud config set project 243071773428

# Deploy app to Cloud Run using source-based build
gcloud run deploy lifebridge-ai --source . --region asia-south1 --allow-unauthenticated
```

---

## 🔄 GitHub Actions CI/CD Workflow

The project includes an automated deployment workflow located in `.github/workflows/deploy.yml`. When you push code changes to the `main` branch, GitHub Actions will automatically deploy the updated assets directly to Google Cloud Run.

### Setup Instructions for CI/CD Workflow:

1. **Create GCP Service Account**:
   - Go to **GCP Console** -> **IAM & Admin** -> **Service Accounts**.
   - Create a service account named `github-actions-deployer`.
   - Grant the following roles:
     - **Cloud Run Admin** (`roles/run.admin`)
     - **Storage Admin** (`roles/storage.admin`)
     - **Service Account User** (`roles/iam.serviceAccountUser`)
     - **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
2. **Create JSON Key**:
   - Click on the created service account, go to the **Keys** tab, and click **Add Key** -> **Create new key** (JSON format).
   - Save the downloaded JSON file.
3. **Configure GitHub Secrets**:
   - Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
   - Add a **New repository secret**:
     - Name: `GCP_SA_KEY`
     - Value: Paste the entire content of the downloaded Service Account JSON key.
4. **Push to Main**:
   - Any commit pushed to the `main` branch will now trigger the Cloud Run deployment pipeline.

