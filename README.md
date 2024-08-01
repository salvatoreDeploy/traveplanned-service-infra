# Conhecer dependencias da Aplicação: Travel Planned

- Tecnologia: Node.js
- Versão: v1.0.0
- Variaveis de ambiente
- Porta da aplicação

# Fluxo da aplicação:

## Escopo - Desenvolvimento:

- Instalar dependencias
- Executar aplicação em desenvolvimento : (tsx)

## Escopo - Produção:

- Instalar dependencias
- Realizar o biuld: (tsup)
- Executar o biuld: (node)

# Orquestração de Container Local:

## Requisitos:

[x] Postgres

# CI

## Configuração github Actions:

[x] Condicional para haver uma nova CI
[x] Jobs
[x] Steps do processos

# Kubernets

## Executar aplicação no Kubernets

[] Criar um cluster Kubernets
[] Setar quantos servers(nós) tera
[] Criar um namespace

## Arquitetura cluster Kubernets

[] Cluster EKS
[] VPC

## Criar cluster K8s

[] Criar arquivos de manifestos neste caso (deployment, secret e o service)
[] Criar tudo usando esses manifestos

# Helm

[] Criar um empacotamento helm e um CLuster de deploy

# CD

## Argo CD

[] Entrega continua atraves da mudança da tag
[] Usar gitOps

# Banco de dados Remoto DBAS:

[x] Serviço: Supabase
