const Sequelize = require('sequelize');

const {
  item: {
    freezeTableName,
    name,
    tableName,
    timestamps
  }
} = require('./names.json');

const schema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  idtarefa: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  descricao: {
    type: Sequelize.STRING(50),
    allowNull: false,
    defaultValue: 'Novo item'
  },
  concluido: {
    type: Sequelize.SMALLINT,
    allowNull: false,
    defaultValue: 0
  },
  datacriacao: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.DataTypes.NOW
  },
  dataatualizacao: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.DataTypes.NOW
  },
  excluido: {
    type: Sequelize.TINYINT,
    allowNull: false,
    defaultValue: 0
  }
};

const options = {
  tableName,
  freezeTableName,
  timestamps
};

module.exports = {
  name,
  schema,
  options
}
