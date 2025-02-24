// script.js
document.addEventListener("DOMContentLoaded", function() {
    // Obter a data atual
    const dataAtual = new Date();

    // Formatar a data como "dia de mês de ano"
    const opcoes = {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dataCompleta = dataAtual.toLocaleDateString('pt-BR', opcoes);

    // Inserir a data na tag <span> no HTML
    document.getElementById('dataatual').innerHTML = dataCompleta;

});

