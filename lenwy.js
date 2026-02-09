module.exports = async (sock, m) => {
  const msg = m.messages[0]
  if (!msg.message) return

  const from = msg.key.remoteJid
  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    ""

  if (text.toLowerCase() === "ping") {
    await sock.sendMessage(from, {
      text: "pong 🏓\nhalooooo"
    })
  }
}
