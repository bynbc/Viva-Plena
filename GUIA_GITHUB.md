# Guia: Conectando seu Projeto ao GitHub

Para enviar atualizações automaticamente sem precisar baixar ZIPs toda vez, você precisa ter o **Git** instalado.

Como o comando `git` não foi reconhecido no seu sistema, siga estes passos:

## 1. Instalar o Git
1. Baixe o Git para Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Instale (pode ir clicando em "Next" em todas as opções padrão).
3. **Importante:** Após instalar, reinicie o VS Code ou seu terminal.

## 2. Configurar o Repositório (Apenas na 1ª vez)
Abra o terminal na pasta do projeto e rode os comandos abaixo, um por um:

```bash
# 1. Iniciar o Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Salvar a versão atual
git commit -m "Versão Inicial V13"

# 4. Criar a conexão com seu GitHub (Crie um rep novo no site do GitHub antes)
# Substitua O-SEU-LINK-DO-GITHUB pelo link do repositório que você criou
git remote add origin https://github.com/SEU-USUARIO/viva-plena.git

# 5. Enviar para o GitHub
git branch -M main
git push -u origin main
```

## 3. Como enviar atualizações no dia a dia
Depois de configurado, sempre que quiser salvar mudanças, basta rodar:

```bash
git add .
git commit -m "Descrição do que você mudou"
git push
```

Pronto! Seus arquivos estarão salvos na nuvem automaticamente.
