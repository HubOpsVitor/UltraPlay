console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

// Esta linha está relacionada ao preload.js
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clientModel = require('./src/models/Clientes.js')
const osModel = require('../UltraPlay/src/models/OrdemServico.js')


// Importação do pacote jspdf (npm i jspdf)
const { jspdf, default: jsPDF } = require('jspdf')

// Importação da biblioteca FS (nativa do JavaScript) para manipulação de arquivos (no caso arquvios pdf)
const fs = require('fs')


// Janela principal
let win
const createWindow = () => {
    // a linha abaixo define o tema (claro ou escuro)
    nativeTheme.themeSource = 'light' //(dark ou light)
    win = new BrowserWindow({
        width: 800,
        height: 600,
        //autoHideMenuBar: true,
        //minimizable: false,
        resizable: false,
        //ativação do preload.js
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')
}

// Janela sobre
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    // a linha abaixo obtém a janela principal
    const main = BrowserWindow.getFocusedWindow()
    let about
    // Estabelecer uma relação hierárquica entre janelas
    if (main) {
        // Criar a janela sobre
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
    //carregar o documento html na janela
    about.loadFile('./src/views/sobre.html')
}

// Janela cliente
let client
function clientWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 680,
            //autoHideMenuBar: true,
            //resizable: false,
            parent: main,
            modal: true,
            //ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center() //iniciar no centro da tela   
}

// Janela OS
let os;

function osWindow() {
    nativeTheme.themeSource = 'light'; // Configura o tema para 'light'

    const main = BrowserWindow.getFocusedWindow();

    if (main) {
        os = new BrowserWindow({
            width: 1010,
            height: 720,
            // autoHideMenuBar: true,
            resizable: false,
            parent: main,
            // Ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            },
            modal: true // Corrigido: a vírgula foi movida para o lugar certo
        });
    }

    os.loadFile('./src/views/os.html');
    os.center();
}


// Iniciar a aplicação
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

// reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados (pedido direto do preload.js)
ipcMain.on('db-connect', async (event) => {
    let conectado = await conectar()
    // se conectado for igual a true
    if (conectado) {
        // enviar uma mensagem para o renderizador trocar o ícone, criar um delay de 0.5s para sincronizar a nuvem
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500) //500ms        
    }
})

// IMPORTANTE ! Desconectar do banco de dados quando a aplicação for encerrada.
app.on('before-quit', () => {
    desconectar()
})

// template do menu
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
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do desenvolvedor',
                role: 'toggleDevTools'
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

// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on('client-window', () => {
    clientWindow()
})

ipcMain.on('os-window', () => {
    osWindow()
})

// ============================================================
// == Clientes - CRUD Create
// recebimento do objeto que contem os dados do cliente
ipcMain.on('new-client', async (event, client) => {
    // Importante! Teste de recebimento dos dados do cliente
    console.log(client)
    // Cadastrar a estrutura de dados no banco de dados MongoDB
    try {
        // criar uma nova de estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados Clientes.js e os valores são definidos pelo conteúdo do objeto cliente
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli,
            emailCliente: client.emailCli,
            foneCliente: client.foneCli,
            cepCliente: client.cepCli,
            logradouroCliente: client.addressCli,
            numeroCliente: client.numberCli,
            complementoCliente: client.complementCli,
            bairroCliente: client.neighborhoodCli,
            cidadeCliente: client.cityCli,
            ufCliente: client.ufCli
        })
        // salvar os dados do cliente no banco de dados
        await newClient.save()
        // Mensagem de confirmação
        dialog.showMessageBox({
            //customização
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            //ação ao pressionar o botão (result = 0)
            if (result.response === 0) {
                //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
                event.reply('reset-form')
            }
        })
    } catch (error) {
        // se o código de erro for 11000 (cpf duplicado) enviar uma mensagem ao usuário
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF já está cadastrado\nVerifique se digitou corretamente",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    // limpar a caixa de input do cpf, focar esta caixa e deixar a borda em vermelho
                }
            })
        }
        console.log(error)
    }
})

