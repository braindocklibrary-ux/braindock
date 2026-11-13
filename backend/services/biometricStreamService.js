import { store } from '../data/store.js';

// Map of subscribed student identifiers -> Set of active SSE Express response objects
const sseStudentClients = new Map();

/**
 * Register a client response object for real-time punch events
 */
export function registerStudentSse(identifier, res, req) {
  if (!identifier || !res) return;
  const rawId = String(identifier).trim().toLowerCase();
  const cleanDigits = rawId.replace(/\D/g, '');

  const keys = new Set([rawId]);
  if (cleanDigits && cleanDigits.length >= 10) keys.add(cleanDigits.slice(-10));
  if (cleanDigits && cleanDigits.length <= 3) keys.add(cleanDigits);

  // Auto-resolve all student profile aliases (email, phone, seat, GR ID, student name)
  try {
    const profile = store.getStudentByPhoneOrGr(identifier);
    if (profile?.student) {
      const s = profile.student;
      if (s.studentEmail) keys.add(String(s.studentEmail).toLowerCase().trim());
      if (s.parentEmail) keys.add(String(s.parentEmail).toLowerCase().trim());
      if (s.studentPhone) {
        const p = String(s.studentPhone).replace(/\D/g, '');
        if (p.length >= 10) keys.add(p.slice(-10));
      }
      if (s.seatNumber != null) keys.add(String(s.seatNumber).trim());
      if (s.grId) keys.add(String(s.grId).toLowerCase().trim());
      if (s.biometricEnrollmentId != null) keys.add(String(s.biometricEnrollmentId).trim());
      if (s.studentName) keys.add(String(s.studentName).toLowerCase().trim());
    }
  } catch (err) {}

  keys.forEach(k => {
    if (!sseStudentClients.has(k)) {
      sseStudentClients.set(k, new Set());
    }
    sseStudentClients.get(k).add(res);
  });

  const cleanup = () => {
    keys.forEach(k => {
      const set = sseStudentClients.get(k);
      if (set) {
        set.delete(res);
        if (set.size === 0) sseStudentClients.delete(k);
      }
    });
  };

  req.on('close', cleanup);
  req.on('finish', cleanup);
  req.on('error', cleanup);
}

/**
 * Broadcast punch event in less than 50 milliseconds to connected student portal clients
 */
export function broadcastStudentPunchEvent(punchLog) {
  if (!punchLog) return;

  const targetQuery = punchLog.studentEmail || punchLog.studentPhone || punchLog.seatNumber || punchLog.grId;
  let updatedSummary = null;
  if (targetQuery) {
    try {
      updatedSummary = store.getStudentByPhoneOrGr(targetQuery);
    } catch (e) {}
  }

  const payload = JSON.stringify({
    type: 'PUNCH_EVENT',
    log: punchLog,
    summary: updatedSummary ? { success: true, data: updatedSummary } : null,
    timestamp: Date.now()
  });

  const ids = [
    punchLog.studentEmail ? String(punchLog.studentEmail).toLowerCase().trim() : null,
    punchLog.studentPhone ? String(punchLog.studentPhone).replace(/\D/g, '').slice(-10) : null,
    punchLog.seatNumber != null ? String(punchLog.seatNumber).trim() : null,
    punchLog.grId ? String(punchLog.grId).toLowerCase().trim() : null,
    punchLog.studentName ? String(punchLog.studentName).toLowerCase().trim() : null,
    'global_all'
  ].filter(Boolean);

  const delivered = new Set();
  ids.forEach(id => {
    const clients = sseStudentClients.get(id);
    if (clients) {
      clients.forEach(res => {
        if (!delivered.has(res)) {
          delivered.add(res);
          try {
            res.write(`data: ${payload}\n\n`);
          } catch (err) {
            // Socket was closed
          }
        }
      });
    }
  });

  console.log(`[PUNCH_STREAM] ⚡ Instant punch broadcasted to ${delivered.size} real-time client(s) for ${punchLog.studentName || 'Student'} (Seat #${punchLog.seatNumber || 'N/A'})`);
}
