function extractDomains(text) {
    const items = text.match(/!?(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}[^\s"'<>,]*/gi) || [];

    return [...new Set(items.map(item => {
        const prefix = item.startsWith("!") ? "!" : "";
        let link = item.replace(/^!/, "");
        if (!/^https?:\/\//i.test(link)) link = "http://" + link;
        try {
            return prefix + new URL(link).hostname.replace(/^www\./, "");
        } catch {
            return null;
        }
    }).filter(Boolean))].join(",");
}

module.exports = { extractDomains };
