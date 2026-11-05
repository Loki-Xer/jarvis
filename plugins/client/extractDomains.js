function extractDomains(text) {
    const urls = text.match(/!?https?:\/\/[^\s"'<>]+/gi) || [];

    return [...new Set(urls.map(url => {
        const prefix = url.startsWith("!") ? "!" : "";
        const link = url.replace(/^!/, "");

        try {
            return prefix + new URL(link).hostname;
        } catch {
            return null;
        }
    }).filter(Boolean))].join(", ");
}

module.exports = { extractDomains };
