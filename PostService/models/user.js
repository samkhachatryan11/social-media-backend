"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Post, {
        foreignKey: "publisher_id",
        as: "posts",
      });

      User.belongsToMany(models.User, {
        through: models.Friend,
        foreignKey: "sender_id",
        otherKey: "receiver_id",
        as: "sentRequests",
      });

      User.belongsToMany(models.User, {
        through: models.Friend,
        foreignKey: "receiver_id",
        otherKey: "sender_id",
        as: "receivedRequests",
      });
    }
  }
  User.init(
    {
      username: DataTypes.INTEGER,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.INTEGER,
      is_email_verified: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
