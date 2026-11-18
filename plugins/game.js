const { System, isPrivate } = require("../lib/");
const { onCommand, onText } = require("../lib/tictactoe");

System({
  pattern: "ttt",
  fromMe: isPrivate,
  type: "game",
  desc: "Tic-Tac-Toe: play with a friend or the bot (group & DM)",
}, async (m, match) => onCommand(m, match));

System({
  on: "text",
  fromMe: false,
  dontAddCommandList: true,
}, async (m) => {
  await onText(m);
  return undefined;
});