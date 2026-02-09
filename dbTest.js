const mysql = require("mysql2/promise")

async function testDB() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "botreminder"
    })

    console.log("✅ Database CONNECTED")

    const [rows] = await db.query(`
      SELECT 
        name,
        phone,
        status,
        due_date,
        DATEDIFF(due_date, CURDATE()) AS selisih_hari
      FROM billing
    `)

    console.table(rows)

    await db.end()
  } catch (err) {
    console.error("❌ DB ERROR:", err.message)
  }
}

testDB()
