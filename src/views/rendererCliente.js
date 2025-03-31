// Buscar CEP
function buscarCEP() {
    //console.log("teste do evento blur")
    //armazenar o cep digitado na variável
    let cep = document.getElementById('inputCEPClient').value
    //console.log(cep) //teste de recebimento do CEP
    //"consumir" a API do ViaCEP
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
    //acessando o web service par abter os dados
    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            //extração dos dados
            document.getElementById('inputAddressClient').value = dados.logradouro
            document.getElementById('inputNeighborhoodClient').value = dados.bairro
            document.getElementById('inputCityClient').value = dados.localidade
            document.getElementById('inputUFClient').value = dados.uf
        })
        .catch(error => console.log(error))
}

//capturar o foco na busca pelo nome do cliente
const foco = document.getElementById('searchClient')

document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    //foco na busca do cliente
    foco.focus()
})

// captura dos dados dos inputs do formulario (Passo 1: Fluxo)
let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailClient = document.getElementById('inputEmailClient')
let foneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let logradouroClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let neighborhoodClient = document.getElementById('inputNeighborhoodClient')
let cityClient = document.getElementById('inputCityClient')
let ufClient = document.getElementById('inputUFClient')

//=====================================================
//==========CRUD CREATE/UPDATE=========================

// Evento associado ao botão submit(uso das validações em html)
frmClient.addEventListener('submit', async (event) => {
    //evitar o comportamento padrão do submit que é enviar os dados
    // do formulario e reiniciar o documento html
    event.preventDefault()

    console.log(nameClient.value,cpfClient.value,emailClient.value,foneClient.value,cepClient.value,
        logradouroClient.value,numberClient.value,complementClient.value,neighborhoodClient.value,cityClient.value
    ,ufClient.value)

    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfClient.value,
        emailCli: emailClient.value,
        foneCli: foneClient.value,
        cepCli: cepClient.value,
        logradouroCli: logradouroClient.value,
        numberCli: numberClient.value,
        complementCli: complementClient.value,
        neighborhoodClient: neighborhoodClient.value,
        cityCli: cityClient.value,
        ufClie: ufClient.value
    }

    // Enviar ao main o objeto client- (Passo 2: Fluxo)
    api.newClient(client)
})

// ============================================================
// == Reset form ==============================================
function resetForm() {
    // Limpar os campos e resetar o formulário com as configurações pré definidas
    location.reload()
}

// Recebimento do pedido do main para resetar o form
api.resetForm((args) => {
    resetForm()
})

// == Fim - reset form ========================================
// ============================================================