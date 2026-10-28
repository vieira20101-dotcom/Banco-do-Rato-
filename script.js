"use strict";


let saldo = 1000;
const historico = [
  { descricao: "Abertura da conta", valor: 1000, saldo: 1000 }
];

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const formulario = document.getElementById("formOperacao");
const operacao = document.getElementById("operacao");
const campoValor = document.getElementById("valor");
const ajudaValor = document.getElementById("ajudaValor");
const saldoNaTela = document.getElementById("saldo");
const mensagem = document.getElementById("mensagem");
const cedulas = document.getElementById("cedulas");
const listaNotas = document.getElementById("listaNotas");
const totalNotas = document.getElementById("totalNotas");
const extrato = document.getElementById("extrato");
const corpoExtrato = document.getElementById("corpoExtrato");
const saldoExtrato = document.getElementById("saldoExtrato");

function atualizarSaldo() {
  saldoNaTela.textContent = moeda.format(saldo);
}

function configurarCampoValor() {
  const precisaValor = operacao.value === "depositar" || operacao.value === "sacar";
  campoValor.disabled = !precisaValor;
  campoValor.required = precisaValor;

  if (operacao.value === "depositar") {
    ajudaValor.textContent = "Digite um valor inteiro maior que zero.";
  } else if (operacao.value === "sacar") {
    ajudaValor.textContent = "Digite um valor múltiplo de 10.";
  } else if (operacao.value === "extrato") {
    ajudaValor.textContent = "Não precisa informar um valor.";
  } else {
    ajudaValor.textContent = "Não precisa informar um valor.";
  }
}

function obterValorValido() {
  const texto = campoValor.value.trim();
  const valor = Number(texto);


  if (texto === "") {
    mensagem.textContent = "Erro: informe um valor para realizar a operação.";
    campoValor.focus();
    return null;
  } else if (!Number.isSafeInteger(valor) || valor <= 0) {
    mensagem.textContent = "Erro: digite um número inteiro maior que zero e dentro do limite permitido.";
    campoValor.focus();
    return null;
  } else {
    return valor;
  }
}

function registrarMovimentacao(descricao, valor) {
  historico.push({ descricao: descricao, valor: valor, saldo: saldo });
}

function depositar() {
  const valor = obterValorValido();
  if (valor === null) return;

 
  const novoSaldo = -(Math.abs(saldo) + valor);
  if (!Number.isSafeInteger(novoSaldo)) {
    mensagem.textContent = "Erro: valor do depósito muito alto.";
    return;
  }


  if (saldo > 0) {
    const ajuste = -2 * saldo;
    saldo = -saldo;
    registrarMovimentacao("Conversão do saldo em dívida", ajuste);
  }

  saldo = novoSaldo;
  registrarMovimentacao("Depósito", -valor);
  atualizarSaldo();
  mensagem.textContent = "Depósito de " + moeda.format(valor) + " realizado. Saldo atual: " + moeda.format(saldo) + ".";
  campoValor.value = "";
}

function sacar() {
  const valor = obterValorValido();
  if (valor === null) return;


  if (valor % 10 !== 0) {
    mensagem.textContent = "Erro: o valor do saque deve ser múltiplo de 10.";
    campoValor.focus();
  } else if (valor > saldo) {
    mensagem.textContent = "Erro: saldo insuficiente. Saldo atual: " + moeda.format(saldo) + ".";
  } else {
    let restante = valor;
    let quantidadeTotal = 0;
    const notas = [100, 50, 20, 10];
    listaNotas.replaceChildren();

    for (let i = 0; i < notas.length; i++) {
      let quantidade = 0;

     
      while (restante >= notas[i]) {
        restante -= notas[i];
        quantidade++;
        quantidadeTotal++;
      }

      if (quantidade > 0) {
        const item = document.createElement("li");
        item.textContent = quantidade + " nota(s) de " + moeda.format(notas[i]);
        listaNotas.appendChild(item);
      }
    }

    saldo -= valor;
    registrarMovimentacao("Saque", -valor);
    atualizarSaldo();
    mensagem.textContent = "Saque de " + moeda.format(valor) + " realizado com sucesso! Saldo restante: " + moeda.format(saldo) + ".";
    totalNotas.textContent = "Quantidade total de notas entregues: " + quantidadeTotal + ".";
    cedulas.hidden = false;
    campoValor.value = "";
  }
}

function mostrarExtrato() {
  corpoExtrato.replaceChildren();

 
  for (let i = 0; i < historico.length; i++) {
    const movimento = historico[i];
    const linha = document.createElement("tr");
    const numero = document.createElement("td");
    const descricao = document.createElement("td");
    const valor = document.createElement("td");
    const saldoApos = document.createElement("td");

    numero.textContent = i + 1;
    descricao.textContent = movimento.descricao;
    valor.textContent = (movimento.valor > 0 ? "+" : "") + moeda.format(movimento.valor);
    saldoApos.textContent = moeda.format(movimento.saldo);

    linha.appendChild(numero);
    linha.appendChild(descricao);
    linha.appendChild(valor);
    linha.appendChild(saldoApos);
    corpoExtrato.appendChild(linha);
  }

  saldoExtrato.textContent = "Saldo atual: " + moeda.format(saldo) + ".";
  extrato.hidden = false;
  mensagem.textContent = "Extrato atualizado.";
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  cedulas.hidden = true;
  extrato.hidden = true;

 
  switch (operacao.value) {
    case "consultar":
      mensagem.textContent = "Seu saldo atual é " + moeda.format(saldo) + ".";
      break;
    case "depositar":
      depositar();
      break;
    case "sacar":
      sacar();
      break;
    case "extrato":
      mostrarExtrato();
      break;
    default:
      mensagem.textContent = "Erro: selecione uma operação válida.";
  }
});

operacao.addEventListener("change", configurarCampoValor);
configurarCampoValor();
atualizarSaldo();
