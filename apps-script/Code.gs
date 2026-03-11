const DELEGATE_SHEET_NAME = "Delegate Registrations";
const OC_SHEET_NAME = "Organising Committee Applications";
const DRIVE_FOLDER_ID = "1wTVcRd7ULW7s9_v0-r9TmeRa4SKykEul";
const DELEGATE_HEADERS = [
  "Timestamp",
  "Registration Type",
  "Full Name",
  "Email",
  "Phone",
  "Institution",
  "City",
  "Country",
  "Grade",
  "MUN Experience",
  "Committee Preference 1",
  "Committee Preference 2",
  "Portfolio Preference",
  "Payment Reference",
  "Proof Of Payment URL",
  "Dietary Notes",
  "Medical Notes",
  "Consent",
  "Source",
  "Submitted At",
  "User Agent",
];

const OC_HEADERS = [
  "Timestamp",
  "Registration Type",
  "Full Name",
  "Email",
  "Phone",
  "Institution",
  "Grade",
  "Preferred Team",
  "Relevant Experience",
  "Motivation",
  "Availability",
  "Consent",
  "Source",
  "Submitted At",
  "User Agent",
];

function doGet() {
  return jsonOutput({
    status: "ok",
    message: "Delegate registration endpoint is live.",
  });
}

function doPost(e) {
  try {
    const payload = extractPayload(e);
    const registrationType = String(payload.registrationType || "delegate");

    if (registrationType === "organisingCommittee") {
      validateOrganisingCommitteePayload(payload);
      const ocSheet = getOrCreateSheet_(OC_SHEET_NAME, OC_HEADERS);
      ocSheet.appendRow([
        new Date(),
        "organisingCommittee",
        payload.fullName,
        payload.email,
        payload.phone,
        payload.institution,
        payload.grade,
        payload.preferredTeam,
        payload.relevantExperience,
        payload.motivation,
        payload.availability,
        payload.consent === true,
        payload.source || "website",
        payload.submittedAt || "",
        payload.userAgent || "",
      ]);
    } else {
      validateDelegatePayload(payload);
      const proofUrl = saveProofOfPayment_(payload);
      const delegateSheet = getOrCreateSheet_(DELEGATE_SHEET_NAME, DELEGATE_HEADERS);
      delegateSheet.appendRow([
        new Date(),
        "delegate",
        payload.fullName,
        payload.email,
        payload.phone,
        payload.institution,
        payload.city,
        payload.country,
        payload.grade,
        payload.munExperience,
        payload.committeePreference1,
        payload.committeePreference2 || "",
        payload.portfolioPreference || "",
        payload.paymentReference,
        proofUrl,
        payload.dietaryNotes || "",
        payload.medicalNotes || "",
        payload.consent === true,
        payload.source || "website",
        payload.submittedAt || "",
        payload.userAgent || "",
      ]);
    }

    return jsonOutput({
      status: "success",
      message: "Delegate registration saved successfully.",
    });
  } catch (error) {
    return jsonOutput({
      status: "error",
      message: error.message || "Unexpected server error.",
    });
  }
}

function extractPayload(e) {
  const payloadText = e && e.parameter ? e.parameter.payload : "";
  if (!payloadText) {
    throw new Error("Missing payload.");
  }

  let payload = {};
  try {
    payload = JSON.parse(payloadText);
  } catch (_error) {
    throw new Error("Invalid JSON payload.");
  }

  return payload;
}

function validateDelegatePayload(payload) {
  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "institution",
    "city",
    "country",
    "grade",
    "munExperience",
    "committeePreference1",
    "paymentReference",
    "proofOfPaymentFileName",
    "proofOfPaymentMimeType",
    "proofOfPaymentBase64",
  ];

  requiredFields.forEach(function (field) {
    if (!payload[field] || String(payload[field]).trim() === "") {
      throw new Error("Missing required field: " + field);
    }
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(payload.email))) {
    throw new Error("Invalid email address.");
  }

  if (payload.consent !== true) {
    throw new Error("Consent is required.");
  }

  const mimeType = String(payload.proofOfPaymentMimeType || "").toLowerCase();
  const fileName = String(payload.proofOfPaymentFileName || "").toLowerCase();
  const validMime = mimeType.indexOf("image/") === 0 || mimeType === "application/pdf";
  const validExtension = /\.(jpg|jpeg|png|webp|heic|pdf)$/i.test(fileName);
  if (!validMime && !validExtension) {
    throw new Error("Proof of payment must be an image or PDF file.");
  }
}

function validateOrganisingCommitteePayload(payload) {
  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "institution",
    "grade",
    "preferredTeam",
    "relevantExperience",
    "motivation",
    "availability",
  ];

  requiredFields.forEach(function (field) {
    if (!payload[field] || String(payload[field]).trim() === "") {
      throw new Error("Missing required field: " + field);
    }
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(payload.email))) {
    throw new Error("Invalid email address.");
  }

  if (payload.consent !== true) {
    throw new Error("Consent is required.");
  }
}

function saveProofOfPayment_(payload) {
  if (!DRIVE_FOLDER_ID || DRIVE_FOLDER_ID.includes("PASTE_GOOGLE_DRIVE_FOLDER_ID_HERE")) {
    throw new Error("Server is missing Google Drive folder configuration.");
  }

  let folder;
  try {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (_error) {
    throw new Error("Configured Google Drive folder is invalid.");
  }

  const bytes = Utilities.base64Decode(payload.proofOfPaymentBase64);
  const blob = Utilities.newBlob(bytes, payload.proofOfPaymentMimeType, payload.proofOfPaymentFileName);
  const createdFile = folder.createFile(blob);
  return createdFile.getUrl();
}

function getOrCreateSheet_(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
