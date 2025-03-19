const {DataTypes} = require("sequelize")
const {db} = require('../config/db');
const User = require("./user");
const Category = require("./category");

const Product = db.define('Product', {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

User.hasMany(Product,{foreignKey:"userId"})
Product.belongsTo(User,{foreignKey:"userId"})

Category.hasMany(Product,{foreignKey:"categoryId"})
Product.belongsTo(Category,{foreignKey:"categoryId"})


module.exports = Product;
