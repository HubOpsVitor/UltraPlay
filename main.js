console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const mongoose = require('mongoose')

const clientModel = require('./src/models/Clientes.js')

const osModel = require('./src/models/OS.js')

const { jspdf, default: jsPDF } = require('jspdf')

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
                label: 'OS',
                click: () => osWindow()
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
                label: 'OS abertas'
            },
            {
                label: 'OS concluídas'
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
            }
            
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
    
    console.log(client)
    
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
        console.log(error)
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
        console.log(error);
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
    console.log('Iniciando busca por:', name);

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

        console.log('Dados encontrados:', dataClient);

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
    console.log(id) 
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
        console.log(error)
    }
})








ipcMain.on('update-client', async (event, client) => {
    console.log(client) 
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
        console.log(error)
    }
})














ipcMain.on('search-clients', async (event) => {
    try {
        const clients = await clientModel.find().sort({ nomeCliente: 1 })
        
        event.reply('list-clients', JSON.stringify(clients))
    } catch (error) {
        console.log(error)
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
    
    console.log(os)
    
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
        console.log(error)
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
                        console.log(dataOS) 
                        
                        
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
                    console.log(error)
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
                        doc.addImage(imageBase64, 'PNG', 5, 8)


                        doc.setFontSize(14)
                        doc.text("OS:", 14, 45)

                        doc.setLineWidth(0.1)
                        doc.line(10, 50, 200, 50)

                        doc.setFontSize(12)
                        dataClient.forEach((c) => {
                            doc.text("Cliente:", 14, 60)
                            doc.text(c.nomeCliente, 40, 60)
                            doc.text(c.foneCliente, 100, 60)
                            doc.text(c.emailCliente || "N/A", 150, 60)
                        })

                        doc.setFontSize(12)
                        doc.text(String(dataOS.computador), 14, 70)
                        doc.text(String(dataOS.problema), 100, 70)

                        doc.line(10, 75, 200, 75)

                        doc.setFontSize(10)
                        const termo = `
Termo de Serviço e Garantia

O cliente autoriza a realização dos serviços técnicos descritos nesta ordem, ciente de que:
- Diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso contrário, poderá ser cobrada taxa de análise.
- Peças substituídas poderão ser retidas para descarte ou devolvidas mediante solicitação no ato do serviço.
- A garantia dos serviços prestados é de 90 dias, conforme Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o reparo executado ou peça trocada, desde que o equipamento não tenha sido violado por terceiros.
- Não nos responsabilizamos por dados armazenados. Recomenda-se o backup prévio.
- Equipamentos não retirados em até 90 dias após a conclusão estarão sujeitos a cobrança de armazenagem ou descarte, conforme Art. 1.275 do Código Civil.
- O cliente declara estar ciente e de acordo com os termos acima.`

                        doc.text(termo, 14, 85, { maxWidth: 180 })

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
                    console.log(error)
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



