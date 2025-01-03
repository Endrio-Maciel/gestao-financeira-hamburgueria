# Sistema de Gestão Financeira para Hamburgueria

## Descrição
Este projeto é uma API desenvolvida para ajudar na gestão financeira de uma hamburgueria. A API permite o gerenciamento de transações financeiras, categorias de gastos, contas bancárias, cartões de crédito e faturas. Também oferece funcionalidades de autenticação e recuperação de senhas, além de fornecer um painel de controle financeiro através de uma documentação interativa.

A API foi construída com Fastify e usa JWT para autenticação, Swagger para documentação, Zod para validação de tipos e Casl para permissões dos Membros, billings e Admins.

## Link da API
Acesse a documentação da API ao vivo aqui. (https://gestao-financeira-hamburgueria.onrender.com/docs#/)

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

## Testando a API
Acesse a documentação da API através de https://gestao-financeira-hamburgueria.onrender.com/docs#. Realize o login utilizando as credenciais de um usuário criado no seed.

- Admin: admin@example.com / senha: admin123
- Membro: member@example.com / senha: member123
- Billing: billing@example.com / senha: billing123

O login retornará um token JWT. Esse token deve ser utilizado nas requisições subsequentes para acessar recursos protegidos.
Endpoints Principais.

-  POST /auth/login: Realiza login e gera um token JWT.
-  GET /transactions: Lista todas as transações.
-  POST /transactions: Cria uma nova transação.
-  GET /categories: Lista todas as categorias.
-  POST /categories: Cria uma nova categoria.










