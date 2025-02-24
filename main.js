console.log("Processo principal")
const { app, BrowserWindow, nativeTheme, Menu } = require('electron')
const path = require('node:path')

// Janela principal
const createWindow = () => {
  //a linha abaixo define o tema, sendo ele claro ou escuro (claro ou escuro)
  nativeTheme.themeSource = 'light' //(dark ou light)
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    //autoHideMenuBar: true,
    //minimizable: false,
    resizable: false
  })
  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('./src/views/index.html')
}




//Iniciar a aplicação

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

//Janela Sobre
function aboutWindow() {
  nativeTheme.themeSource = 'dark'
  //a linha abaixo contém uma janela principal
  const main = BrowserWindow.getFocusedWindow()
  let about
  // Estabelecer uma relação hierárquica entre janelas
  if (main) {
    // Criar a janela
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
  // Carregar o documento HTML na janela
  about.loadFile('./src/views/sobre.html')
}

//reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// Template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'OS'
      },
      {
        type: 'separator'
      },
      {
        label: 'Sair',
        click: () => app.quit(),
        accelerator: 'Alt+F4' // Corrigido: "acceletator" -> "accelerator"
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes'
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
    label: 'Zoom'
  },
  {
    label: 'Ferramentas',
    submenu: [ // Corrigido: Adicionando "submenu:"
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar para zoom padrão',
        role: 'resetZoom' // Corrigido: "resetZoom0" -> "resetZoom"
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