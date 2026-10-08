import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import { store } from '../data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_KEY_FILE = path.join(__dirname, '..', 'config', 'google-service-account.json');

let lastBackupStatus = {
  configured: false,
  serviceAccountEmail: null,
  folderId: null,
  lastBackupAt: null,
  lastStatus: 'Not initiated yet',
  error: null
};

/**
 * Get Google Drive API Authenticated Client
 */
export function getDriveClient() {
  try {
    let auth = null;
    let serviceAccountEmail = null;

    // Option 1: Raw JSON string in environment variable (Ideal for Render / Cloud hosting)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      serviceAccountEmail = credentials.client_email;
      auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/drive']
      });
    }
    // Option 2: Individual ENV variables
    else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      serviceAccountEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const formattedKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
      auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/drive']
      });
    }
    // Option 3: Local JSON key file
    else if (fs.existsSync(DEFAULT_KEY_FILE)) {
      const keyFileRaw = fs.readFileSync(DEFAULT_KEY_FILE, 'utf8');
      const credentials = JSON.parse(keyFileRaw);
      serviceAccountEmail = credentials.client_email;
      auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/drive']
      });
    }

    if (!auth) {
      lastBackupStatus.configured = false;
      lastBackupStatus.error = 'Google Service Account credentials not provided in config or ENV.';
      return null;
    }

    lastBackupStatus.configured = true;
    lastBackupStatus.serviceAccountEmail = serviceAccountEmail;
    return google.drive({ version: 'v3', auth });
  } catch (err) {
    lastBackupStatus.configured = false;
    lastBackupStatus.error = err.message;
    console.warn('⚠️ Google Drive API Auth Note:', err.message);
    return null;
  }
}

/**
 * Get / Create the Google Drive Backup Folder
 */
async function getOrCreateBackupFolder(drive) {
  // If specific folder ID provided in ENV
  if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
    lastBackupStatus.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    return process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  try {
    // Search for existing 'Brain Dock Library Backups' folder
    const searchRes = await drive.files.list({
      q: "name = 'Brain Dock Library Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      const folderId = searchRes.data.files[0].id;
      lastBackupStatus.folderId = folderId;
      return folderId;
    }

    // Create folder if not found
    const fileMetadata = {
      name: 'Brain Dock Library Backups',
      mimeType: 'application/vnd.google-apps.folder'
    };
    const folderRes = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });

    const newFolderId = folderRes.data.id;
    lastBackupStatus.folderId = newFolderId;
    console.log(`📁 Created Google Drive Backup Folder: Brain Dock Library Backups (ID: ${newFolderId})`);
    return newFolderId;
  } catch (err) {
    console.error('Error finding/creating Google Drive folder:', err.message);
    return null;
  }
}

/**
 * Generate CSV representation of all Student Admissions
 */
