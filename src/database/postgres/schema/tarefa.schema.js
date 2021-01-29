const Sequelize = require('sequelize');

const {
  tarefa: {
    freezeTableName,
    name,
    tableName,
    timestamps
  }
} = require('./names.json');

const schema = {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  idusuario: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  titulo: {
    type: Sequelize.STRING(32),
    allowNull: false,
    defaultValue: 'Nova Tarefa',
  },
  descricao: {
    type: Sequelize.STRING(150),
    allowNull: false
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
  ativo: {
    type: Sequelize.TINYINT,
    allowNull: false,
    defaultValue: 1
  },
  excluido: {
    type: Sequelize.TINYINT,
    allowNull: false,
    defaultValue: 0
  }
}

const options = {
  tableName,
  freezeTableName,
  timestamps
}

module.exports = {
  name,
  schema,
  options
}