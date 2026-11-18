const { Message } = require("../lib/Base/");  
const { System } = require("../lib/");  

System({
        pattern: "quoted", 
        fromMe: true,
        desc: "To get old quoted", 
        type: "tool",
}, async (m) => {
       if(!m.quoted) return m.reply("_reply to a message_");
      const msg = await m.store.loadMessage(m.jid, m.reply_message.id);
      if(!msg) return m.reply("_message not found from store_");
      const message = new Message(m.client, JSON.parse(JSON.stringify(msg)), m.store, m.prefix);
      if(!message.quoted) return m.client.forwardMessage(m.jid, message, { quoted: m.data });
      return m.client.forwardMessage(m.jid, message.reply_message, { quoted: m.data });
});