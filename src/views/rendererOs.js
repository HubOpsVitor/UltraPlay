// Capturar o foco na busca pela OS
const foco = document.getElementById('inputSearchClient');

document.addEventListener('DOMContentLoaded', () => {
    foco.focus();
        btnUpdate.disabled = true
        btnDelete.disabled = true
});

// Captura dos dados dos inputs do formulário
let frmOS = document.querySelector('form');
// let txtOs = document.getElementById('txtOs');
// let txtData = document.getElementById('txtData');
// let inputSearchClient = document.getElementById('inputSearchClient');
// let inputNameClient = document.getElementById('inputNameClient');
// let inputPhoneClient = document.getElementById('inputPhoneClient');
// let inputCPFClient = document.getElementById('inputCPFClient');
let statusOS = document.getElementById('inputStatusOS'); 
let equipamento = document.getElementById('inputEquipamento'); 
let modelo = document.getElementById('inputModelo'); 
let numeroSerie = document.getElementById('inputNumeroSerie'); 
let problemaRelatado = document.getElementById('inputProblemaRelatado'); 
let diagnosticoTecnico = document.getElementById('inputDiagnosticoTecnico'); 
let observacoes = document.getElementById('inputObservacoes'); 
let tecnico = document.getElementById('inputTecnico'); 
let valor = document.getElementById('inputValor'); 
  
// Evento de submit para criar ou atualizar OS
frmOS.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log(statusOS.value, equipamento.value, modelo.value, numeroSerie.value, problemaRelatado.value,
        diagnosticoTecnico.value, observacoes.value, tecnico.value, valor.value);

    const ordemServico = {
       // numeroOS: txtOs.value,
        // data: txtData.value,
        // nomeCliente: inputNameClient.value,
        // foneCliente: inputPhoneClient.value,
        //  cpfCliente: inputCPFClient.value,
        statusOS: statusOS.value,
        equipamento: equipamento.value,
        modelo: modelo.value,
        numeroSerie: numeroSerie.value,
        problemaRelatado: problemaRelatado.value,
        diagnosticoTecnico: diagnosticoTecnico.value,
        observacoes: observacoes.value,
        tecnico: tecnico.value,
        valor: valor.value
    };

    api.newOS(ordemServico);
});
