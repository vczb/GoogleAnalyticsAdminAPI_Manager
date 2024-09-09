import express from "express";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

// Initialize Express server
const app = express();
const port = 3000;

// Load client credentials
const CLIENT_SECRETS_PATH = path.join("./client_secret.json");
const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH, "utf-8"));
const { client_id, client_secret } = credentials.web;

// Set up OAuth 2.0 client
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  `http://localhost:${port}/oauth2callback`
);

function generateAuthUrl() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/analytics.edit"], // Include analytics.edit scope
  });
  console.log("Authorize this app by visiting this URL:", authUrl);
}

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (code) {
    try {
      // Exchange the authorization code for an access token
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      console.log("OAuth 2.0 flow complete. Tokens obtained.");

      // Store the tokens in a temporary file for use by the other script
      fs.writeFileSync("tokens.json", JSON.stringify(tokens));
      res.send("Authentication successful! You can now run the other script.");
    } catch (err) {
      console.error("Error retrieving access token", err);
      res.send("Error during the OAuth process.");
    }
  } else {
    res.send("No authorization code found.");
  }
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);

  // Generate the OAuth URL when the server starts
  generateAuthUrl();
});
