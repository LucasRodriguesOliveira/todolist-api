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
  idTarefa: {
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
  dataCriacao: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.DataTypes.NOW
  },
  dataAtualizacao: {
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