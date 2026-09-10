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

## Instalar no Android

1. Aba **Actions**: espere "Gerar APK Android" ficar verde (5 a 8 min na primeira vez).
2. Aba **Releases** → baixe `mafort-tasks-focus.apk` pelo celular e instale.
3. Na primeira vez que iniciar o foco, aceite a permissão de notificações (é por onde o sino toca com a tela apagada).

Atualizações: baixe o APK novo e instale por cima. Os dados ficam.
