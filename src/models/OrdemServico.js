const { model, Schema } = require('mongoose');

// Criação da estrutura da coleção ordem_servicos
const osSchema = new Schema(
  {
    statusOS: {
      type: String,
      enum: ['Aberta', 'Em andamento', 'Aguardando peças', 'Finalizada', 'Cancelada'],
      default: 'Aberta',
    },
    equipamento: {
      type: String,
      required: true,
    },
    numeroSerie: {
      type: String,
      unique: true, // Garantir que o número de série seja único
    },
    problemaRelatado: {
      type: String,
      required: true, // Adicionado para garantir que o problema seja informado
    },
    diagnosticoTecnico: {
      type: String,
      required: true, // Adicionado para garantir que o diagnóstico seja informado
    },
    tecnico: {
      type: String,
      default: 'Técnico não atribuído', // Definido um valor padrão caso não seja informado
    },
    valor: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false, // Não versionar os dados armazenados
    timestamps: true,  // Adicionar timestamps para criar e atualizar as datas
  }
);

// Exportar o modelo do banco de dados
// OBS: "ordem_servicos" será o nome da coleção no MongoDB
module.exports = model('os', osSchema);
