/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/


const { System } = require('../lib/');
const { secondsToHms } = require("./client/"); 

let AFK = {
	isAfk: false,
	reason: false,
	lastseen: 0
};

System({
	on: 'all',
	fromMe: false,
	dontAddCommandList: true
}, async (message, match) => {
	if(message.fromMe) return false;
	if (!AFK.isAfk)  return false;
	if(!message.mention.isBotNumber && !message.quoted && message.isGroup) return false;
	if (message.mention.isBotNumber && message.isGroup) {
   	    return await message.send('```This is a bot. My owner is not here at the moment```\n' +
		              (AFK.reason !== false ? '\n*Reason:* ```' + AFK.reason + '```' : '') +
		    	      (AFK.lastseen !== 0 ? '\n*Last Seen:* ```' + secondsToHms(Math.round((new Date()).getTime() / 1000) - AFK.lastseen) + '```' : ''), {
			      quoted: message.data
			    });
	} else if (message.isGroup && message.reply_message.sender == message.user.jid) {
	    return await message.send('```This is a bot. My owner is not here at the moment```\n' +
			      (AFK.reason !== false ? '\n*Reason:* ```' + AFK.reason + '```' : '') +
			      (AFK.lastseen !== 0 ? '\n*Last Seen:* ```' + secondsToHms(Math.round((new Date()).getTime() / 1000) - AFK.lastseen) + '```' : ''), {
			      quoted: message.data
			   });

	} else if(!message.isGroup) {
	    return await message.send('```This is a bot. My owner is not here at the moment```\n' +
				(AFK.reason !== false ? '\n*Reason:* ```' + AFK.reason + '```' : '') +
				(AFK.lastseen !== 0 ? '\n*Last Seen:* ```' + secondsToHms(Math.round((new Date()).getTime() / 1000) - AFK.lastseen) + '```' : ''), {
				quoted: message.data
			      });
	}
});


System({
	on: 'text',
	fromMe: true,
	dontAddCommandList: true
}, async (message, match) => {
	if(message.sender !== message.user.jid) return;
	if (!AFK.isAfk)  return;
	AFK.lastseen = 0;
	AFK.reason = false;
	AFK.isAfk = false;
	return await message.send('```I am not AFK anymore!```');
});

System({
	pattern: 'afk',
	fromMe: true,
	type: 'misc',
	desc: 'away from keyboard'
}, async (message, match) => {
	if (AFK.isAfk) return;
	AFK.lastseen = Math.round((new Date()).getTime() / 1000);
	if (match !== '') AFK.reason = match;
	AFK.isAfk = true;
	return await message.send(AFK.reason ? '*_Im AFK now!_*\n*Reason:* ' + AFK.reason :  '*_Im AFK now!_*');
});