const { Sequelize } = require("sequelize");

const db = new Sequelize("online_shop", "root", "abror.08082008", {
  host: "localhost",
  dialect: "mysql",
});

async function connectedDb() {
  try {
    await db.authenticate();
    console.log("Db bonnected...");
    // await db.sync({ force : true });
    console.log("Db synced...");
  } catch (error) {
    console.log("Db connection failed !",error);
  }
}

module.exports = { connectedDb, db };
