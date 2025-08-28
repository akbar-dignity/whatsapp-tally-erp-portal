async function fetchLogs() {
  const res = await fetch('/conversations');
  const data = await res.json();
  document.getElementById('logs').textContent = JSON.stringify(data, null, 2);
}

async function updateRules() {
  const rules = document.getElementById('rulesArea').value;
  try {
    const res = await fetch('/update-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rules
    });
    const data = await res.json();
    document.getElementById('status').textContent = data.message;
  } catch (err) {
    document.getElementById('status').textContent = '❌ Error saving rules';
  }
}

async function loadRules() {
  const res = await fetch('/backend/rules.json');
  const data = await res.json();
  document.getElementById('rulesArea').value = JSON.stringify(data, null, 2);
}

loadRules();
