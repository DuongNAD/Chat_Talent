const { spawn } = require('child_process');
const p = spawn('npx.cmd', ['tauri', 'signer', 'generate', '-w', 'updater.key'], { cwd: process.cwd() });

p.stdout.on('data', d => {
  console.log(d.toString());
  if (d.toString().toLowerCase().includes('password')) {
    p.stdin.write('\n');
  }
});
p.stderr.on('data', d => {
  console.log(d.toString());
  if (d.toString().toLowerCase().includes('password')) {
    p.stdin.write('\n');
  }
});
p.on('close', code => console.log('Done with code ' + code));
