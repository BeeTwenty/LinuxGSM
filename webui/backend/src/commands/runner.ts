import { spawn } from 'child_process';
import path from 'path';

const ALLOWED_ACTIONS = [
  'start', 'stop', 'restart', 'monitor', 'update', 'validate', 'details', 'backup', 'status',
];

export function runLinuxGSMCommand(serverScript: string, action: string): Promise<{ code: number, stdout: string, stderr: string }> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_ACTIONS.includes(action)) {
      return reject(new Error('Action not allowed'));
    }
    const scriptPath = path.resolve(serverScript);
    const proc = spawn(scriptPath, [action], {
      env: process.env,
      cwd: path.dirname(scriptPath),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    proc.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
    proc.on('error', (err) => {
      reject(err);
    });
  });
}
