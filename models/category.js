const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const Category = db.define("categoriyalar", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
module.exports = Category;
