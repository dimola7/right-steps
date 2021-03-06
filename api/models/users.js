/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'firstname': {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "null"
    },
    'lastname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'username': {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "null",
      unique: true
    },
    'email_address': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'password': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'passport': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'role_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null",
      references: {
        model: 'role',
        key: 'role_id'
      }
    },
    'phone_no': {
      type: DataTypes.STRING(11),
      allowNull: false,
      comment: "null"
    },
    'status': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "(1=>active,0=>inactive)"
    },
    'date_created': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "null"
    },
    'last_login_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'last_update': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'gender': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'country': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'state': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'dob': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "null"
    },
    'token': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'isCompleted': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0',
      comment: "null"
    }
  }, {
    tableName: 'users'
  });
};
