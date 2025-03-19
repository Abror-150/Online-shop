
const {DataTypes} = require("sequelize")
const {db} = require('../config/db');

const Comment = db.define('Comment', {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    star: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
   
}, {
    timestamps: false,
});

module.exports = Comment;
