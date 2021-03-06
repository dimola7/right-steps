/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('stage_4', {
      'stage_4_id': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        primaryKey: true,
        comment: "null",
        autoIncrement: true
      },
      'member_id': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "null",
        references: {
            model: 'members',
            key: 'member_id'
          }
      },
      'user_id': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "null",
        references: {
          model: 'users',
          key: 'user_id'
        }
      },
      'upline_id': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "null"
      },
      'parentId': {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        comment: "null"
      },
      'current_stage': {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        comment: "null"
      }
    }, {
      tableName: 'stage_4'
    });
  };
  