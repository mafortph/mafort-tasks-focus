# Mafort Tasks & Focus

Quadro de tarefas (To do / Doing / Done) com calendário de prazos e temporizador de foco com sino tibetano.

- **Site (PC e celular):** GitHub Pages, branch `main`, pasta raiz. Endereço: https://mafortph.github.io/mafort-tasks-focus/
- **App Android:** APK gerado pelo GitHub Actions (`.github/workflows/android.yml`) a cada alteração. Fica em **Releases**.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app inteiro (uma página só) |
| `bowl_focus.mp3`, `bowl_break.mp3` | Sinos: 2 toques (foco) e 3 toques (descanso) |
| `icon-192.png`, `icon-512.png` | Ícones |
| `manifest.webmanifest`, `sw.js` | Deixam o site instalável e funcionando offline |
| `capacitor.config.json`, `package.json` | Empacotamento Android |
| `android-res.py` | Gera ícones e splash do Android durante o build |
| `.github/workflows/android.yml` | Pipeline que compila o APK |
| `apps-script.gs` | Código do Google Apps Script para sincronização e agenda (cole em script.google.com) |

## Instalar no Android

1. Aba **Actions**: espere "Gerar APK Android" ficar verde (5 a 8 min na primeira vez).
2. Aba **Releases** → baixe `mafort-tasks-focus.apk` pelo celular e instale.
3. Na primeira vez que iniciar o foco, aceite a permissão de notificações (é por onde o sino toca com a tela apagada).

Atualizações: baixe o APK novo e instale por cima. Os dados ficam.

## Sincronizar celular e PC (e criar prazos na agenda Google)

Uma vez só, no PC, logado na conta Google que terá os dados (mafortph@gmail.com):

1. Abra https://script.google.com e clique em **Novo projeto**.
2. Apague o conteúdo do editor e cole o conteúdo do arquivo `apps-script.gs` deste repositório. Ctrl+S.
3. No topo, renomeie "Projeto sem título" para `Mafort Tasks & Focus`.
4. Botão azul **Implantar** → **Nova implantação** → engrenagem ao lado de "Selecionar tipo" → **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   - **Implantar**
5. Vai pedir autorização: **Autorizar acesso** → escolha a conta → se aparecer "O Google não verificou este app", clique em **Avançado** → **Acessar Mafort Tasks & Focus (não seguro)** → **Permitir**. (É o seu próprio script rodando na sua conta; o aviso aparece para qualquer script pessoal.)
6. Copie o **URL do app da Web** (termina em `/exec`).
7. No app (site ou Android), toque no ícone de setas circulares no topo → cole o URL → **Gerar** uma chave → **Salvar**.
8. No outro aparelho, mesma tela: mesmo URL e a **mesma chave** → Salvar.

Pronto. A cada alteração o quadro é enviado; ao abrir o app ele busca as novidades. Os dados ficam num arquivo JSON no seu Drive, na pasta "Mafort Tasks & Focus". Os prazos viram eventos "Prazo: ..." na agenda principal, com avisos 12h e 3h antes; ao concluir ou apagar a tarefa, o evento some.

Para alterar o código do script depois: edite em script.google.com → **Implantar** → **Gerenciar implantações** → lápis → Versão: **Nova versão** → Implantar. O URL continua o mesmo.