export function generateStudentCsv(admissions = []) {
  const headers = [
    'Admission ID',
    'Receipt No',
    'GR ID',
    'Seat Number',
    'Biometric PIN',
    'Student Name',
    'Mobile Number',
    'WhatsApp Number',
    'Email',
    'Gender',
    'Address',
    'City',
    'PIN Code',
    'Floor',
    'Zone',
    'Shift & Timing',
    'Plan Duration',
    'Start Date',
    'End Date',
    'Days Remaining',
    'Total Fee (INR)',
    'Paid Amount (INR)',
    'Pending Due (INR)',
    'Fee Status',
    'Payment Mode',
    'Transaction Ref',
    'Locker Number',
    'Emergency Contact',
    'ID Proof Type',
    'ID Proof No',
    'Admission Date'
  ];

  const rows = admissions.map(adm => [
    `"${adm.admissionId || ''}"`,
    `"${adm.receiptNumber || ''}"`,
    `"${adm.grId || ''}"`,
    adm.seatNumber || '',
    adm.biometricEnrollmentId || adm.seatNumber || '',
    `"${(adm.studentName || '').replace(/"/g, '""')}"`,
    `"${adm.studentPhone || ''}"`,
    `"${adm.whatsAppNumber || ''}"`,
    `"${adm.studentEmail || ''}"`,
    `"${adm.gender || ''}"`,
    `"${(adm.address || '').replace(/"/g, '""')}"`,
    `"${adm.city || 'Amreli'}"`,
    `"${adm.pinCode || '365601'}"`,
    `"${adm.floor || 'Ground Floor'}"`,
    `"${adm.zone || ''}"`,
    `"${adm.shift || 'Full Day (24x7)'}"`,
    `"${adm.plan || '1 Month(s)'}"`,
    `"${adm.startDate || ''}"`,
    `"${adm.endDate || ''}"`,
    adm.daysRemaining != null ? adm.daysRemaining : 30,
    adm.totalFee || 0,
    adm.paidAmount || 0,
    adm.pendingFee || 0,
    `"${adm.feeStatus || 'Paid'}"`,
    `"${adm.paymentMode || 'Cash'}"`,
    `"${adm.transactionRef || ''}"`,
    `"${adm.lockerNumber || ''}"`,
    `"${adm.emergencyPhone || adm.guardianPhone || ''}"`,
    `"${adm.idProofType || 'Aadhaar Card'}"`,
    `"${adm.idProofNo || adm.aadhaarNo || ''}"`,
    `"${adm.createdAt || new Date().toISOString()}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Upload Full System Backup (JSON + Excel/CSV) to Google Drive
 */
export async function uploadBackupToGoogleDrive() {
  const drive = getDriveClient();
  if (!drive) {
    return {
      success: false,
      message: 'Google Drive API is not configured. Please provide Google Cloud Service Account credentials.'
    };
  }

  try {
    const folderId = await getOrCreateBackupFolder(drive);
    const dateStamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19).replace('T', '_');
    const displayDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1. Gather comprehensive 3-portal database snapshot
    const backupData = {
      version: '1.0',
      libraryName: 'Brain Dock Library',
      exportedAt: new Date().toISOString(),
      indianTime: displayDate,
      admissions: store.admissions || [],
      receipts: store.receipts || [],
      ownerSeats: store.ownerSeats || [],
      biometricLogs: store.biometricLogs || [],
      homepageStats: store.homepageStats,
      homepageFeatures: store.homepageFeatures,
      summary: {
        totalSeats: 102,
        totalAdmissions: (store.admissions || []).length,
        totalReceipts: (store.receipts || []).length,
        totalBiometricLogs: (store.biometricLogs || []).length
      }
    };

    const uploadedFiles = [];

    // 2. Upload JSON Snapshot File
    const jsonFileName = `BrainDock_Full_Backup_${dateStamp}.json`;
    const jsonBuffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf8');
    const jsonStream = new Readable();
    jsonStream.push(jsonBuffer);
    jsonStream.push(null);

    const jsonFileMetadata = {
      name: jsonFileName,
      parents: folderId ? [folderId] : undefined,
      description: `Brain Dock Library Full Database Backup generated on ${displayDate}`
    };

    const jsonMedia = {
      mimeType: 'application/json',
      body: jsonStream
    };

    const jsonUploadRes = await drive.files.create({
      resource: jsonFileMetadata,
      media: jsonMedia,
      fields: 'id, name, webViewLink'
    });

    uploadedFiles.push({
      name: jsonFileName,
      fileId: jsonUploadRes.data.id,
      link: jsonUploadRes.data.webViewLink,
      type: 'JSON (Full System Restore File)'
    });

    // 3. Upload CSV Excel File (Human-readable student database)
    const csvFileName = `BrainDock_Students_Master_${dateStamp}.csv`;
    const csvString = generateStudentCsv(store.admissions || []);
    const csvBuffer = Buffer.from(csvString, 'utf8');
    const csvStream = new Readable();
    csvStream.push(csvBuffer);
    csvStream.push(null);

    const csvFileMetadata = {
      name: csvFileName,
      parents: folderId ? [folderId] : undefined,
      description: `Brain Dock Library Students Master Sheet generated on ${displayDate}`
    };

    const csvMedia = {
      mimeType: 'text/csv',
      body: csvStream
    };

    const csvUploadRes = await drive.files.create({
      resource: csvFileMetadata,
      media: csvMedia,
      fields: 'id, name, webViewLink'
    });

    uploadedFiles.push({
      name: csvFileName,
      fileId: csvUploadRes.data.id,
      link: csvUploadRes.data.webViewLink,
      type: 'CSV (Google Sheets / Excel Format)'
    });

    lastBackupStatus.lastBackupAt = new Date().toISOString();
    lastBackupStatus.lastStatus = `✅ Backup Successful on ${displayDate} (${uploadedFiles.length} files saved)`;
    lastBackupStatus.error = null;

    console.log(`☁️ Google Drive Backup Success: Uploaded ${jsonFileName} & ${csvFileName} to folder ${folderId}`);

    return {
      success: true,
      message: `Google Drive Backup successfully dispatched! Uploaded ${uploadedFiles.length} files to your Google Drive folder.`,
      folderId,
      timestamp: lastBackupStatus.lastBackupAt,
      files: uploadedFiles
    };

  } catch (err) {
    lastBackupStatus.lastStatus = '❌ Backup Failed';
    lastBackupStatus.error = err.message;
    console.error('Google Drive Backup Failed:', err);
    return {
      success: false,
      message: `Google Drive backup error: ${err.message}`
    };
  }
}

/**
 * Get current Google Drive Backup Status
 */
export function getGoogleDriveBackupStatus() {
  const isConfigured = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 
    (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) ||
    fs.existsSync(DEFAULT_KEY_FILE)
  );

  return {
    ...lastBackupStatus,
    configured: isConfigured,
    serviceAccountEmail: lastBackupStatus.serviceAccountEmail || process.env.GOOGLE_CLIENT_EMAIL || null,
    folderId: lastBackupStatus.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || null
  };
}

/**
 * Initialize Automatic Background Drive Backup (Every 12 Hours)
 */
export function initScheduledGoogleDriveBackup() {
  // Run once 30 seconds after server boot if configured
  setTimeout(() => {
    const drive = getDriveClient();
    if (drive) {
      console.log('⏰ Initiating initial automated Google Drive backup check...');
      uploadBackupToGoogleDrive().catch(e => console.warn('Drive background backup note:', e.message));
    } else {
      console.log('💡 Google Drive Backup Service is ready. Add Google Service Account JSON to activate automatic cloud drive sync.');
    }
  }, 30000);

  // Run every 12 hours (12 * 60 * 60 * 1000 = 43,200,000 ms)
  setInterval(() => {
    const drive = getDriveClient();
    if (drive) {
      console.log('⏰ Running scheduled 12-hour Google Drive backup sync...');
      uploadBackupToGoogleDrive().catch(e => console.error('Scheduled Drive Backup error:', e.message));
    }
  }, 12 * 60 * 60 * 1000);
}