// == Fim - Clientes - CRUD Create
// ============================================================


// ============================================================
// == OS - CRUD Create
// recebimento do objeto que contém os dados da ordem de serviço
ipcMain.on('new-os', async (event, osData) => {
    // Importante! Teste de recebimento dos dados da ordem de serviço
    console.log(osData)

    // Cadastrar a estrutura de dados no banco de dados MongoDB
    try {
        // Criar uma nova estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados OrdensDeServico.js e os valores são definidos pelo conteúdo do objeto osData
        const newOS = new osModel({
            statusOS: osData.statusOS,
            equipamento: osData.equipamento,
            numeroSerie: osData.numeroSerie,
            problemaRelatado: osData.problemaRelatado,
            diagnosticoTecnico: osData.diagnosticoTecnico,
            observacoes: osData.observacoes,
            tecnico: osData.tecnico,
            valor: osData.valor
        })

        // Salvar os dados da ordem de serviço no banco de dados
        await newOS.save()

        // Mensagem de confirmação
        dialog.showMessageBox({
            // Customização
            type: 'info',
            title: "Aviso",
            message: "Ordem de serviço criada com sucesso",
            buttons: ['OK']
        }).then((result) => {
            // Ação ao pressionar o botão (result = 0)
            if (result.response === 0) {
                // Enviar um pedido para o renderizador limpar os campos e resetar as configurações pré-definidas (rótulo 'reset-form' do preload.js)
                event.reply('reset-form')
            }
        })
    } catch (error) {
        // Se ocorrer algum erro (ex: validação de dados ou problemas no banco)
        console.log(error)

        // Caso o erro seja de dados duplicados (por exemplo, número de série já cadastrado), exibir a mensagem ao usuário
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "Número de Série já está cadastrado\nVerifique se digitou corretamente",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    // Limpar o campo de número de série, focar neste campo e destacar a borda em vermelho
                }
            })
        }
    }
})

// == Fim - OS - CRUD Create
// ============================================================


// ==========================================================
// ===== Relatório de Clientes ==============================

async function relatorioClientes() {
    try {
        // Passo 1: Consultar o banco de dados e obter a listagem de clientes cadastrados por ordem alfabética
        const clientes = await clientModel.find().sort({ nomeCliente: 1 });
        // teste de recebimento da listagem de clientes
        //console.log(clientes);

        // Passo 2: Formatação do documento pdf
        // p - portrait | l - landscape | mm e a4 (folha A4 (210x297mm))
        const doc = new jsPDF('p', 'mm', 'a4');

        // Inserir imagem no documento pdf
        // imagePath (caminho da imagem que será inserida no pdf)
        // imageBase64 (uso da biblioteca fs par ler o arquivo no formato png)
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png');
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
        doc.addImage(imageBase64, 'PNG', 5, 8); //(5mm, 8mm x,y)

        // Definir o tamanho da fonte (tamanho equivalente ao word)
        doc.setFontSize(18);

        // Escrever um texto (título)
        doc.text("Relatório de clientes", 14, 45); // x, y (mm)

        // Inserir a data atual no relatório
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        doc.setFontSize(12);
        doc.text(`Data: ${dataAtual}`, 165, 10);

        // Variável de apoio na formatação
        let y = 60;
        doc.text("Nome", 14, y);
        doc.text("Telefone", 95, y);
        doc.text("E-mail", 130, y);

        y += 5;

        // Desenhar uma linha
        doc.setLineWidth(0.5); // espessura da linha
        doc.line(10, y, 200, y); // 10 (inicio) ---- 200 (fim)

        // Renderizar os clientes cadastrados no banco
        y += 10; // espaçamento da linha

        // Percorrer o vetor clientes (obtido do banco) usando o laço forEach (equivale ao laço for)
        clientes.forEach((c) => {
            // Adicionar outra página se a folha inteira for preenchida (estratégia é saber o tamanho da folha)
            if (y > 280) {
                doc.addPage();
                y = 20; // resetar a variável y

                // Redesenhar o cabeçalho
                doc.text("Nome", 14, y);
                doc.text("Telefone", 95, y);
                doc.text("E-mail", 130, y);
                y += 5;
                doc.setLineWidth(0.5);
                doc.line(10, y, 200, y);
                y += 10;
            }

            // Garantir que os dados são válidos antes de passar para o método doc.text()
            doc.text(c.nomeCliente || "N/A", 14, y);
            doc.text(c.foneCliente || "N/A", 95, y);
            doc.text(c.emailCliente || "N/A", 130, y);

            y += 10; // quebra de linha
        });

        // Adicionar numeração automática de páginas
        const paginas = doc.internal.getNumberOfPages();
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' });
        }

        // Definir o caminho do arquivo temporário e nome do arquivo
        const tempDir = app.getPath('temp');
        const filePath = path.join(tempDir, 'clientes.pdf');

        // Salvar temporariamente o arquivo
        doc.save(filePath);

        // Abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
        shell.openPath(filePath);
    } catch (error) {
        console.log(error);
    }
}


