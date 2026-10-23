# Coopera Luz · Medidor Coopera

Página institucional da Cooperativa Coopera Luz com um simulador web de consumo de energia elétrica. O morador cadastra os aparelhos da casa, o servidor em Node.js calcula o consumo mensal em kWh, o valor estimado da conta com a bandeira tarifária do mês, o aparelho que mais pesa no bolso e quantos painéis solares seriam necessários.

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![Node](https://img.shields.io/badge/Node.js-20%2B-3c873a)
![Express](https://img.shields.io/badge/Express-4.x-000)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)

---

## Sobre o Projeto

A Coopera Luz é uma cooperativa de energia solar comunitária da Zona Leste de São Paulo. Toda semana, moradores chegam à sede com a conta de luz na mão perguntando por que ela veio tão alta e se vale a pena entrar na cooperativa.

Antes, essas contas eram feitas no papel. Este projeto substitui a planilha por uma página única onde o morador:

1. Monta a lista de aparelhos da casa (nome, potência em W, horas por dia, dias no mês).
2. Clica em **Simular**.
3. Recebe consumo em kWh, conta com bandeira, painéis necessários e o aparelho mais caro.

Toda a regra de negócio fica no servidor. O navegador só coleta dados, envia por `fetch` e desenha a resposta. A tarifa e as regras mudam com frequência e não podem depender do navegador do morador, que pode ser alterado por qualquer pessoa no DevTools.

Além do medidor, a página traz uma parte institucional (o que é a cooperativa, como funciona, explicação das bandeiras tarifárias e FAQ) para que o morador entenda o contexto antes de simular.

---

## Funcionalidades

### Medidor Coopera

- **Cadastro de aparelhos** — formulário com nome, potência (W), horas/dia e dias/mês.
- **Lista dinâmica** — adiciona e remove aparelhos com `createElement` + `textContent`, sem recarregar a página.
- **Simulação no servidor** — `POST /api/simular` recebe a lista, valida e devolve o resultado.
- **Resultado em destaque** — consumo em kWh/mês, conta estimada (energia + bandeira), painéis necessários e aparelho mais caro.
- **Tabela de detalhes** — consumo, custo e percentual de cada aparelho.
- **Mensagens de erro claras** — status 400 com `{ erro }` dizendo qual campo e qual aparelho estão errados.
- **Formatação brasileira** — `toLocaleString('pt-BR')` para R$ e para kWh.

### Página institucional

- **Hero** — apresentação da cooperativa com contadores animados (moradores, usinas, economia média).
- **O que é a Coopera** — três cards explicando geração compartilhada, CO₂ evitado e transparência de regras.
- **Como funciona** — passo a passo em 4 etapas.
- **Bandeiras tarifárias** — abas interativas com verde, amarela, vermelha 1 e vermelha 2, mostrando o valor por 100 kWh.
- **FAQ** — acordeão com as dúvidas mais comuns.
- **CTA final** — chamada para abrir o medidor.
- **Rodapé** — navegação secundária e informações do projeto.

### Interações e acessibilidade

- **Tema claro/escuro** — botão no header, preferência salva em `localStorage`.
- **Reveal on scroll** — elementos aparecem suavemente com `IntersectionObserver`.
- **Contadores animados** — números do hero sobem ao entrar na tela.
- **Toasts** — feedback de adicionar aparelho, simular e erros.
- **Parallax suave** — orbs decorativos do hero se movem com o scroll.
- **`prefers-reduced-motion`** — respeita quem prefere menos animação.
- **Navegação por teclado** — `:focus-visible` em botões e inputs.
- **`aria-live`** — lista e resultado anunciados por leitores de tela.

---

## Tecnologias Utilizadas

- **HTML5** — semântica, `<details>` para o FAQ, `<main>`/`<section>`/`<footer>`.
- **CSS3** — variáveis, `color-mix`, `backdrop-filter`, grid, flexbox, animações.
- **JavaScript (puro)** — sem frameworks no front-end.
- **Node.js** — runtime do servidor.
- **Express** — rotas HTTP, `express.json()`, `express.static('public')`, middleware de erro.
- **Node Test Runner** — `node --test` para os testes automatizados.

---

## Como Funciona

Navegador (public/) Servidor (Node + Express)
┌──────────────────────────┐ POST /api/simular ┌──────────────────────────┐
│ index.html institucional│ ───── JSON ─────────▶ │ server.js rota + validação │
│ + formulário │ │ calculos.js regras │
│ app.js DOM + fetch │ ◀──── JSON ────────── │ config.js parâmetros │
│ style.css tema + layout│ 200 ou 400 └──────────────────────────┘
└──────────────────────────┘
text


1. O usuário preenche o formulário e clica em **Adicionar**. O `app.js` empilha o aparelho em um array local e redesenha a lista.
2. Ao clicar em **Simular**, o `app.js` envia `{ aparelhos: [...] }` via `fetch` com `Content-Type: application/json`.
3. O `server.js` lê `req.body.aparelhos`, chama `validar()` e, se houver erro, devolve **400** com `{ erro }`.
4. Se válido, `server.js` chama `simular()`, que aplica as fórmulas de `calculos.js` usando os parâmetros de `config.js`, e devolve **200** com o objeto do contrato.
5. O `app.js` lê a resposta e desenha o destaque e a tabela em `#resultado`.

As fórmulas centrais ficam em `calculos.js`:

| Grandeza | Fórmula |
|---|---|
| Consumo do aparelho (kWh/mês) | `potenciaW × horasDia × diasMes ÷ 1000` |
| Custo de energia (R$) | `consumoTotal × TARIFA_KWH` |
| Adicional da bandeira (R$) | `(consumoTotal ÷ 100) × valorBandeira` |
| Total da conta (R$) | `custoEnergia + adicionalBandeira` |
| Geração de 1 painel (kWh/mês) | `(POTENCIA_PAINEL_W ÷ 1000) × HSP × 30 × EFICIENCIA` |
| Painéis necessários | `Math.ceil(consumoTotal ÷ geraçãoPorPainel)` |

Arredondamento só na resposta da API, com `Math.round(valor * 100) / 100`.

---

## Instalação

### Requisitos

- **Node.js** versão 20 ou mais nova (LTS recomendado)
- **npm** (vem com o Node)
- Navegador moderno (Chrome, Edge, Firefox ou Safari atualizados)

### Passo a passo

1. Clone o repositório e entre na pasta:

```bash
git clone https://github.com/devMiraPy/medidorCoopera.git
cd medidorCoopera

    Instale as dependências:

bash

npm install

    Rode os testes do projeto para confirmar que está tudo funcionando:

bash

npm test

Saída esperada: os testes de cálculo e de validação passando.

    Suba o servidor:

bash

npm start

    Abra http://localhost:3000 no navegador.

    Atenção à estrutura: o server.js usa express.static('public'). Os arquivos index.html, style.css e app.js precisam estar dentro da pasta public/. Se estiverem na raiz, o localhost:3000 devolve 404.

Como Usar
Simular o consumo de uma casa

    Abra http://localhost:3000 e role até a seção Medidor Coopera.

    Preencha o formulário. Exemplo:

        Aparelho: Geladeira

        Potência (W): 150

        Horas por dia: 24

        Dias no mês: 30

    Clique em Adicionar à lista. O aparelho aparece na lista lateral e um toast confirma.

    Repita para os demais aparelhos. Use Remover para tirar um item da lista.

    Clique em Simular consumo. O resultado aparece abaixo, com destaque e tabela de detalhes.

Testar a API direto (sem o front-end)
bash

curl -X POST http://localhost:3000/api/simular \
  -H "Content-Type: application/json" \
  -d '{"aparelhos":[
        {"nome":"Geladeira","potenciaW":150,"horasDia":24,"diasMes":30},
        {"nome":"Chuveiro","potenciaW":5500,"horasDia":0.5,"diasMes":30},
        {"nome":"TV","potenciaW":100,"horasDia":5,"diasMes":30}
      ]}'

Resposta esperada (com os parâmetros atuais de config.js):
json

{
  "consumoKwhMes": 205.5,
  "custoEnergia": 164.4,
  "adicionalBandeira": 3.87,
  "totalMes": 168.27,
  "paineisNecessarios": 5,
  "aparelhoMaisCaro": { "nome": "Geladeira", "custo": 86.4 },
  "detalhes": [
    { "nome": "Geladeira", "kwhMes": 108, "custo": 86.4, "percentual": 52.55 },
    { "nome": "Chuveiro",  "kwhMes": 82.5, "custo": 66,   "percentual": 40.15 },
    { "nome": "TV",        "kwhMes": 15,   "custo": 12,   "percentual": 7.3 }
  ]
}

Testar erro de validação
bash

curl -X POST http://localhost:3000/api/simular \
  -H "Content-Type: application/json" \
  -d '{"aparelhos":[{"nome":"X","potenciaW":"100","horasDia":2,"diasMes":30}]}'

Resposta esperada: 400 com {"erro":"potenciaW deve estar entre 1 e 10000 (aparelho 1)"}.
Contrato da API
POST /api/simular

Requisição:
json

{ "aparelhos": [
    { "nome": "Geladeira", "potenciaW": 150, "horasDia": 24, "diasMes": 30 }
] }

Resposta 200:
json

{
  "consumoKwhMes": 108,
  "custoEnergia": 86.4,
  "adicionalBandeira": 2.04,
  "totalMes": 88.44,
  "paineisNecessarios": 3,
  "aparelhoMaisCaro": { "nome": "Geladeira", "custo": 86.4 },
  "detalhes": [
    { "nome": "Geladeira", "kwhMes": 108, "custo": 86.4, "percentual": 100 }
  ]
}

Resposta 400:
json

{ "erro": "horasDia deve estar entre 0 e 24 (aparelho 1)" }

Regras de validação
Campo	Regra
Lista aparelhos	Não vazia, precisa ser array
nome	String com texto (não vazia após trim)
potenciaW	Número finito, entre 1 e 10000
horasDia	Número finito, entre 0 e 24
diasMes	Inteiro entre 1 e 31
Todos os números	Precisam ser do tipo number (string "5" é rejeitada)
Estrutura do Projeto
text

medidorCoopera/
├── package.json
├── server.js              # Express, rota POST /api/simular, middleware de erro
├── calculos.js            # Fórmulas puras + validação
├── calculos.test.js       # Testes de cálculo e validação (node --test)
├── config.js              # Tarifa, bandeira, HSP, painel, eficiência
└── public/
    ├── index.html         # Página institucional + medidor
    ├── style.css          # Estilo completo, tema claro/escuro
    └── app.js             # Lógica do medidor + interações do site

Configuração

Todos os parâmetros de negócio ficam em config.js:
js

module.exports = {
  TARIFA_KWH: 0.80,
  BANDEIRA: 'amarela',
  HSP: 4.5,
  POTENCIA_PAINEL_W: 450,
  EFICIENCIA: 0.80,
  VALORES_BANDEIRA: { verde: 0, amarela: 1.885, vermelha1: 4.463, vermelha2: 7.877 },
};

    TARIFA_KWH — tarifa em R$/kWh.

    BANDEIRA — chave que precisa existir em VALORES_BANDEIRA (verde, amarela, vermelha1, vermelha2). Se a chave não existir, o adicional vira NaN e os testes falham.

    HSP — horas de sol pleno por dia (média de irradiação equivalente a 1000 W/m²).

    POTENCIA_PAINEL_W — potência do painel em watts.

    EFICIENCIA — fator de perda do sistema (0 a 1).

    VALORES_BANDEIRA — valor em R$ por 100 kWh de cada bandeira.

Segurança

    Cálculo no servidor — a regra de negócio fica num só lugar e não pode ser alterada pelo DevTools do navegador.

    Validação rigorosa — tipos verificados com Number.isFinite, limites checados antes de qualquer cálculo. Entradas inválidas devolvem 400 com mensagem clara.

    textContent, nunca innerHTML com dado do usuário — previne XSS. Se alguém digitar <img src=x onerror=alert(1)> no nome do aparelho, aparece como texto, não é executado.

    event.preventDefault() no submit — impede recarregar a página e perder o array de aparelhos.

    Middleware de erro para JSON malformado — corpo inválido vira 400 com mensagem legível, não 500.

    express.json() sem limite explícito — usa o padrão de 100 kb, suficiente para a lista de aparelhos.

    O servidor escuta em localhost:3000 — por padrão, só é acessível localmente. Para expor, use um túnel (Cloudflare Tunnel, ngrok etc.) com cautela.

    Nenhum dado sensível no front-end — tarifa, bandeira e regras só existem no servidor.

Testes
bash

npm test

Roda node --test em calculos.test.js. Os testes cobrem:

    Cálculo completo — geladeira + chuveiro + TV, confere todos os campos do contrato.

    Cálculo parcial — só geladeira, confere totalMes, adicionalBandeira e paineisNecessarios.

    Validação — lista vazia, horasDia fora do intervalo, potenciaW como string e nome em branco.

Se qualquer linha de config.js ou calculos.js for alterada de forma errada, um desses testes falha e aponta o valor esperado vs. recebido. É a principal rede de segurança do projeto.
Alterações comuns e como fazer
Mudar a tarifa

Edite config.js:
js

TARIFA_KWH: 0.89,   // era 0.80

Rode npm test — os testes que dependem da tarifa vão falhar (é esperado, os testes usam os valores atuais). Se quiser manter os testes passando, ajuste os valores esperados em calculos.test.js.
Mudar a bandeira

Edite config.js:
js

BANDEIRA: 'vermelha1',

A chave precisa existir em VALORES_BANDEIRA. Se não existir, o adicional vira NaN.
Adicionar uma nova bandeira

Em config.js:
js

VALORES_BANDEIRA: {
  verde: 0, amarela: 1.885, vermelha1: 4.463, vermelha2: 7.877,
  escassez: 14.20,
},

Em calculos.js, cfg.BANDEIRA passa a aceitar 'escassez'. Nada mais precisa mudar — a fórmula já lê por chave.
Mudar a eficiência do painel

Em config.js:
js

EFICIENCIA: 0.75,   // era 0.80

O geracaoPorPainelKwh cai e o número de painéis sobe. Rode npm test para ver o efeito.
Limitações

    Um cenário por vez — a simulação é mensal. Não há projeção anual nem comparação entre meses.

    Bandeira fixa no config.js — o usuário não escolhe a bandeira na tela; ela vem do servidor. Uma bandeira inválida vira NaN e derruba os testes.

    diasMes precisa ser inteiro — 30.5 é rejeitado pela validação, mesmo que horasDia aceite decimal.

    totalMes é arredondado depois da soma — se um dia os valores tiverem mais casas decimais, pode haver 1 centavo de diferença entre o total exibido e a soma das partes exibidas. Hoje isso não acontece.

    Estado do array de aparelhos vive só no navegador — recarregar a página perde a lista. Persistência com localStorage não está implementada.

    Sem autenticação — qualquer pessoa com acesso ao localhost:3000 (ou ao túnel) pode simular. Não há chave de acesso.

    Sem limite de requisições — o servidor não tem rate limit. Para expor publicamente, adicione um middleware de limitação.

    app.js assume que o servidor devolve JSON — se o servidor devolver 500 com HTML, resposta.json() lança e o catch mostra "servidor não respondeu" mesmo que ele tenha respondido. Cosmético.

    Não há testes de front-end — os testes cobrem só calculos.js. A parte de DOM é validada manualmente.

Solução de problemas
Sintoma	Causa provável	Conserto
npm test falha com NaN !== 3.87	BANDEIRA em config.js não existe em VALORES_BANDEIRA	Corrigir para 'verde', 'amarela', 'vermelha1' ou 'vermelha2'
npm test falha com 4 !== 5 em painéis	Math.ceil virou Math.floor ou HSP/EFICIÊNCIA mudou	Reverter Math.ceil; conferir HSP: 4.5 e EFICIENCIA: 0.80
npm test falha com 164.4 !== X	TARIFA_KWH foi alterada	Restaurar 0.80
Página 404 no localhost:3000	Falta pasta public/ com index.html	Mover index.html, app.js, style.css para public/
Botão Simular não faz nada	Servidor desligado	Rodar npm start em outro terminal
EADDRINUSE :3000	Outro processo usando a porta	lsof -i :3000 (Linux/Mac) ou netstat -ano | findstr :3000 (Windows) e encerrar
Console: Cannot read 'nome' of undefined	Alguém removeu aparelhoMaisCaro de simular	Restaurar o campo no retorno de simular
Network mostra 400	Dado inválido (ex.: string em potenciaW)	Ler dados.erro na resposta
Network mostra 500	Exceção não tratada no servidor	Ver terminal do npm start — o stack trace aponta a linha
Autor

Desenvolvido por devMiraPy para a Cooperativa Coopera Luz — Ordem de serviço nº 2026-0417.