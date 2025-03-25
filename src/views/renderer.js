/**
 * Processo de renderização
 * Tela Principal 
**/

console.log("Processo de renderização")

// Envio de uma mensagem para o main abrir a janela
function cliente() {
    //console.log("teste do botão cliente")
    //uso da api(autoriada no preload.js)
    api.clientWindow()
}

// Envio de uma mensagem para o main abrir a janela
function os() {
    //console.log("teste do botão os")
    //uso da api(autoriada no preload.js)
    api.osWindow()
}

//Troca do ícone do banco de dados (usando a api do preload.js)
 api.dbStatus((event,message)=> {
    //Teste do recebimento da mensagem
    console.log(message)
    if (message === "conectado") {
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    
    }else{
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
    
}) 