// ====== Fim Relatório de Clientes ==================
// ===================================================


// ============================================================
// == CRUD Read ===============================================


// =========================== Validação de busca (preenchimento obrigatório)
ipcMain.on('validate-search', ()=> {
    dialog.showMessageBox({
        type: 'warning',
        title: "Atenção!",
        message: "Preencha o campo de busca",
        buttons: ['OK']
    })
})
ipcMain.on('search-name', async (event, name) => {
    //console.log("teste IPC search-name")
    //console.log(name) // teste do passo 2 (importante!)
    // Passos 3 e 4 busca dos dados do cliente no banco
    //find({nomeCliente: name}) - busca pelo nome
    //RegExp(name, 'i') - i (insensitive / Ignorar maiúsculo ou minúsculo)
    try {
        const dataClient = await clientModel.find({
            nomeCliente: new RegExp(name, 'i')
        })
        console.log(dataClient) // teste passos 3 e 4 (importante!)

        // se o vetor estiver vazio [] (cliente não cadastrado)
        if (dataClient.length === 0) {
            dialog.showMessageBox({
                type: 'question',
                title: "Aviso",
                message: "Cliente não cadastrado. \nDeseja Cadastrar esse cliente?",
                defaultId: 0, // botão 0
                buttons: ['Sim', 'Não']
            }).then((result)=> {
                if (result.response === 0) {
                    // Enviar ao renderizador um pedido de busca para setar os campos (recortar do campo de busca e colar nos campos de nome)
                    event.reply('set-client')
                } else {
                event.reply('reset-form')
                }
            })
        }


        // Passo 5:
        // enviando os dados do cliente ao rendererCliente
        // OBS: IPC só trabalha com string, então é necessário converter o JSON para string JSON.stringify(dataClient)
        event.reply('render-client', JSON.stringify(dataClient))

    } catch (error) {
        console.log(error)
    }
})

// == Fim - CRUD Read =========================================
// ============================================================

// == CRUD Delete =============================================
// ============================================================

ipcMain.on('delete-client', async (event, id) => {
    console.log(id); // teste de recebimento do i
    try {
        // importante - confirmar o exclusão
        // client é o nome da variável que representa a janela
        const { response } = await dialog.showMessageBox(client, {
            type: 'warning',
            title: "Atenção!",
            message: "Tem certeza que deseja excluir? Está ação não poderá ser revertida.",
            buttons: ['Cancelar', 'Excluir'] //[0, 1]
        })
        if (response === 1) {
            // Passo 3 - Excluir o registro do cliente
            const delClient = await clientModel.findByIdAndDelete(id)
            event.reply('reset-form')
        }
    } catch (error) {
        console.log(error)
    }
})

// == Fim - CRUD Delete =======================================
// ============================================================