import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==================================================================");
console.log("🚀 STARTING BRAIN DOCK LIBRARY FULL-STACK ECOSYSTEM");
console.log("==================================================================");

function runProcess(name, cmd, args, cwd, color) {
  const p = spawn(cmd, args, { cwd, shell: true, stdio: 'inherit' });
  p.on('error', (err) => console.error(`[${name}] Error:`, err));
  p.on('close', (code) => console.log(`[${name}] Exited with code ${code}`));
  return p;
}

// 1. Backend (Port 5000)
console.log("📦 [1/3] Booting Backend Server on http://localhost:5000...");
runProcess('BACKEND', 'npm', ['start'], path.join(__dirname, 'backend'));

// 2. User-side Portal (Port 5173)
setTimeout(() => {
  console.log("🌐 [2/3] Launching User & Digital Library Website on http://localhost:5173...");
  runProcess('USER-PORTAL', 'npm', ['run', 'dev'], path.join(__dirname, 'user-side'));
}, 1500);

// 3. Admin Panel (Port 5174)
setTimeout(() => {
  console.log("⚡ [3/3] Launching Admin & ERP Control Panel on http://localhost:5174...");
  runProcess('ADMIN-PANEL', 'npm', ['run', 'dev'], path.join(__dirname, 'admin-panel'));
}, 3000);
