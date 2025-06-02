
function buscarCEP() {
 
    let cep = document.getElementById('inputCEPClient').value

    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            document.getElementById('inputAddressClient').value = dados.logradouro
            document.getElementById('inputNeighborhoodClient').value = dados.bairro
            document.getElementById('inputCityClient').value = dados.localidade
            document.getElementById('inputUFClient').value = dados.uf
        })
        .catch(error => console.log(error))
}


function validarCPF() {

}



let arrayClient = []


const foco = document.getElementById('searchClient')


function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    foco.focus()
})

let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailClient = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let neighborhoodClient = document.getElementById('inputNeighborhoodClient')
let cityClient = document.getElementById('inputCityClient')
let ufClient = document.getElementById('inputUFClient')
let id = document.getElementById('idClient')


function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault() 
        buscarCliente()
    }
}

function restaurarEnter() {
    frmClient.removeEventListener('keydown', teclaEnter)
}

frmClient.addEventListener('keydown', teclaEnter)





frmClient.addEventListener('submit', async (event) => {
    event.preventDefault()
    console.log(nameClient.value, cpfClient.value, emailClient.value, phoneClient.value, cepClient.value, addressClient.value, numberClient.value, complementClient.value, neighborhoodClient.value, cityClient.value, ufClient.value, id.value)
    if (id.value === "") {
        const client = {
            nameCli: nameClient.value,
            cpfCli: cpfClient.value,
            emailCli: emailClient.value,
            phoneCli: phoneClient.value,
            cepCli: cepClient.value,
            addressCli: addressClient.value,
            numberCli: numberClient.value,
            complementCli: complementClient.value,
            neighborhoodCli: neighborhoodClient.value,
            cityCli: cityClient.value,
            ufCli: ufClient.value
        }

        api.newClient(client)
    } else {
     
        const client = {
            idCli: id.value,
            nameCli: nameClient.value,
            cpfCli: cpfClient.value,
            emailCli: emailClient.value,
            phoneCli: phoneClient.value,
            cepCli: cepClient.value,
            addressCli: addressClient.value,
            numberCli: numberClient.value,
            complementCli: complementClient.value,
            neighborhoodCli: neighborhoodClient.value,
            cityCli: cityClient.value,
            ufCli: ufClient.value
        }
        
        api.updateClient(client)
    }
})


function buscarCliente() {

    let name = document.getElementById('searchClient').value
    console.log(name)


    if (name === "") {
        api.validateSearch()
        foco.focus()
    } else {
        api.searchName(name) 
        api.renderClient((event, dataClient) => {
            console.log(dataClient) 
            const dadosCliente = JSON.parse(dataClient)
            arrayClient = dadosCliente
            arrayClient.forEach((c) => {
                id.value = c._id,
                nameClient.value = c.nomeCliente,
                    cpfClient.value = c.cpfCliente,
                    emailClient.value = c.emailCliente,
                    phoneClient.value = c.foneCliente,
                    cepClient.value = c.cepCliente,
                    addressClient.value = c.logradouroCliente,
                    numberClient.value = c.numeroCliente,
                    complementClient.value = c.complementoCliente,
                    neighborhoodClient.value = c.bairroCliente,
                    cityClient.value = c.cidadeCliente,
                    ufClient.value = c.ufCliente
                     // bloqueio do botão adicinar
                     btnCreate.disabled = true
                     // Desbloqueio dos botão ediar e excluir
                     btnUpdate.disabled = false
                     btnDelete.disabled = false
            })
        })
    }


}


function excluirCliente() {
    console.log(id.value) // Passo 1 (receber do form o id)
    api.deleteClient(id.value) // Passo 2 (enviar o id ao main)
}



function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})


api.setClient((args) => {
    let campoBusca = document.getElementById('searchClient').value.trim()

if (/^\d{11}$/.test(campoBusca) || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(campoBusca)) {
    foco.value = "";
    cpfClient.focus();
    cpfClient.value = campoBusca;
}
else {
    foco.value = "";
    nameClient.focus();
    nameClient.value = campoBusca;
}
})