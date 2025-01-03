# Sistema de Gestão Financeira para Hamburgueria

## Descrição
Este é um sistema backend desenvolvido para gerenciar as finanças de uma hamburgueria. Ele inclui funcionalidades como o controle de transações, categorias, contas bancárias e cartões de crédito. O objetivo é auxiliar na organização financeira do negócio, permitindo previsões e análises de fluxo de caixa.

## Funcionalidades
- **Gerenciamento de Usuários e Permissões**:
  - Papéis: Admin, Billing e Member.
  - Controle de acesso baseado em permissões.
- **Gestão de Transações**:
  - CRUD completo para transações financeiras.
  - Suporte para transações futuras e finalizações automáticas.
- **Categorias e Contas**:
  - Organização das transações por categorias.
  - Controle de saldos em contas bancárias e caixas.
- **Cartões de Crédito**:
  - Gerenciamento de limites, faturas e relação com transações.
- **Projeções Financeiras**:
  - Cálculo de saldo projetado.
  - Identificação de possíveis prejuízos futuros.

## Tecnologias Utilizadas
- **Linguagem:** TypeScript
- **Framework:** Fastify
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Contêiner:** Docker

## Como Executar o Projeto
1. **Clone o Repositório:**
   ```bash
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   cd nome-do-repositorio
   ```

2. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` baseado no `.env.example` e preencha com suas configurações:
   ```
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
   JWT_SECRET=sua_chave_secreta
   ```

3. **Suba o Ambiente com Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Instale as Dependências:**
   ```bash
   npm install
   ```

5. **Execute as Migrações do Banco de Dados:**
   ```bash
   npx prisma migrate dev
   ```

6. **Popule o Banco de Dados (Seed):**
   ```bash
   npm run seed
   ```

7. **Inicie o Servidor:**
   ```bash
   npm run dev
   ```

8. **Acesse o Sistema:**
   O servidor estará disponível em `http://localhost:3000`.

## Endpoints Disponíveis
A documentação completa dos endpoints está disponível via Swagger em `http://localhost:3000/docs` (se configurado).

## Estrutura do Projeto
- `src/`
  - `controllers/`: Controladores das requisições.
  - `services/`: Lógica de negócios.
  - `repositories/`: Acesso ao banco de dados.
  - `middlewares/`: Middleware para autenticação e validação.
  - `routes/`: Definição das rotas da aplicação.

## Melhorias Futuras
- Implementar testes unitários e de integração.
- Deploy automatizado em plataformas como Render ou Railway.
- Integração com serviços externos para processamento de pagamentos.

## Contribuições
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença
Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

