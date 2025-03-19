const { Sequelize } = require("sequelize");

const db = new Sequelize("n17", "root", "ikromxon03022005", {
  host: "localhost",
  dialect: "mysql",
});

async function connectedDb() {
  try {
    await db.authenticate();
    console.log("Databasega muvaffaqiyatli ulandi");
    // await db.sync({ force: true });
  } catch (error) {
    console.error("Databasega ulanishda xatolik:", error);
  }
}

module.exports = { connectedDb, db };
