function carregar_novidades() {
    const produtos_novidades = document.getElementById("produtosnovidades");
    let saida = "";
    fetch("http://127.0.0.1:5000/api/v1/produto/listar")
        .then((res) => res.json())
        .then((dados) => {
            dados.map((item) => {
                saida += `<div class="produto">
                <img src="${item.foto1}" alt="Imagem ${item.nome}">
                <h3>${item.nome}</h3>
                <p class="preco">R$${item.preco}</p>
                <button onclick="adicionar_carrinho('${item.foto1}', '${item.nome}', ${item.preco}, 1)">
                    <img src="img/carrinho1.png" alt="Adicionar ao carrinho"> Adicionar ao carrinho
                </button>
            </div>`;
            });
            produtos_novidades.innerHTML = saida;
        });
    carregar_maisvendidos();
}

let pe = 0;
const passo = 200;
const limiteEsquerda = -600;
const limiteDireita = 0;

function rolarNovidadesEsquerda() {
    pe -= passo;
    if (pe < limiteEsquerda) pe = limiteEsquerda;
    atualizarMargem();
}

function rolarNovidadesDireita() {
    pe += passo;
    if (pe > limiteDireita) pe = limiteDireita;
    atualizarMargem();
}

function atualizarMargem() {
    const produtosnovidades = document.getElementById("produtosnovidades");
    produtosnovidades.style.marginLeft = `${pe}px`;
}

function carregar_maisvendidos() {
    const produtos_maisvendidos = document.getElementById("produtosmaisvendidos");
    let saida = "";
    fetch("http://127.0.0.1:5000/api/v1/produto/listarmaisvendidos")
        .then((res) => res.json())
        .then((dados) => {
            dados.map((item) => {
                saida += `<div class="produto">
                <img src="${item.foto1}" alt="Imagem ${item.nome}">
                <h3>${item.nome}</h3>
                <p class="quantidade">Qtd: ${item.quantidade}</p>
            </div>`;
            });
            produtos_maisvendidos.innerHTML = saida;
        });
    carregar_marcas();
}

function carregar_marcas() {
    const div_marcas = document.getElementById("produtosmarcas");
    let saida = "";
    fetch("http://127.0.0.1:5000/api/v1/marca/listar")
        .then((res) => res.json())
        .then((dados) => {
            dados.map((marca) => {
                saida += `<div class="marca">
                <img src="${marca.foto}" alt="Marca ${marca.nome}">
                <h3>${marca.nome}</h3>
            </div>`;
            });
            div_marcas.innerHTML = saida;
        });
}

function carregar_por_categoria(categoria) {
    const lstprodutos = document.getElementById("lstprodutos");
    let saida = "";
    fetch(`http://127.0.0.1:5000/api/v1/produto/listarporcategoria/${categoria}`)
        .then((res) => res.json())
        .then((produtos) => {
            produtos.map((item) => {
                saida += `<div class="produto-categoria">
                    <img src="${item.foto1}">
                    <h3>${item.nome}</h3>
                    <p class="preco">R$ ${item.preco}</p>
                    <a href="detalhes.html?id=${item.id}">Mais detalhes</a>
                </div>`;
            });
            lstprodutos.innerHTML = saida;
        });
}

let produtos_no_carrinho = [];
function adicionar_carrinho(foto, nome, preco, qtd) {
    let produto = {
        nome_produto: nome,
        foto_produto: foto,
        preco_produto: preco,
        quantidade_produto: qtd
    };
    produtos_no_carrinho.push(produto);
    window.localStorage.setItem("carrinho", JSON.stringify({ produtos_no_carrinho }));
}

function carregar_detalhes() {
    let idproduto = new URLSearchParams(window.location.search).get("id");
    const div_detalhes = document.getElementById("detalhes");

    fetch(`http://127.0.0.1:5000/api/v1/produto/listarporid/${idproduto}`)
        .then((res) => res.json())
        .then((dt) => {
            const produto = dt[0];

            let div_img = document.createElement("div");
            div_img.setAttribute("id", "div_img");

            let div_capa = document.createElement("div");
            div_capa.setAttribute("id", "div_capa");

            let img_capa = document.createElement("img");
            img_capa.src = produto.foto1;
            div_capa.appendChild(img_capa);
            div_img.appendChild(div_capa);

            let div_miniatura = document.createElement("div");
            div_miniatura.setAttribute("id", "div_miniatura");

            [produto.foto1, produto.foto2, produto.foto3].forEach(f => {
                if (f) {
                    let img = document.createElement("img");
                    img.src = f;
                    div_miniatura.appendChild(img);
                }
            });

            div_img.appendChild(div_miniatura);
            div_detalhes.appendChild(div_img);

            let div_titulo_descricao = document.createElement("div");
            div_titulo_descricao.setAttribute("id", "div_titulo_descricao");

            let h3_titulo = document.createElement("h3");
            h3_titulo.innerHTML = produto.nome;

            let p_descricao = document.createElement("p");
            p_descricao.innerHTML = produto.descricao;

            div_titulo_descricao.appendChild(h3_titulo);
            div_titulo_descricao.appendChild(p_descricao);
            div_detalhes.appendChild(div_titulo_descricao);

            let div_carrinho = document.createElement("div");
            div_carrinho.setAttribute("id", "div_carrinho");

            let p_preco = document.createElement("p");
            p_preco.innerHTML = `R$ ${produto.preco}`;

            let btn_adicionar = document.createElement("button");
            btn_adicionar.innerHTML = "Adicionar ao carrinho";
            btn_adicionar.onclick = () => adicionar_carrinho(produto.foto1, produto.nome, produto.preco, 1);

            div_carrinho.appendChild(p_preco);
            div_carrinho.appendChild(btn_adicionar);
            div_detalhes.appendChild(div_carrinho);
        })
        .catch((err) => console.error(err));
}

let qtd_produtos_carrinho = 0;
function carregar_produtos_carrinho() {
    let produtos = localStorage.getItem("carrinho");
    if (produtos != null) {
        document.getElementById("div_qtd_itens").style.display = "block";
        let carrinho = JSON.parse(produtos).produtos_no_carrinho;

        div_qtd_itens.innerHTML = carrinho.length;

        const lista = document.getElementById("lista_produto_carrinho");
        lista.innerHTML = "";
        carrinho.map((item) => {
            let mont = `<div class="item-carrinho">
                <input type="checkbox" name="selecionado">
                <img src="${item.foto_produto}">
                <h4>${item.nome_produto}</h4>
                <input type="number" value="${item.quantidade_produto}" min="1" max="99">
                <p class="valor_total">R$ ${item.preco_produto}</p>
                <img src="img/excluir.png" class="btnexcluir">
            </div>`;
            lista.innerHTML += mont;
        });
    }
}

const area_carrinho = document.getElementsByClassName("carrinho")[0];
const div_qtd_itens = document.createElement("div");
div_qtd_itens.setAttribute("id", "div_qtd_itens");
div_qtd_itens.innerHTML = qtd_produtos_carrinho;
area_carrinho.appendChild(div_qtd_itens);
