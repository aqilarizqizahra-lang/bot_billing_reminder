const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")

const { sendSafe } = require("./rateLimit")

// MODE QR
const usePairingCode = false

async function connectToWhatsApp() {
  console.log(chalk.blue("🚀 Memulai koneksi WhatsApp..."))

  const { state, saveCreds } = await useMultiFileAuthState("./LenwySesi")

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Lenwy Bot", "Chrome", "1.0.0"]
  })

  // SIMPAN SESSION
  sock.ev.on("creds.update", saveCreds)

  // HANDLE QR & STATUS
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update

    if (qr && !usePairingCode) {
      console.log(chalk.yellow("📱 Scan QR di WhatsApp"))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "open") {
      console.log(chalk.green("✔ Bot berhasil terhubung ke WhatsApp"))
    }

    if (connection === "close") {
      console.log(chalk.red("❌ Koneksi terputus, reconnect otomatis"))
    }
  })

  // TERIMA PESAN MASUK (TANPA TEMPLATE / DB)
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""

    console.log(
      chalk.yellow("[ WhatsApp ]"),
      chalk.cyan(from),
      ":",
      chalk.white(text)
    )

    // TEST BASIC SAJA
    if (text.toLowerCase() === "ping") {
      await sendSafe(sock, from, {
        text: "pong 🏓\nTest, haloo"
      })
    }
  })
}

connectToWhatsApp()
