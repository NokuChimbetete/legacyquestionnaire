import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

// Use environment variables for Firebase Admin SDK credentials (Firebase Hosting/Cloud Functions compatible)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

// List of columns to include in the CSV
const CSV_COLUMNS = [
  "userId",
  "userEmail",
  "sorting_group_0",
  "sorting_group_1",
  "sorting_group_2",
  "sorting_group_3",
  "sorting_group_4",
  "sorting_group_5",
  "sortingCompleted",
  "isCompleted",
  "results",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const snapshot = await db
      .collection("responses")
      .orderBy("startedAt", "desc")
      .get();

    if (snapshot.empty) {
      res.status(200).send("No data found");
      return;
    }

    // Prepare CSV headers
    let csv = CSV_COLUMNS.join(",") + "\n";

    // Add rows
    snapshot.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const row = CSV_COLUMNS.map((col) => {
        let value = data[col];
        // Convert Firestore Timestamp to ISO string
        if (value instanceof admin.firestore.Timestamp) {
          value = value.toDate().toISOString();
        }
        // Convert objects to JSON string for CSV
        if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        }
        // CSV escape for commas and quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        // Always return a string
        if (typeof value === "string") return value;
        if (typeof value === "number" || typeof value === "boolean")
          return String(value);
        return value !== undefined && value !== null ? String(value) : "";
      }).join(",");
      csv += row + "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="responses.csv"',
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exporting data");
  }
}
