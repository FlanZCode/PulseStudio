import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');

function pad2(n) { return String(n).padStart(2, '0'); }
function parts(d) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const HH = pad2(d.getHours());
  const MM = pad2(d.getMinutes());
  const SS = pad2(d.getSeconds());
  return { yyyy, mm, dd, HH, MM, SS };
}
function formatLineTs(d = new Date()) {
  const { yyyy, mm, dd, HH, MM, SS } = parts(d);
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
}
function startupLogFilename(d) {
  const { yyyy, mm, dd, HH, MM, SS } = parts(d);
  return `${yyyy}-${mm}-${dd}_${HH}-${MM}-${SS}.log`;
}

const START_DATE = new Date();
try { fs.mkdirSync(LOGS_DIR, { recursive: true }); } catch (e) {
  console.error(`Log directory creation failed: ${e?.message || e}`);
}
const LOG_FILE_PATH = path.join(LOGS_DIR, startupLogFilename(START_DATE));
try { fs.writeFileSync(LOG_FILE_PATH, '', { flag: 'a' }); } catch (e) {
  console.error(`Log file preparation failed: ${e?.message || e}`);
}

function appendToFile(line) {
  try {
    fs.appendFileSync(LOG_FILE_PATH, line + '\n', { encoding: 'utf8' });
  } catch (e) {
    console.error(`Log write failed: ${e?.message || e}`);
  }
}

function write(level, message) {
  const ts = formatLineTs();
  const line = `${ts}> ${level}: ${message}`;
  appendToFile(line);
  if (level === 'Critical Error') console.error(line);
  else if (level === 'Warning') console.warn(line);
  else console.log(line);
}

export function criticalError(message) {
  write('Critical Error', message);
  process.exit(1);
}

export function warning(message) {
  write('Warning', message);
}

export function info(message) {
  write('Info', message);
}
