const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")

const db = require("./db")
const { sendSafe } = require("./rateLimit")

async function startBot() {
  console.log(chalk.blue("🚀 Starting WhatsApp Bot"))

  const { state, saveCreds } = await useMultiFileAuthState("./LenwySesi")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["BillingBot", "Chrome", "1.0.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  // ===== CONNECTION / QR =====
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update

    if (qr) {
      console.log(chalk.yellow("📱 Scan QR WhatsApp"))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
      console.log(chalk.green("✔ WhatsApp Connected"))
    }

    if (connection === "close") {
      console.log(chalk.red("❌ Disconnected, retrying..."))
      setTimeout(startBot, 10_000)
    }
  })

  // ===== REMINDER LOOP (TIAP 1 MENIT) =====
  setInterval(async () => {
    try {
      const [rows] = await db.query(`
        SELECT *,
        DATEDIFF(due_date, CURDATE()) AS diff
        FROM billing
        WHERE status = 'unpaid'
          AND (last_reminder IS NULL OR last_reminder < CURDATE())
      `)

      for (const row of rows) {
        let text = null

        if (row.diff === 3) {
          text = `Halo ${row.client_name},\n\nReminder tagihan *H-3*.\nJatuh tempo: ${row.due_date}`
        }

        if (row.diff === 1) {
          text = `Halo ${row.client_name},\n\nReminder tagihan *H-1*.\nBesok jatuh tempo ya 🙏`
        }

        if (row.diff === 0) {
          text = `Halo ${row.client_name},\n\nTagihan *jatuh tempo hari ini*.\nMohon segera diproses 🙏`
        }

        if (row.diff < 0) {
          text = `Halo ${row.client_name},\n\nTagihan *TELAH TERLAMBAT ${Math.abs(row.diff)} hari*.\nMohon segera diselesaikan 🙏`
        }

        if (!text) continue

        const jid = `${row.phone}@s.whatsapp.net`

        await sendSafe(sock, jid, { text })

        await db.query(
          "UPDATE billing SET last_reminder = CURDATE(), last_reminder_note = ? WHERE client_id = ?",
          [`H${row.diff}`, row.client_id]
        )

        console.log(chalk.green(`📤 Reminder sent to ${row.client_name}`))
      }
    } catch (err) {
      console.error("❌ Reminder error:", err.message)
    }
  }, 60_000) // 1 menit (buat test dulu)

  // ===== MANUAL TEST =====
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    if (text.toLowerCase() === "ping") {
      await sendSafe(sock, from, { text: "pong 🏓 bot aktif" })
    }
  })
}

startBot()
