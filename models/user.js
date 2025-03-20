const { DataTypes } = require("sequelize");
const { db } = require("../config/db");
const Region = require("./region");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    regionId: {
      type: DataTypes.INTEGER,
    },
    role: {
      type: DataTypes.ENUM("admin", "user", "super_admin", "seller"),
      defaultValue: "user",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: false }
);

User.belongsTo(Region, { foreignKey: "regionId" });
Region.hasMany(User, { foreignKey: "regionId" });

module.exports = User;
