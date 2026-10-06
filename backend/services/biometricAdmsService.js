import { store } from '../data/store.js';

// Store in-memory recent biometric punches for real-time dashboard
export const recentPunches = [];

// Command Queues for bidirectional device sync
export const fkCommandQueue = [];
export const pendingCommands = [];

/**
 * Format binary command body for EBKN / FK Web Protocol
 * Layout: 4-byte LE length prefix + JSON string + null terminator
 */
function formatCommandBody(bodyValue) {
  if (bodyValue == null) return Buffer.alloc(0);
  const json = Buffer.from(JSON.stringify(bodyValue), 'utf8');
  const prefix = Buffer.alloc(4);
  prefix.writeUInt32LE(json.length, 0);
  return Buffer.concat([prefix, json, Buffer.from([0])]);
}

/**
 * Send EBKN / FK Acknowledgement & Command Response
 */
function sendFkAck(res, transId, { cmdCode = null, body = null } = {}) {
  const payload = body || Buffer.alloc(0);
  const headers = {
    'Content-Type': 'application/octet-stream',
    response_code: 'OK',
    'Content-Length': String(payload.length),
    Connection: 'close',
  };
  if (transId) headers.trans_id = transId;
  if (cmdCode) headers.cmd_code = cmdCode;
  res.writeHead(200, headers);
  res.end(payload);
}

/**
 * Queue a command to push User ID and Name to the physical TimeWatch machine
 */
export function pushUserToDevice({ pin, name }) {
  if (!pin || !name) return false;
  const cleanPin = String(pin).trim();
  const cleanName = String(name).trim().slice(0, 24); // max 24 chars for device LCD

  // 1. Queue EBKN FK Web Protocol command (for TimeWatch Bio-1SE / Realand / Secureye)
  fkCommandQueue.push({
    cmd_code: 'SET_USER_INFO',
    body: {
      user_id: cleanPin,
      user_name: cleanName,
      user_privilege: 'USER'
    }
  });

  // 2. Also queue ZK ADMS command fallback
  const cmdId = Math.floor(100000 + Math.random() * 900000);
  const cmdString = `C:${cmdId}:DATA USER PIN=${cleanPin}\tName=${cleanName}\tPri=0\tPasswd=\tCard=`;
  pendingCommands.push({ id: cmdId, pin: cleanPin, name: cleanName, cmdString, status: 'PENDING' });

  console.log(`[BIOMETRIC SYNC] 🚀 Queued SET_USER_INFO for TimeWatch machine: User ID "${cleanPin}", Name: "${cleanName}"`);
  return true;
}

/**
 * Handle ADMS / iClock Handshake & Options Request
 * GET /iclock/cdata?SN=... or GET /?SN=...
 */
