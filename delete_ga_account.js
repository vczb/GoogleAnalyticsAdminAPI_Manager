import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load client credentials and tokens
const CLIENT_SECRETS_PATH = path.join(__dirname, "client_secret.json");

const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf-8"));
const { client_id, client_secret } = credentials.web;

const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf-8"));

// Set up OAuth 2.0 client with saved tokens
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000/oauth2callback"
);

oAuth2Client.setCredentials(tokens);

// Function to delete the Google Analytics account
async function deleteAccount() {
  try {
    const analyticsAdmin = google.analyticsadmin({
      version: "v1beta",
      auth: oAuth2Client,
    });
    const accountId = "accounts/251892362";

    // Delete the account
    await analyticsAdmin.accounts.delete({ name: accountId });
    console.log(`Account ${accountId} has been successfully deleted.`);
  } catch (err) {
    console.error("Error deleting account:", err);
  }
}

// Execute the deletion
deleteAccount();
