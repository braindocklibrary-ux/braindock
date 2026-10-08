/**
 * =========================================================================
 * BRAIN DOCK LIBRARY - GOOGLE DRIVE & GOOGLE SHEETS AUTO-BACKUP SCRIPT
 * =========================================================================
 * 
 * HOW TO ACTIVATE IN 1 MINUTE:
 * 1. Open your browser and go to: https://script.google.com (logged into braindocklibrary@gmail.com)
 * 2. Click "+ New project"
 * 3. Delete any default code, paste ALL of this code into the editor.
 * 4. Click the blue "Deploy" button (top right) -> select "New deployment".
 * 5. Click the gear icon next to "Select type" -> choose "Web app".
 * 6. Set Description: "Brain Dock Auto-Backup Webhook"
 * 7. Set "Execute as": "Me (your email)"
 * 8. Set "Who has access": "Anyone"  <--- (IMPORTANT: Select "Anyone")
 * 9. Click "Deploy" -> click "Authorize access" (if prompted, choose your Google account and click Advanced -> Go to Untitled project).
 * 10. Copy the generated "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 11. Paste that URL in your Owner Portal -> Google Drive Settings, or add to backend .env as GOOGLE_DRIVE_WEBHOOK_URL.
 * 
 * Done! Every time an admission is saved, it will automatically create:
 * 1. A Google Drive Folder: "Brain Dock Library Backups"
 * 2. A Live Google Sheet: "Brain Dock Library - Student Master Register" (Auto-updated)
 * 3. A JSON backup file: "BrainDock_Backup_YYYY-MM-DD.json" inside your Google Drive!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    
    // 1. Get or Create "Brain Dock Library Backups" folder in Google Drive
    var folderName = "Brain Dock Library Backups";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    // 2. Save / Update Full JSON Backup in Google Drive
    if (data.fullData) {
      var dateString = Utilities.formatDate(timestamp, "Asia/Kolkata", "yyyy-MM-dd");
      var fileName = "BrainDock_Backup_" + dateString + ".json";
      
      // Remove older file of same name today if exists to keep updated
      var existingFiles = folder.getFilesByName(fileName);
      while (existingFiles.hasNext()) {
        existingFiles.next().setTrashed(true);
      }
      
      folder.createFile(fileName, JSON.stringify(data.fullData, null, 2), MimeType.PLAIN_TEXT);
    }
    
    // 3. Update Google Sheet "Brain Dock Library - Student Master Register"
    var sheetName = "Brain Dock Library - Student Master Register";
    var files = folder.getFilesByName(sheetName);
    var spreadsheet;
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.open(files.next());
    } else {
      spreadsheet = SpreadsheetApp.create(sheetName);
      var driveFile = DriveApp.getFileById(spreadsheet.getId());
      driveFile.moveTo(folder);
    }
    
    var sheet = spreadsheet.getActiveSheet();
    
    // Create Header Row if empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Event Type",
        "Admission ID",
        "Seat #",
        "Machine PIN",
        "Student Name",
        "Mobile Number",
        "WhatsApp",
        "City",
        "Shift",
        "Plan",
        "Start Date",
        "End Date",
        "Total Fee",
        "Paid Amount",
        "Due Fee",
        "Payment Mode",
        "Receipt #"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3e8ff").setFontColor("#581c87");
      sheet.setFrozenRows(1);
    }
    
    // Append single admission event or iterate all
    if (data.admission) {
      var adm = data.admission;
      var row = [
        Utilities.formatDate(timestamp, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
        data.eventType || "NEW_ADMISSION",
        adm.admissionId || "",
        adm.seatNumber || "",
        adm.biometricEnrollmentId || adm.seatNumber || "",
        adm.studentName || "",
        adm.studentPhone || "",
        adm.whatsAppNumber || adm.studentPhone || "",
        adm.city || "Amreli",
        adm.shift || "Full Day (24x7)",
        adm.plan || "Monthly",
        adm.startDate || "",
        adm.endDate || "",
        adm.totalFee || 0,
        adm.paidAmount || 0,
        adm.pendingFee || 0,
        adm.paymentMode || "Cash",
        adm.receiptNumber || ""
      ];
      sheet.appendRow(row);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Successfully backed up to Google Drive & Google Sheets!",
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ACTIVE",
    service: "Brain Dock Library Google Drive Backup Webhook Engine",
    date: new Date()
  })).setMimeType(ContentService.MimeType.JSON);
}
