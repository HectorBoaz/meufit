# Como instalar o Maiza Fit no iPhone (via AltStore)

> Feito uma vez só. Depois, o AltStore renova o app sozinho toda semana.

## Parte 1 – No PC (Windows)

1. **Instale o iTunes e o iCloud baixados direto do site da Apple** – *não* use as versões da Microsoft Store.
   Os links diretos estão em: https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows
   (se já tiver as versões da Microsoft Store instaladas, desinstale antes).
2. Baixe o **AltServer para Windows** em https://altstore.io, extraia o `AltInstaller.zip` e rode o `Setup.exe`.
3. Procure "AltServer" no menu Iniciar → botão direito → **Executar como administrador**.
   Se o Windows perguntar sobre rede, permita em **redes privadas**.

## Parte 2 – Conectar o iPhone

4. Ligue o iPhone no PC pelo cabo, desbloqueie e toque em **Confiar neste computador**.
5. Abra o iTunes, entre com o Apple ID e, na página do iPhone, marque
   **"Sincronizar com este iPhone via Wi‑Fi"** → Aplicar. (É isso que permite renovar sem cabo.)

## Parte 3 – Instalar o AltStore no iPhone

6. Clique no ícone do AltServer na bandeja do Windows (perto do relógio) → **Install AltStore** → escolha o iPhone.
7. Digite o Apple ID e a senha (vão só para a Apple; dica: pode ser um Apple ID secundário).
8. No iPhone: **Ajustes → Geral → VPN e Gerenciamento de Dispositivo** → toque no seu Apple ID → **Confiar**.
9. **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor** → ativar → o iPhone reinicia → confirme **Ativar**.

## Parte 4 – Instalar o Maiza Fit

10. No iPhone, abra o **Safari** e acesse:
    **https://github.com/HectorBoaz/meufit/releases/latest**
11. Toque em **MaizaFit.ipa** para baixar (vai para o app Arquivos → Downloads).
12. Abra o **AltStore** → aba **My Apps** → botão **+** (canto superior) → escolha o `MaizaFit.ipa`.
    *(O PC precisa estar ligado com o AltServer aberto e na mesma rede Wi‑Fi.)*
13. Pronto! Abra o **Maiza Fit** e, quando ele pedir, **permita as notificações**.

## Renovação semanal (importante)

- Apps instalados com Apple ID gratuito **expiram em 7 dias**.
- O AltStore renova sozinho em segundo plano **se o PC estiver ligado, com o AltServer rodando, na mesma rede Wi‑Fi**.
- Para renovar na mão: AltStore → **My Apps** → **Refresh All**.
- Se expirar, não tem problema: é só renovar que os dados continuam lá.
- Limite do Apple ID gratuito: **3 apps** ao mesmo tempo (o próprio AltStore conta como 1).

## Backup dos dados

Os dados ficam só no iPhone. De vez em quando, vá em **Lembretes → Backup → Exportar** e salve no
iCloud Drive. Se um dia precisar reinstalar do zero, use **Restaurar**.

## Atualizar o app

Sempre que o código mudar, o GitHub gera um novo `MaizaFit.ipa` no mesmo link do passo 10.
Baixe e instale de novo pelo AltStore (passo 12) – os dados são mantidos.
