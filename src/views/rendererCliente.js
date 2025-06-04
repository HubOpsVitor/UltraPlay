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
                btnCreate.disabled = true
                btnUpdate.disabled = false
                btnDelete.disabled = false
            })
        })
    }
}
function excluirCliente() {
    console.log(id.value)
    api.deleteClient(id.value)
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
    } else {
        foco.value = "";
        nameClient.focus();
        nameClient.value = campoBusca;
    }
})
function aplicarMascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, "").slice(0, 11);
    if (cpf.length > 9) {
        campo.value = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    } else if (cpf.length > 6) {
        campo.value = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (cpf.length > 3) {
        campo.value = cpf.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    } else {
        campo.value = cpf;
    }
}
function validarCPF() {
    const campo = document.getElementById('inputCPFClient');
    let cpf = campo.value.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto !== parseInt(cpf[9])) return mostrarErro(campo);
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto !== parseInt(cpf[10])) return mostrarErro(campo);
    campo.style.borderColor = "green";
    campo.style.color = "green";
    return true;
}
function mostrarErro(campo) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
}
const cpfInput = document.getElementById('inputCPFClient');
if (cpfInput) {
    cpfInput.addEventListener("input", () => aplicarMascaraCPF(cpfInput));
    cpfInput.addEventListener("blur", validarCPF);
}
