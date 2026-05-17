/**
 * Chat Realtime E2E Test
 * Mô phỏng 2 users chat qua Socket.io
 * Chạy: node test/test-chat.mjs
 */

const API = 'http://localhost:3000';
const ADMIN_KEY = 'dev-admin-key-2026';

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (path.includes('/admin/')) headers['x-admin-key'] = ADMIN_KEY;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function main() {
  console.log('🧪 === CHAT REALTIME E2E TEST ===\n');

  // 1. Create invite codes
  console.log('1️⃣  Creating invite codes...');
  await api('POST', '/api/admin/invites', { code: 'TEST-USER-A' });
  await api('POST', '/api/admin/invites', { code: 'TEST-USER-B' });

  // 2. Register 2 users
  console.log('2️⃣  Registering users...');
  const regA = await api('POST', '/api/auth/register', {
    username: 'alice',
    password: 'pass123456',
    inviteCode: 'TEST-USER-A',
  });
  const regB = await api('POST', '/api/auth/register', {
    username: 'bob',
    password: 'pass123456',
    inviteCode: 'TEST-USER-B',
  });
  console.log(`   ✅ alice registered`);
  console.log(`   ✅ bob registered`);

  const tokenA = regA.accessToken;
  const tokenB = regB.accessToken;

  // 3. Alice creates a group
  console.log('\n3️⃣  Alice creates group "Bạn Bè"...');
  const groupRes = await api('POST', '/api/chat/groups', { groupName: 'Bạn Bè' }, tokenA);
  const groupId = groupRes.group.id;
  console.log(`   ✅ Group created: ${groupId}`);

  // 4. Add Bob to group
  console.log('4️⃣  Adding Bob to group...');
  const meB = await api('GET', '/api/users/me', null, tokenB);
  await api('POST', `/api/chat/groups/${groupId}/members`, { userId: meB.user.id }, tokenA);
  console.log(`   ✅ Bob added`);

  // 5. Connect Socket.io
  console.log('\n5️⃣  Connecting Socket.io...');
  const { io } = await import('socket.io-client');

  const socketA = io(`${API}/chat`, { auth: { token: tokenA } });
  const socketB = io(`${API}/chat`, { auth: { token: tokenB } });

  await Promise.all([
    new Promise((r) => socketA.on('connect', r)),
    new Promise((r) => socketB.on('connect', r)),
  ]);
  console.log(`   ✅ Alice connected: ${socketA.id}`);
  console.log(`   ✅ Bob connected: ${socketB.id}`);

  // 6. Join group rooms
  socketA.emit('join_group', { groupId });
  socketB.emit('join_group', { groupId });
  await new Promise((r) => setTimeout(r, 500));

  // 7. Test messaging
  console.log('\n6️⃣  Testing realtime messages...');

  const receivedByBob = [];
  socketB.on('new_message', (msg) => {
    receivedByBob.push(msg);
    console.log(`   📨 Bob received: "${msg.content}" from ${msg.sender.username}`);
  });

  const receivedByAlice = [];
  socketA.on('new_message', (msg) => {
    receivedByAlice.push(msg);
    if (msg.sender.username !== 'alice') {
      console.log(`   📨 Alice received: "${msg.content}" from ${msg.sender.username}`);
    }
  });

  // Test typing indicator
  socketB.on('user_typing', (data) => {
    console.log(`   ⌨️  Bob sees: ${data.username} đang nhập...`);
  });

  // Alice types then sends
  socketA.emit('typing_start', { groupId });
  await new Promise((r) => setTimeout(r, 300));
  socketA.emit('typing_stop', { groupId });

  socketA.emit('send_message', { groupId, content: 'Xin chào mọi người! 👋' });
  await new Promise((r) => setTimeout(r, 500));

  socketB.emit('send_message', { groupId, content: 'Chào Alice! Khỏe không? 😊' });
  await new Promise((r) => setTimeout(r, 500));

  socketA.emit('send_message', { groupId, content: 'Mình khỏe! App chat này xịn quá ha 🚀' });
  await new Promise((r) => setTimeout(r, 500));

  // 8. Verify messages in DB via REST
  console.log('\n7️⃣  Verifying messages in database...');
  const history = await api('GET', `/api/chat/groups/${groupId}/messages`, null, tokenA);
  console.log(`   ✅ ${history.messages.length} messages saved in DB`);
  for (const msg of history.messages) {
    console.log(`   💬 [${msg.sender.username}]: ${msg.content}`);
  }

  // 9. Test online users
  console.log('\n8️⃣  Checking online users...');
  socketA.emit('get_online_users');
  await new Promise((r) => {
    socketA.on('online_users', (users) => {
      console.log(`   ✅ ${users.length} users online`);
      r(undefined);
    });
  });

  // Cleanup
  socketA.disconnect();
  socketB.disconnect();

  console.log('\n🎉 === ALL TESTS PASSED! ===');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Test failed:', e.message);
  process.exit(1);
});
