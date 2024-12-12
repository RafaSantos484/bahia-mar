# Bahia Mar - Sistema Web de Gerenciamento

O presente repositório, que pode ser visualizado no link https://github.com/RafaSantos484/bahia-mar, foi construído como Trabalho de Conclusão de Curso pelos estudantes: Daniel André Marinho, Luan Machado Silva Vidal e Rafael Santos de Jesus, pelo Centro Universitário SENAI CIMATEC.
O projeto foi desenvolvido com orientação dos professores doutores Márcio Rêne Brandão Soussa e Guilherme Oliveira de Souza.

## Sobre o Sistema

O sistema possui um sistema de login e recuperação de conta. Não é possível realizar um auto cadastro no sistema (Usuários apenas podem ser cadastrados por administradores.
Ao fazer login, haverá dois tipos de usuários: Vendedor e Administrador.

### Vendedor

O vendedor tem acesso à visualização e ao cadastro de Vendas e Clientes, que são as funcionalidades demandadas para seu serviço.

### Administrador

O administrador pode realizar todas as funcionalidades do sistema, sendo estas
- Visualizar, Cadasrar, Editar e Remover Clientes, Usuários, Vendas, Métodos de Pagamento, Veículos e Produtos.
- Acesso aos Dashboards, sendo esses relacionados à venda/faturamento, ou um Dashboard personalizado para cada cliente ou funcionário.


## Aspectos Técnicos

O frontend do sistema foi desenvolvido utilizando a tecnologia ReactJs, enquanto o Backend foi desenvolvido utilizando Firebase

## Como rodar

1. Certifique-se de ter o Node.js instalado no seu sistema.

2. Utilize o seguinte comando para instalar o node e as dependências do projeto:
```bash
npm i
```
3. Em seguida, utilize o comando a seguir para rodar o projeto
```bash
npm start
```

## Visualização

O sistema pode ser visualizado no link abaixo:

https://bahia-mar.vercel.app

OBS: Note que é necessário ter uma conta de administrador para realizar login.
