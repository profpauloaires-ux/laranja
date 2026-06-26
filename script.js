// 1. URL atualizada com o nó "/clientes.json" exigido pelo Firebase REST APi
let url = "https://revisao-97177-default-rtdb.firebaseio.com/clientes.json";
const form = document.getElementById('cadastroForm');
const tabelaBody = document.querySelector('#tabelaDados tbody');
const btnCancelar = document.getElementById('btnCancelar');

// Inicializa a lista de clientes vazia (será preenchida pelo Firebase)
let clientes = [];

// 2. Função para buscar os dados diretamente do Firebase ao carregar a página
async function carregarDadosFirebase() {
    try {
        const response = await fetch(url);
        const dados = await response.json();
        
        // Se o banco estiver vazio, o Firebase retorna null. Garantimos um array vazio.
        clientes = dados ? dados : []; 
        
        renderizarTabela();
    } catch (erro) {
        console.error("Erro ao carregar dados do Firebase:", erro);
        alert("Não foi possível carregar os dados do servidor.");
    }
}

// 3. Função para salvar o estado atual do array no Firebase
async function salvarNoFirebase() {
    try {
        // O método PUT substitui o nó inteiro pelo novo array atualizado
        await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(clientes),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        renderizarTabela();
    } catch (erro) {
        console.error("Erro ao salvar no Firebase:", erro);
        alert("Erro ao salvar os dados no servidor.");
    }
}

function renderizarTabela() {
    tabelaBody.innerHTML = '';
    
    // Filtra possíveis itens nulos que o Firebase gera caso posições do array sejam apagadas
    clientes.forEach((cliente, index) => {
        if (cliente === null) return; 

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.produto}</td>
            <td>${cliente.valor}</td>
            <td>${cliente.quantidade}</td>
            <td>${cliente.marca}</td>
            <td>
                <button class="btn-edit" onclick="editarCliente(${index})">Editar</button>
                <button class="btn-delete" onclick="removerCliente(${index})">Excluir</button>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const index = document.getElementById('indexEdicao').value;
    
    const novoCliente = {
        produto: document.getElementById('produto').value,
        valor: document.getElementById('valor').value,
        quantidade: document.getElementById('quantidade').value,
        marca: document.getElementById('marca').value
    };

    if (index === "") {
        clientes.push(novoCliente); // Create
    } else {
        clientes[index] = novoCliente; // Update
        document.getElementById('indexEdicao').value = "";
        btnCancelar.style.display = 'none';
    }

    // Envia as modificações para a nuvem e limpa o formulário
    await salvarNoFirebase();
    form.reset();
});

window.editarCliente = (index) => {
    const cli = clientes[index];
    document.getElementById('produto').value = cli.produto;
    document.getElementById('valor').value = cli.valor;
    document.getElementById('quantidade').value = cli.quantidade;
    document.getElementById('marca').value = cli.marca;
    document.getElementById('indexEdicao').value = index;
    btnCancelar.style.display = 'block';
};

window.removerCliente = async (index) => {
    if (confirm("Deseja excluir este registro?")) {
        clientes.splice(index, 1); // Delete
        
        // Atualiza a nuvem após a exclusão
        await salvarNoFirebase();
    }
};

btnCancelar.onclick = () => {
    form.reset();
    document.getElementById('indexEdicao').value = "";
    btnCancelar.style.display = 'none';
};

// 4. Inicializa o app buscando os dados em tempo real da nuvem
carregarDadosFirebase();