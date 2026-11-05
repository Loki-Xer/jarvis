async function ask(prompt) {
  const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error('ask failed: HTTP ' + res.status);
  return (await res.text()).trim();
}

async function imagine(prompt, width = 768, height = 768) {
  const seed = Math.floor(Math.random() * 1e6);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error('imagine failed: HTTP ' + res.status);
  return Buffer.from(await res.arrayBuffer());
}

module.exports = { ask, imagine };
