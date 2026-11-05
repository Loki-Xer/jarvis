const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const RETRYABLE_STATUS_CODES = new Set([408, 428, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = ["ETIMEDOUT", "ECONNRESET", "ECONNABORTED", "ENOTFOUND", "EAI_AGAIN"];

function isRetryable(error) {
	const statusCode = error?.output?.statusCode || error?.status || error?.code;
	const message = String(error?.message || error);
	return (
		RETRYABLE_STATUS_CODES.has(statusCode) ||
		RETRYABLE_ERROR_CODES.includes(statusCode) ||
		RETRYABLE_ERROR_CODES.some((code) => message.includes(code)) ||
		message.toLowerCase().includes("timed out")
	);
}

async function withTimeout(fn, ms, label = "task") {
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
	});
	try {
		return await Promise.race([fn(), timeout]);
	} finally {
		clearTimeout(timer);
	}
}

async function withRetry(fn, { retries = 3, timeout = 20000, label = "task", baseDelay = 1000 } = {}) {
	let attempt = 0;
	while (true) {
		try {
			return await withTimeout(fn, timeout, label);
		} catch (error) {
			if (attempt >= retries || !isRetryable(error)) throw error;
			attempt++;
			const delay = Math.min(baseDelay * 2 ** attempt, 30000);
			console.error(`[retry] ${label} failed (attempt ${attempt}/${retries}): ${error.message}. Retrying in ${delay}ms`);
			await sleep(delay);
		}
	}
}

module.exports = { withRetry, withTimeout, isRetryable };
