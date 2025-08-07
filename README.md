# Sistema de Conversão de Moedas - Mercado de Wefin

## 📖 Sobre o Projeto

Este é um sistema de conversão de moedas desenvolvido para o **Mercado de Pulgas dos Mil Saberes** na cidade de Wefin, Reino de SRM. O sistema permite a conversão entre **Ouro Real** e **Tibar**, facilitando o comércio entre os habitantes do reino e os anãos comerciantes das montanhas distantes.

**Taxa de Conversão:** 1 Ouro Real = 2,5 Tibares (variável conforme demanda do mercado)

## 🚀 Funcionalidades

### 💱 Painel de Conversão
- **Consulta de Taxas:** Visualização da taxa atual de conversão
- **Atualização de Taxa:** Modal para edição da taxa de câmbio
- **Conversão de Moedas:** Formulário para conversão entre Ouro Real e Tibar
- **Validações:** Verificação de valores negativos e campos obrigatórios
- **Troca Rápida:** Botão para inverter moedas de origem e destino

### 📊 Histórico de Transações
- **Tabela Interativa:** Exibição de todas as transações realizadas
- **Filtros Avançados:** 
  - Por tipo de moeda (origem/destino)
  - Por data da transação
  - Por intervalo de valores
  - Por nome do mercador
- **Paginação:** Navegação eficiente entre páginas
- **Detalhes da Transação:** Modal com informações completas

### 🎨 Design e UX
- **Design Responsivo:** Otimizado para desktop, tablet e mobile
- **Animações Suaves:** Micro-interações e transições elegantes
- **Loading States:** Indicadores visuais durante operações assíncronas
- **Notificações:** Toasts informativos para feedback do usuário

## 🛠️ Tecnologias Utilizadas
- **Angular 20** - Framework principal
- **TypeScript** - Linguagem de programação
- **Tailwind CSS** - Framework de estilos
- **NGX-Toastr** - Sistema de notificações
- **RxJS** - Programação reativa
- **Jasmine/Karma** - Testes unitários

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd tibar-exchange
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o projeto em modo de desenvolvimento:**
```bash
npm start
```

4. **Acesse a aplicação:**
Abra seu navegador e vá para `http://localhost:4200`

### Scripts Disponíveis

```bash
npm start

npm run build

npm test

```

## 🧪 Testes

O projeto inclui **testes unitários abrangentes** cobrindo mais de **80% do código**, incluindo:

### Componentes Testados
- **Componentes:** CurrencyConverter e TransactionHistory
  - Validações de formulário
  - Interações do usuário
  - Gerenciamento de estado local
  - Integração com serviços

### Modais Testados
- **Modais:** UpdateRateModal e TransactionDetailModal
  - Abertura e fechamento
  - Validações específicas
  - Comunicação com componentes pai

### Casos de Teste Cobertos
- **Modelos:** Validação de tipos e interfaces
- **Validações:** Formulários e entrada de dados
- **Estados de Loading:** Operações assíncronas
- **Tratamento de Erros:** Cenários de falha
- **Performance:** Otimizações e memory leaks

### Executar testes:
```bash
npm test

npm run test:watch
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── currency-converter/          # Componente de conversão
│   ├── transaction-history/         # Histórico de transações
│   ├── transaction-detail-modal/    # Modal de detalhes
│   ├── update-rate-modal/          # Modal de atualização de taxa
│   └── loading/                    # Componente de loading
├── models/
│   └── currency.model.ts           # Interfaces e tipos
├── services/
│   ├── currency.service.ts         # Serviço principal
│   └── mock-data.service.ts        # Dados mockados
├── main.ts                         # Ponto de entrada
└── styles.scss                     # Estilos globais
```

## 📄 Licença