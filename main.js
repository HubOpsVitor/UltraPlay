const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')
const { conectar, desconectar } = require('./database.js')
const mongoose = require('mongoose')
const clientModel = require('./src/models/Clientes.js')
const osModel = require('./src/models/OS.js')
const { jsPDF } = require('jspdf')
require('jspdf-autotable') 
const fs = require('fs')
const prompt = require('electron-prompt')

let win
const createWindow = () => {
    nativeTheme.themeSource = 'light' 
    win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    win.loadFile('./src/views/index.html')
}
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    let about
    if (main) {
        about = new BrowserWindow({
            width: 360,
            height: 220,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: main,
            modal: true
        })
    }
    about.loadFile('./src/views/sobre.html')
}
let client
function clientWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 600,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center() 
}
let os
function osWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        os = new BrowserWindow({
            width: 1010,
            height: 805,
            autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    os.loadFile('./src/views/os.html')
    os.center()
}
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.commandLine.appendSwitch('log-level', '3')
ipcMain.on('db-connect', async (event) => {
    let conectado = await conectar()
    if (conectado) {
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500) 
    }
})
app.on('before-quit', () => {
    desconectar()
})
const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                click: () => clientWindow()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                click: () => app.quit(),
                accelerator: 'Alt+F4'
            }
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            {
                label: 'Clientes',
                click: () => relatorioClientes()
            },
            {
                label: 'OS abertas',
                click: () => relatorioOSPendentes()
            },
            {
                label: 'OS concluídas',
                click: () => relatorioOSFinalizadas()
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            },
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]
ipcMain.on('client-window', () => {
    clientWindow()
})
ipcMain.on('os-window', () => {
    osWindow()
})
ipcMain.on('new-client', async (event, client) => {
    try {
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli,
            emailCliente: client.emailCli,
            foneCliente: client.phoneCli,
            cepCliente: client.cepCli,
            logradouroCliente: client.addressCli,
            numeroCliente: client.numberCli,
            complementoCliente: client.complementCli,
            bairroCliente: client.neighborhoodCli,
            cidadeCliente: client.cityCli,
            ufCliente: client.ufCli
        })
        await newClient.save()
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF já está cadastrado\nVerifique se digitou corretamente",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                }
            })
        }
    }
})
async function relatorioClientes() {
    try {
        const clientes = await clientModel.find().sort({ nomeCliente: 1 });
        const doc = new jsPDF('p', 'mm', 'a4');
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png');
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
        doc.addImage(imageBase64, 'PNG', 5, 8); 
        doc.setFontSize(18);
        doc.text("Relatório de clientes", 14, 45); 
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(12);
        doc.text(`Data: ${dataAtual}`, 165, 10);
        let y = 60;
        doc.text("Nome", 14, y);
        doc.text("Telefone", 95, y);
        doc.text("E-mail", 130, y);
        y += 5;
        doc.setLineWidth(0.5); 
        doc.line(10, y, 200, y); 
        y += 10; 
        clientes.forEach((c) => {
            if (y > 280) {
                doc.addPage();
                y = 20; 
                doc.text("Nome", 14, y);
                doc.text("Telefone", 95, y);
                doc.text("E-mail", 130, y);
                y += 5;
                doc.setLineWidth(0.5);
                doc.line(10, y, 200, y);
                y += 10;
            }
            doc.text(c.nomeCliente || "N/A", 14, y);
            doc.text(c.foneCliente || "N/A", 95, y);
            doc.text(c.emailCliente || "N/A", 130, y);
            y += 10; 
        });
        const paginas = doc.internal.getNumberOfPages();
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' });
        }
        const tempDir = app.getPath('temp');
        const filePath = path.join(tempDir, 'clientes.pdf');
        doc.save(filePath);
        shell.openPath(filePath);
    } catch (error) {
    }
}
ipcMain.on('validate-search', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: "Atenção!",
        message: "Preencha o campo de busca",
        buttons: ['OK']
    })
})
ipcMain.on('search-name', async (event, name) => {
    if (!name) {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Atenção!',
            message: 'Por favor, forneça um nome ou CPF para a busca.',
            buttons: ['OK'],
        });
        return;
    }
    try {
        const dataClient = await clientModel.find({
            $or: [
                { nomeCliente: new RegExp(name, 'i') },
                { cpfCliente: new RegExp(name, 'i') },
            ],
        });
        if (dataClient.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Aviso',
                message: 'Cliente não cadastrado, deseja cadastrar?',
                defaultId: 0,
                buttons: ['Sim', 'Não'],
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('set-client');
                } else {
                    event.reply('reset-form');
                }
            });
        } else {
            event.reply('render-client', JSON.stringify(dataClient));
        }
    } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: 'Ocorreu um erro ao buscar os dados do cliente.',
            buttons: ['OK'],
        });
    }
});
ipcMain.on('delete-client', async (event, id) => { 
    try {
        const { response } = await dialog.showMessageBox(client, {
            type: 'warning',
            title: "Atenção!",
            message: "Deseja excluir este cliente?\nEsta ação não poderá ser desfeita.",
            buttons: ['Cancelar', 'Excluir'] 
        })
        if (response === 1) {
            const delClient = await clientModel.findByIdAndDelete(id)
            event.reply('reset-form')
        }
    } catch (error) {
    }
})
ipcMain.on('update-client', async (event, client) => { 
    try {
        const updateClient = await clientModel.findByIdAndUpdate(
            client.idCli,
            {
                nomeCliente: client.nameCli,
                cpfCliente: client.cpfCli,
                emailCliente: client.emailCli,
                foneCliente: client.phoneCli,
                cepCliente: client.cepCli,
                logradouroCliente: client.addressCli,
                numeroCliente: client.numberCli,
                complementoCliente: client.complementCli,
                bairroCliente: client.neighborhoodCli,
                cidadeCliente: client.cityCli,
                ufCliente: client.ufCli
            },
            {
                new: true
            }
        )
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Dados do cliente alterados com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
    }
})
ipcMain.on('search-clients', async (event) => {
    try {
        const clients = await clientModel.find().sort({ nomeCliente: 1 })
        event.reply('list-clients', JSON.stringify(clients))
    } catch (error) {
    }
})
ipcMain.on('validate-client', (event) => {
    dialog.showMessageBox({
        type: 'warning',
        title: "Aviso!",
        message: "É obrigatório vincular o cliente na Ordem de Serviço",
        buttons: ['OK']
    }).then((result) => {
        if (result.response === 0) {
            event.reply('set-search')
        }
    })
})
ipcMain.on('new-os', async (event, os) => {
    try {
        const newOS = new osModel({
            idCliente: os.idClient_OS,
            statusOS: os.stat_OS,
            computador: os.computer_OS,
            numeroSerie: os.serial_OS,
            problema: os.problem_OS,
            observacao: os.obs_OS,
            tecnico: os.specialist_OS,
            diagnostico: os.diagnosis_OS,
            pecas: os.parts_OS,
            valor: os.total_OS
        })
        await newOS.save()
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "OS gerada com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
    }
})
ipcMain.on('search-os', async (event) => {
    prompt({
        title: 'Buscar OS',
        label: 'Digite o número da OS:',
        inputAttrs: {
            type: 'text'
        },
        type: 'input',
        width: 400,
        height: 200
    }).then(async (result) => {
        if (result !== null) {
            if (mongoose.Types.ObjectId.isValid(result)) {
                try {
                    const dataOS = await osModel.findById(result)
                    if (dataOS && dataOS !== null) { 
                        event.reply('render-os', JSON.stringify(dataOS))
                    } else {
                        dialog.showMessageBox({
                            type: 'warning',
                            title: "Aviso!",
                            message: "OS não encontrada",
                            buttons: ['OK']
                        })
                    }
                } catch (error) {
                }
            } else {
                dialog.showMessageBox({
                    type: 'error',
                    title: "Atenção!",
                    message: "Código da OS inválido.\nVerifique e tente novamente.",
                    buttons: ['OK']
                })
            }
        }
    })
})
ipcMain.on('delete-os', async (event, idOS) => { 
    try {
        const { response } = await dialog.showMessageBox({
            type: 'warning',
            title: "Atenção!",
            message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
            buttons: ['Cancelar', 'Excluir'] 
        })
        if (response === 1) {
            const delOS = await osModel.findByIdAndDelete(idOS)
            event.reply('reset-form')
        }
    } catch (error) {
    }
})
ipcMain.on('update-os', async (event, os) => {
    try {
        const updateOS = await osModel.findByIdAndUpdate(
            os.id_OS,
            {
                idCliente: os.idClient_OS,
                statusOS: os.stat_OS,
                computador: os.computer_OS,
                serie: os.serial_OS,
                problema: os.problem_OS,
                observacao: os.obs_OS,
                tecnico: os.specialist_OS,
                diagnostico: os.diagnosis_OS,
                pecas: os.parts_OS,
                valor: os.total_OS
            },
            {
                new: true
            }
        )
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Dados da OS alterados com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
    }
})
ipcMain.on('print-os', async (event) => {
    prompt({
        title: 'Imprimir OS',
        label: 'Digite o número da OS:',
        inputAttrs: {
            type: 'text'
        },
        type: 'input',
        width: 400,
        height: 200
    }).then(async (result) => {
        if (result !== null) {
            if (mongoose.Types.ObjectId.isValid(result)) {
                try {
                    const dataOS = await osModel.findById(result)
                    if (dataOS && dataOS !== null) {
                        const dataClient = await clientModel.find({
                            _id: dataOS.idCliente
                        })
                        const doc = new jsPDF('p', 'mm', 'a4')
                        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
                        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
                        doc.addImage(imageBase64, 'PNG', 80, 8)
                        doc.setFontSize(12)
                        const dataAtual = new Date().toLocaleDateString('pt-BR')
                        doc.text(`Data: ${dataAtual}`, 165, 10)
                        doc.setFontSize(18)
                        doc.text("Ordem de Serviço:", 25, 45)
                        doc.text(String(dataOS.id), 83, 45)
                        doc.setFontSize(12)
                        const imageMarc = path.join(__dirname, 'src', 'public', 'img', 'marcartela.png')
                        const imageBase1 = fs.readFileSync(imageMarc, { encoding: 'base64' })
                        doc.addImage(imageBase1, 'PNG', 14, 85)
                        dataClient.forEach((c) => {
                            doc.text("Cliente:", 14, 65),
                                doc.text(c.nomeCliente, 29, 65),
                                doc.text("Telefone:", 62, 65),
                                doc.text(c.foneCliente, 80, 65),
                                doc.text("E-mail:", 113, 65),
                                doc.text(c.emailCliente || "N/A", 127, 65),
                                doc.text("Console:", 12, 80),
                                doc.text("Problema:", 62, 80),
                                doc.text("Assinatura:___________________ ", 30, 230),
                                doc.text("CPF:", 120, 230),
                                doc.text(c.cpfCliente, 130, 230)
                        })
                        doc.text(String(dataOS.computador), 29, 80)
                        doc.text(String(dataOS.problema), 81, 80)
                        doc.setFontSize(10)
                        const termo = `
                        Termo de Serviço e Garantia – Assistência Técnica de Celulares
Ao assinar a Ordem de Serviço, o cliente autoriza o reparo e concorda com os termos abaixo:
Diagnóstico: Gratuito apenas se o serviço for aprovado. Caso contrário, pode haver cobrança.
(Art. 421 do Código Civil)
Peças Substituídas: Podem ser descartadas ou devolvidas, se solicitado.
(Art. 740 do Código Civil)
Garantia: 90 dias para serviços e peças, cobrindo apenas o item reparado. Perde validade com mau uso, violação, queda ou oxidação.
(Art. 26, I do CDC)
Perda de Dados: A assistência não se responsabiliza. Recomenda-se backup antes do serviço.
(Art. 6º, III do CDC)
Retirada do Aparelho: Deve ocorrer em até 90 dias após o conserto. Após isso, podem ser cobradas taxas ou ocorrer descarte.
(Art. 1.275, III do Código Civil)
Peças Utilizadas: Compatíveis e de procedência conhecida. Peças originais podem ter custos e prazos diferentes.
(Art. 6º, I do CDC)
Dados Pessoais: Protegidos pela LGPD e usados apenas para fins técnicos e administrativos.
(Lei nº 13.709/2018 – LGPD)`
                        doc.text(termo, 14, 130, { maxWidth: 180 })
                        const tempDir = app.getPath('temp')
                        const filePath = path.join(tempDir, 'os.pdf')
                        doc.save(filePath)
                        shell.openPath(filePath)
                    } else {
                        dialog.showMessageBox({
                            type: 'warning',
                            title: "Aviso!",
                            message: "OS não encontrada",
                            buttons: ['OK']
                        })
                    }
                } catch (error) {
                }
            } else {
                dialog.showMessageBox({
                    type: 'error',
                    title: "Atenção!",
                    message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
                    buttons: ['OK']
                })
            }
        }
    })
})
async function relatorioOSPendentes() {
    try {
        const osPendentes = await osModel.find({ statusOS: { $ne: "Finalizada" } }).sort({ dataEntrada: 1 })
        const doc = new jsPDF('l', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)
        doc.setFontSize(16)
        doc.text("Ordens de serviço pendentes", 14, 45)
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 250, 15)
        const headers = [["Número da OS", "Entrada", "Cliente", "Telefone", "Status", "Equipamento", "Defeito"]]
        const data = []
        for (const os of osPendentes) {
            let nome, telefone
            try {
                const cliente = await clientModel.findById(os.idCliente)
                nome = cliente.nomeCliente
                telefone = cliente.foneCliente
            } catch (error) {
            }
            data.push([
                os._id,
                new Date(os.dataEntrada).toLocaleDateString('pt-BR'),
                nome,
                telefone,
                os.statusOS,
                os.computador,
                os.problema
            ])
        }
        doc.autoTable({
            head: headers,
            body: data,
            startY: 55,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [208, 66, 53] },
        })
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'os-pendentes.pdf')
        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
    }
}
async function relatorioOSFinalizadas() {
    try {
        const osFinalizadas = await osModel.find({ statusOS: "Finalizada" }).sort({ dataEntrada: 1 })
        const doc = new jsPDF('l', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)
        doc.setFontSize(16)
        doc.text("Ordens de serviço finalizadas", 14, 45)
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 250, 15)
        const headers = [[
            "Número da OS", "Entrada", "Cliente", "Equipamento",
            "Técnico", "Diagnóstico", "Peças", "Valor (R$)"
        ]]
        const data = []
        let totalGeral = 0
        for (const os of osFinalizadas) {
            let nomeCliente
            try {
                const cliente = await clientModel.findById(os.idCliente)
                nomeCliente = cliente.nomeCliente
            } catch (error) {
            }
            const valorOS = parseFloat(os.valor) || 0
            totalGeral += valorOS
            data.push([
                os._id.toString(),
                new Date(os.dataEntrada).toLocaleDateString('pt-BR'),
                nomeCliente,
                os.computador,
                os.tecnico,
                os.diagnostico,
                os.pecas || "N/A",
                valorOS.toFixed(2)
            ])
        }
        doc.setFontSize(12)
        doc.setTextColor(0, 100, 0) 
        doc.text(`Total geral: R$ ${totalGeral.toFixed(2)}`, 235, 50)
        doc.setTextColor(0, 0, 0) 
        doc.autoTable({
            head: headers,
            body: data,
            startY: 55,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [208, 66, 53] },
        })
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'os-finalizadas.pdf')
        doc.save(filePath)
        shell.openPath(filePath)
    } catch (error) {
    }
}
ipcMain.on('show-error-box', (event, message) => {
    dialog.showMessageBox({
        type: 'error',
        title: 'Erro',
        message: message,
        buttons: ['OK']
    });
});