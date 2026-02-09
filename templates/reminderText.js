function hMinus3(name) {
  return `Halo ${name} 👋

Kami mau ngingetin ya,
tagihan kamu akan jatuh tempo *3 hari lagi*.

Mohon disiapkan pembayarannya 🙏
Terima kasih ya 😊`
}

function hMinus1(name) {
  return `Halo ${name} 👋

Kami ingatkan kembali,
tagihan kamu *besok* sudah jatuh tempo.

mohon segera disiapkan 🙏
Terima kasih 😊`
}

function h0(name) {
  return `Halo ${name} 👋

Ini pengingat bahwa *hari ini* adalah
tanggal jatuh tempo tagihan kamu.

Mohon segera dilakukan pembayarannya ya 🙏
Terima kasih 😊`
}

function overdue(name, days) {
  return `Halo ${name} 👋

Kami informasikan bahwa
tagihan kamu *telah lewat ${Math.abs(days)} hari*.

Mohon segera diselesaikan ya 🙏
Jika sudah dibayar, abaikan pesan ini.

Terima kasih 😊`
}

module.exports = {
  hMinus3,
  hMinus1,
  h0,
  overdue
}
