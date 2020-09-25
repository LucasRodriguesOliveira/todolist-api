const Sequelize = require('sequelize');

const {
  usuario: {
    name,
    freezeTableName,
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
  nome: {
    type: Sequelize.STRING(60),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  senha: {
    type: Sequelize.STRING(150),
    allowNull: false,
  },
  dataCriacao: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date()
  },
  dataAtualizacao: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date()
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
};

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