export function handleAdmsHandshake(req, res) {
  const sn = req.query.SN || req.query.sn || 'BIO1SE_DEVICE';
  console.log(`[BIOMETRIC ADMS] Handshake / Options requested from device SN: ${sn}`);

  const responseText = [
    `GET OPTION FROM: ${sn}`,
    'Stamp=0',
    'OpStamp=0',
    'PhotoStamp=0',
    'ErrorDelay=60',
    'Delay=10',
    'TransTimes=00:00;14:05',
    'TransInterval=1',
    'TransFlag=1111000000',
    'TimeZone=330',
    'Realtime=1',
    'Encrypt=0'
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/plain');
  res.send(responseText);
}

/**
 * Handle ADMS Heartbeat / Ping
 * GET /iclock/getrequest?SN=...
 */
export function handleAdmsHeartbeat(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  if (pendingCommands.length > 0) {
    const nextCmd = pendingCommands.shift();
    console.log(`[BIOMETRIC ADMS] 📤 Sending command to TimeWatch machine: ${nextCmd.cmdString}`);
    return res.send(nextCmd.cmdString);
  }
  res.send('OK');
}

/**
 * Extract clean JSON string from hybrid binary/JSON buffer
 */
function extractJsonFromRaw(str) {
  if (!str) return null;
  const start = str.indexOf('{');
  if (start === -1) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; continue; }
    if (inString) {
      if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(str.slice(start, i + 1));
        } catch (e) {
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * Process Attendance Punch Record into Store
 */
function processSinglePunch({ pin, punchTime, verifyType, statusType, sn, ioMode }) {
  if (!pin) return null;

  const cleanPin = String(pin).trim();
  const numPin = Number(cleanPin);
  const normalizedPin = !isNaN(numPin) ? String(numPin) : cleanPin;

  // Find enrolled student in store admissions (active non-vacated first)
  const isStudentMatch = (s) => (
    String(s.biometricEnrollmentId) === cleanPin || 
    String(s.biometricEnrollmentId) === normalizedPin ||
    String(s.seatNumber) === cleanPin || 
    String(s.seatNumber) === normalizedPin ||
    String(s.grId || '').toLowerCase() === `gr-${cleanPin}`.toLowerCase() ||
    String(s.grId || '').toLowerCase() === `gr-${normalizedPin}`.toLowerCase() ||
    String(s.grId || '').toLowerCase() === cleanPin.toLowerCase() ||
    (s.studentPhone && s.studentPhone.replace(/\D/g, '').endsWith(cleanPin)) ||
    (s.studentPhone && s.studentPhone.replace(/\D/g, '').endsWith(normalizedPin))
  );

  let student = (store.admissions || []).find(s => s.status !== 'Vacated' && isStudentMatch(s));
  if (!student) {
    student = (store.admissions || []).find(s => isStudentMatch(s));
  }

  let overridePunchType = null;
  if (statusType) {
    const s = String(statusType).toLowerCase();
    if (s === '1' || s === 'out') overridePunchType = 'OUT';
    else if (s === '0' || s === 'in') overridePunchType = 'IN';
  }

  // Method normalization
  let method = verifyType || 'Fingerprint';
  if (String(method).toLowerCase().includes('face')) method = 'Face Recognition';
  else if (String(method).toLowerCase().includes('card') || String(method).toLowerCase().includes('rfid')) method = 'RFID Card';
  else if (String(method).toLowerCase().includes('finger')) method = 'Fingerprint';

  // Delegate directly to store.processBiometricPunch so smart IN/OUT toggling,
  // duration calculation, and disk persistence are 100% unified
  const punchResult = store.processBiometricPunch({
    grId: student?.grId || (student ? `GR-${String(student.seatNumber).padStart(3, '0')}` : `PIN-${cleanPin}`),
    seatNumber: student?.seatNumber || (!isNaN(numPin) && numPin > 0 && numPin <= 102 ? numPin : null),
    studentPhone: student?.studentPhone || '',
    method,
    overridePunchType
  });

  const record = punchResult.log;
  if (record) {
    if (punchTime) {
      record.timestamp = punchTime;
      const parts = punchTime.split(' ');
      if (parts[0]) record.date = parts[0];
      if (parts[1]) record.time = parts[1];
    }
    record.deviceSn = sn || 'BIO1SE_DEVICE';
    record.receivedAt = new Date().toISOString();
    recentPunches.unshift(record);
    if (recentPunches.length > 200) recentPunches.pop();
  }

  console.log(`[BIOMETRIC ADMS] 🟢 Punch processed: ${record?.studentName || cleanPin} (Seat #${record?.seatNumber || 'N/A'}) -> ${record?.punchType} via ${record?.method} at ${record?.timestamp}`);
  return record;
}

/**
 * Handle Live Attendance Punch Logs (ZK ADMS tab-separated format)
 */
export function handleAdmsAttendancePunch(req, res) {
  const sn = req.query.SN || req.query.sn || 'BIO1SE_DEVICE';
  const table = req.query.table || 'ATTLOG';
  const rawBody = typeof req.body === 'string' ? req.body : (req.body ? JSON.stringify(req.body) : '');

  let processedCount = 0;

  if (rawBody && rawBody.trim().length > 0) {
    const lines = rawBody.split('\n').filter(line => line.trim().length > 0);

    lines.forEach(line => {
      let parts = line.trim().split('\t');
      if (parts.length < 2) parts = line.trim().split(',');
      if (parts.length >= 2) {
        const pin = parts[0].trim();
        const punchTime = parts[1].trim();
        const verifyType = parts[2] ? parts[2].trim() : '1';
        const statusType = parts[3] ? parts[3].trim() : '0';

        const record = processSinglePunch({ pin, punchTime, verifyType, statusType, sn });
        if (record) processedCount++;
      }
    });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.send(`OK: ${processedCount || 1}`);
}

/**
 * Universal ADMS & Device Request Dispatcher
 * Handles GET/POST on root `/` and `/iclock/*`
 */
export function handleAdmsUniversal(req, res) {
  const method = req.method;
  const requestCode = req.headers['request_code'];
  const devId = req.headers['dev_id'] || req.query.SN || req.query.sn || 'BIO1SE_DEVICE';
  const transId = req.headers['trans_id'] || null;
  const rawBody = typeof req.body === 'string' ? req.body : (req.body ? JSON.stringify(req.body) : '');

  // ==========================================================
  // 1. EBKN / FK Web Protocol (TimeWatch Bio-1SE Native Mode)
  // ==========================================================
  if (requestCode) {
    const parsed = extractJsonFromRaw(rawBody);
    console.log(`[FK REQUEST] code="${requestCode}", transId="${transId}", cmd_return_code="${req.headers['cmd_return_code'] || ''}", parsed:`, parsed ? JSON.stringify(parsed).slice(0, 100) : '(none)');

    switch (requestCode) {
      case 'realtime_glog': {
        // Attendance Punch Log
        if (parsed && parsed.user_id && parsed.io_time) {
          const pin = String(parsed.user_id).trim();
          let punchTime = parsed.io_time;
          if (punchTime.length >= 14) {
            const y = punchTime.slice(0, 4);
            const m = punchTime.slice(4, 6);
            const d = punchTime.slice(6, 8);
            const hh = punchTime.slice(8, 10);
            const mm = punchTime.slice(10, 12);
            const ss = punchTime.slice(12, 14);
            punchTime = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
          }
          // Detect verification method accurately from io_mode, backup_number, and payload
          let verifyMethod = 'Fingerprint';
          const ioNum = Number(parsed.io_mode);
          const lowByte = !isNaN(ioNum) ? (ioNum & 0xff) : 0;
          const verifyStr = String(parsed.verify_mode || parsed.verify_type || '').toLowerCase();
          const backupNum = parsed.backup_number != null ? Number(parsed.backup_number) : null;

          if (backupNum != null && backupNum >= 10 && backupNum <= 14) {
            verifyMethod = 'Face Recognition';
          } else if (backupNum === 16 || backupNum === 2) {
            verifyMethod = 'RFID Card';
          } else if (lowByte === 2 || lowByte === 3 || verifyStr.includes('card') || verifyStr.includes('rfid')) {
            verifyMethod = 'RFID Card';
          } else if (lowByte === 20 || lowByte === 15 || lowByte === 12 || lowByte === 14 || verifyStr.includes('face')) {
            verifyMethod = 'Face Recognition';
          } else if (lowByte === 9 || lowByte === 1 || verifyStr.includes('finger')) {
            verifyMethod = 'Fingerprint';
          } else if (parsed.method) {
            verifyMethod = parsed.method;
          }

          processSinglePunch({ 
            pin, 
            punchTime, 
            verifyType: verifyMethod, 
            statusType: parsed.status_type || null, 
            sn: devId,
            ioMode: parsed.io_mode 
          });
        }
        return sendFkAck(res, transId);
      }

      case 'realtime_enroll_data': {
        // Device report of existing user on machine
        if (parsed?.user_name) {
          console.log(`[FK PROTOCOL] 👤 User on machine: ID "${parsed.user_id}", Name: "${parsed.user_name}"`);
        }
        return sendFkAck(res, transId);
      }

      case 'receive_cmd': {
        // Device is polling for work every ~3s
        const queued = fkCommandQueue.shift();
        if (queued) {
          console.log(`[FK PROTOCOL] 📤 INJECTING COMMAND TO DEVICE: ${queued.cmd_code} ->`, JSON.stringify(queued.body));
          return sendFkAck(res, `cmd${Date.now()}`, {
            cmdCode: queued.cmd_code,
            body: formatCommandBody(queued.body ?? null),
          });
        }
        // Empty ACK = No pending command, keep polling
        return sendFkAck(res, transId);
      }

      case 'send_cmd_result': {
        console.log(`[FK PROTOCOL] 🎉 Command execution result from device: trans_id=${transId}, code=${req.headers['cmd_return_code']}`);
        return sendFkAck(res, transId);
      }

      default:
        return sendFkAck(res, transId);
    }
  }

  // ==========================================================
  // 2. Standard ZK / ADMS iClock Fallback
  // ==========================================================
  const fkJson = extractJsonFromRaw(rawBody);
  if (fkJson && fkJson.user_id && fkJson.io_time) {
    const pin = String(fkJson.user_id).trim();
    let punchTime = fkJson.io_time;
    if (punchTime.length >= 14) {
      const y = punchTime.slice(0, 4);
      const m = punchTime.slice(4, 6);
      const d = punchTime.slice(6, 8);
      const hh = punchTime.slice(8, 10);
      const mm = punchTime.slice(10, 12);
      const ss = punchTime.slice(12, 14);
      punchTime = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    }
    processSinglePunch({ pin, punchTime, verifyType: '1', statusType: '0', sn: devId });
    return sendFkAck(res, transId);
  }

  if (req.query.table === 'ATTLOG' || rawBody.includes('\t')) {
    return handleAdmsAttendancePunch(req, res);
  }

  if (method === 'GET') {
    if (req.url.includes('getrequest')) {
      return handleAdmsHeartbeat(req, res);
    }
    return handleAdmsHandshake(req, res);
  }

  return sendFkAck(res, transId);
}
