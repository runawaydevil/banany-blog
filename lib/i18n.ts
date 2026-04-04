export type Locale = "en" | "pt";

export const DEFAULT_LOCALE: Locale = "en";

const messages: Record<Locale, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.posts": "Posts",
    "nav.pages": "Pages",
    "nav.newsletter": "Newsletter",
    "nav.appearance": "Appearance",
    "nav.settings": "Settings",
    "nav.home": "Home",
    "nav.archive": "Archive",
    "nav.primary": "Primary navigation",
    "nav.dashboardLabel": "Dashboard navigation",

    "locale.en": "English",
    "locale.pt": "Português (Brasil)",

    "common.menu": "Menu",
    "common.signOut": "Sign out",
    "common.email": "Email",
    "common.password": "Password",
    "common.remove": "Remove",
    "common.replace": "Replace",
    "common.upload": "Upload",
    "common.view": "View",
    "common.previous": "Previous",
    "common.next": "Next",
    "common.pagination": "Pagination",
    "common.loading": "Loading…",
    "common.notFound": "Not found",
    "common.done": "Done",
    "common.backHome": "← Home",
    "common.backToSignIn": "Back to sign in",
    "i18n.fallbackProbe": "English fallback",

    "footer.madeWith": "Made with",
    "footer.tagline": "— a small home for small-web writing.",
    "site.defaultDescription": "A self-hosted small-web publishing engine",

    "login.title": "Dashboard",
    "login.subtitle": "Sign in to continue.",
    "login.invalidCredentials": "Invalid email or password.",
    "login.action": "Sign in",
    "login.loading": "Signing in…",
    "login.forgotPassword": "Forgot password?",

    "forgot.title": "Reset password",
    "forgot.success": "If an account exists, a reset link was sent.",
    "forgot.error": "Request failed.",
    "forgot.action": "Send link",

    "reset.title": "New password",
    "reset.missingToken": "Missing token.",
    "reset.success": "Password updated.",
    "reset.error": "Reset failed.",
    "reset.action": "Update password",
    "reset.newPassword": "New password",

    "setup.title": "Welcome to Banany Blog",
    "setup.ownerName": "Your name",
    "setup.siteTitle": "Site title",
    "setup.passwordHint": "Password (min 8)",
    "setup.publicUrl": "Public site URL (canonical)",
    "setup.publicUrlEnvTrusted":
      "Taken from APP_URL (or related env) on the server. Change the environment variable to use a different public URL.",
    "setup.publicUrlHelp":
      "Use the URL users type in the browser (e.g. https://blog.example.com). For production, set APP_URL so this cannot drift from your deployment.",
    "setup.initialTheme": "Initial theme",
    "setup.language": "Language",
    "setup.finish": "Finish setup",
    "setup.saving": "Saving…",
    "setup.redirecting": "Redirecting to sign in…",
    "setup.failed": "Setup failed",

    "appearance.title": "Appearance",
    "appearance.themePreset": "Theme preset",
    "appearance.language": "Language",
    "appearance.typographyLocked":
      "Typography stays locked to the preset. Accent and link overrides are optional and apply on top of the preset tokens.",
    "appearance.accent": "Accent",
    "appearance.link": "Link",
    "appearance.usePresetDefault": "Leave empty for preset default",
    "appearance.brandingAssets": "Branding assets",
    "appearance.currentAsset": "Current asset attached.",
    "appearance.noCustomFavicon": "No custom favicon yet.",
    "appearance.defaultLogo": "Using the default Banany mark.",
    "appearance.customCss": "Custom CSS",
    "appearance.customCssHelp":
      "Injected after theme variables so your rules win predictably. Server limit: 120KB.",
    "appearance.save": "Save appearance",
    "appearance.saving": "Saving…",
    "appearance.saved": "Appearance saved.",
    "appearance.saveError": "Could not save appearance.",
    "appearance.uploadError": "Upload failed.",
    "appearance.attachError": "Could not attach branding to the site.",
    "appearance.removeError": "Could not remove branding.",
    "appearance.faviconUpdated": "Favicon updated.",
    "appearance.logoUpdated": "Logo updated.",
    "appearance.faviconRemoved": "Favicon removed.",
    "appearance.logoRemoved": "Logo removed.",

    "settings.title": "Settings",
    "settings.general": "General",
    "settings.siteTitle": "Site title (public)",
    "settings.browserTitle": "Browser title (optional)",
    "settings.browserTitlePlaceholder": "Tab title override",
    "settings.dashboardTitle": "Dashboard title (optional)",
    "settings.publicUrl": "Public URL",
    "settings.publicUrlHelp":
      "Prefer defining the canonical URL with APP_URL in production so feeds, sitemap, and password reset stay consistent.",
    "settings.urlMismatchTitle": "Public URL differs from APP_URL",
    "settings.urlMismatchAction": "Apply URL from environment",
    "settings.urlMismatchApplying": "Updating…",
    "settings.urlMismatchApplied": "Public URL updated from environment.",
    "settings.urlMismatchError": "Could not sync URL.",
    "settings.introSnippet": "Intro snippet (homepage)",
    "settings.homePageSlug": "Homepage custom page (slug)",
    "settings.homePageDefault": "— Default stream —",
    "settings.saveGeneral": "Save general",
    "settings.saved": "Settings saved.",
    "settings.saveError": "Could not save settings.",
    "settings.navigation": "Navigation",
    "settings.navigationHelp":
      "Header links on the public site (order top to bottom).",
    "settings.labelPlaceholder": "Label",
    "settings.pathPlaceholder": "/path",
    "settings.addLink": "Add link",
    "settings.saveNavigation": "Save navigation",
    "settings.navigationSaved": "Navigation saved.",
    "settings.navigationSaveError": "Could not save navigation.",
    "settings.seo": "SEO",
    "settings.metaDescription": "Meta description",
    "settings.saveSeo": "Save SEO",
    "settings.newsletterSurfaces": "Newsletter surfaces",
    "settings.newsletterHome": "Show signup on homepage",
    "settings.newsletterPost": "Show signup on posts",
    "settings.saveNewsletter": "Save newsletter options",

    "dashboard.overview":
      "Quick overview. Use the header to move between sections.",
    "dashboard.stats.posts": "Posts",
    "dashboard.stats.pages": "Pages",
    "dashboard.stats.subscribers": "Subscribers",
    "dashboard.stats.campaigns": "Campaigns",

    "posts.new": "New post",
    "posts.noTitle": "(no title)",
    "posts.statusPublished": "published",
    "posts.statusDraft": "draft",
    "posts.viewDraft": "View (draft)",
    "posts.viewDraftHint": "Publish the post to open it on the public site",
    "posts.empty": "No posts yet.",

    "pages.new": "New page",
    "pages.empty": "No pages yet.",

    "post.note": "Note",
    "post.pinned": "Pinned",
    "post.empty": "No posts yet.",
    "post.pageOf": "Page {page} of {total}",
    "post.untitledNote": "Untitled note",

    "postType.note": "note",
    "postType.post": "post",
    "postType.photo": "photo",
    "postType.link": "link",
    "postType.quote": "quote",
    "postType.reply": "reply",

    "archive.undated": "Undated",
    "archive.empty": "Nothing published yet.",

    "newsletter.placeholder": "Your email",
    "newsletter.button": "Subscribe",
    "newsletter.success": "Thanks — you're subscribed.",
    "newsletter.error": "Could not subscribe.",
    "newsletter.label": "Newsletter",

    "newsletterDashboard.title": "Newsletter",
    "newsletterDashboard.subtitle":
      "Manual sends, subscriber management, and campaign history.",
    "newsletterDashboard.activeSubscribers": "Active subscribers",
    "newsletterDashboard.subject": "Subject",
    "newsletterDashboard.previewText": "Preview text",
    "newsletterDashboard.subjectPlaceholder": "What are you sending today?",
    "newsletterDashboard.previewPlaceholder":
      "Short preheader shown in inboxes",
    "newsletterDashboard.body": "Body",
    "newsletterDashboard.bodyPlaceholder": "Write your newsletter…",
    "newsletterDashboard.bodyHelp":
      "Images are intentionally disabled in newsletter sends for now.",
    "newsletterDashboard.send": "Send newsletter",
    "newsletterDashboard.sending": "Sending…",
    "newsletterDashboard.subjectRequired": "Subject is required.",
    "newsletterDashboard.bodyRequired": "Write the newsletter before sending.",
    "newsletterDashboard.sendError": "Could not send newsletter.",
    "newsletterDashboard.sentSummary":
      "Newsletter sent to {count} subscribers.",
    "newsletterDashboard.sentSummaryWithFailures":
      "Newsletter sent to {count} subscribers with {failures} failure(s).",
    "newsletterDashboard.preview": "Live preview",
    "newsletterDashboard.previewHelp":
      "Uses the active site theme, title, and current logo.",
    "newsletterDashboard.plainText": "Plain-text fallback",
    "newsletterDashboard.subscribers": "Subscribers",
    "newsletterDashboard.subscribersHelp":
      "Search, inspect status, and export as CSV.",
    "newsletterDashboard.exportCsv": "Export CSV",
    "newsletterDashboard.searchPlaceholder": "Search by email",
    "newsletterDashboard.filterAll": "All",
    "newsletterDashboard.filterActive": "Active",
    "newsletterDashboard.filterUnsubscribed": "Unsubscribed",
    "newsletterDashboard.tableEmail": "Email",
    "newsletterDashboard.tableSubscribed": "Subscribed",
    "newsletterDashboard.tableStatus": "Status",
    "newsletterDashboard.unsubscribedOn": "Unsubscribed on {date}",
    "newsletterDashboard.noSubscribers":
      "No subscribers match this filter.",
    "newsletterDashboard.recentCampaigns": "Recent campaigns",
    "newsletterDashboard.recentCampaignsHelp":
      "Latest manual sends and recipient counts.",
    "newsletterDashboard.sentTo": "Sent to {count} subscriber(s){suffix}.",
    "newsletterDashboard.failuresSuffix": ", {count} failure(s)",
    "newsletterDashboard.noCampaigns": "No campaigns sent yet.",

    "editor.details": "Details",
    "editor.save": "Save",
    "editor.saving": "Saving…",
    "editor.more": "More",
    "editor.publish": "Publish",
    "editor.update": "Update",
    "editor.viewLive": "View live",
    "editor.deletePost": "Delete post",
    "editor.type": "Type",
    "editor.tags": "Tags",
    "editor.tagsPlaceholder": "comma separated",
    "editor.linkUrl": "Link URL",
    "editor.schedule": "Schedule",
    "editor.published": "Published",
    "editor.pinned": "Pinned",
    "editor.contentPlaceholder": "Start writing…",
    "editor.titlePlaceholder": "Title",
    "editor.pageTitlePlaceholder": "Page title",
    "editor.excerptPlaceholder":
      "Optional excerpt — plain text, max 300 characters (used for SEO description)",
    "editor.pageContentPlaceholder": "Page content…",
    "editor.linkPrompt": "URL",
    "editor.addTextBeforeSaving": "Add text or an image before saving.",
    "editor.postSaved": "Post saved.",
    "editor.postUpdated": "Post updated.",
    "editor.postPublished": "Post published.",
    "editor.pageSaved": "Page saved.",
    "editor.pageUpdated": "Page updated.",
    "editor.pagePublished": "Page published.",
    "editor.saveFailed": "Save failed",
    "editor.savedAt": "Saved {time}",
    "editor.unsavedChanges": "Unsaved changes",
    "editor.draft": "Draft",
    "editor.backPosts": "← Posts",
    "editor.backPages": "← Pages",

    "delete.button": "Delete",
    "delete.deleting": "Deleting...",
    "delete.success": "Post deleted.",
    "delete.error": "Delete failed",
    "delete.confirmUntitled":
      "Delete this post? This action cannot be undone.",
    "delete.confirmTitled":
      "Delete \"{title}\"? This action cannot be undone.",

    "email.newsletter.receivingBecause":
      "You are receiving this because you subscribed to {siteTitle}.",
    "email.newsletter.unsubscribe": "Unsubscribe instantly",
    "email.reset.subject": "Reset your Banany Blog password",
    "email.reset.body":
      "Open this link to reset your password (valid 1 hour):",
  },
  pt: {
    "nav.dashboard": "Painel",
    "nav.posts": "Posts",
    "nav.pages": "Páginas",
    "nav.newsletter": "Newsletter",
    "nav.appearance": "Aparência",
    "nav.settings": "Configurações",
    "nav.home": "Início",
    "nav.archive": "Arquivo",
    "nav.primary": "Navegação principal",
    "nav.dashboardLabel": "Navegação do painel",

    "locale.en": "English",
    "locale.pt": "Português (Brasil)",

    "common.menu": "Menu",
    "common.signOut": "Sair",
    "common.email": "Email",
    "common.password": "Senha",
    "common.remove": "Remover",
    "common.replace": "Trocar",
    "common.upload": "Enviar",
    "common.view": "Ver",
    "common.previous": "Anterior",
    "common.next": "Próxima",
    "common.pagination": "Paginação",
    "common.loading": "Carregando…",
    "common.notFound": "Não encontrado",
    "common.done": "Concluir",
    "common.backHome": "← Início",
    "common.backToSignIn": "Voltar para entrar",

    "footer.madeWith": "Feito com",
    "footer.tagline": "— um pequeno lar para escrita small-web.",
    "site.defaultDescription": "Um motor self-hosted de publicação small-web",

    "login.title": "Painel",
    "login.subtitle": "Entre para continuar.",
    "login.invalidCredentials": "Email ou senha inválidos.",
    "login.action": "Entrar",
    "login.loading": "Entrando…",
    "login.forgotPassword": "Esqueceu a senha?",

    "forgot.title": "Redefinir senha",
    "forgot.success":
      "Se existir uma conta com este email, um link de redefinição foi enviado.",
    "forgot.error": "Não foi possível concluir a solicitação.",
    "forgot.action": "Enviar link",

    "reset.title": "Nova senha",
    "reset.missingToken": "Token ausente.",
    "reset.success": "Senha atualizada.",
    "reset.error": "Não foi possível redefinir a senha.",
    "reset.action": "Atualizar senha",
    "reset.newPassword": "Nova senha",

    "setup.title": "Bem-vindo ao Banany Blog",
    "setup.ownerName": "Seu nome",
    "setup.siteTitle": "Título do site",
    "setup.passwordHint": "Senha (mínimo 8)",
    "setup.publicUrl": "URL pública do site (canônica)",
    "setup.publicUrlEnvTrusted":
      "Obtida do APP_URL (ou variável relacionada) no servidor. Altere a variável de ambiente para usar outra URL pública.",
    "setup.publicUrlHelp":
      "Use a URL que as pessoas digitam no navegador (ex.: https://blog.exemplo.com). Em produção, defina APP_URL para evitar divergência com o deploy.",
    "setup.initialTheme": "Tema inicial",
    "setup.language": "Idioma",
    "setup.finish": "Concluir configuração",
    "setup.saving": "Salvando…",
    "setup.redirecting": "Redirecionando para entrar…",
    "setup.failed": "Falha na configuração",

    "appearance.title": "Aparência",
    "appearance.themePreset": "Preset de tema",
    "appearance.language": "Idioma",
    "appearance.typographyLocked":
      "A tipografia fica presa ao preset. Accent e Link são opcionais e entram por cima dos tokens do preset.",
    "appearance.accent": "Acento",
    "appearance.link": "Link",
    "appearance.usePresetDefault": "Deixe vazio para usar o padrão do preset",
    "appearance.brandingAssets": "Assets da marca",
    "appearance.currentAsset": "Asset atual anexado.",
    "appearance.noCustomFavicon": "Ainda não existe favicon personalizado.",
    "appearance.defaultLogo": "Usando a marca padrão do Banany.",
    "appearance.customCss": "CSS customizado",
    "appearance.customCssHelp":
      "Injetado depois das variáveis do tema para que suas regras prevaleçam com previsibilidade. Limite do servidor: 120KB.",
    "appearance.save": "Salvar aparência",
    "appearance.saving": "Salvando…",
    "appearance.saved": "Aparência salva.",
    "appearance.saveError": "Não foi possível salvar a aparência.",
    "appearance.uploadError": "Falha no upload.",
    "appearance.attachError":
      "Não foi possível anexar o asset de marca ao site.",
    "appearance.removeError": "Não foi possível remover o asset de marca.",
    "appearance.faviconUpdated": "Favicon atualizado.",
    "appearance.logoUpdated": "Logo atualizada.",
    "appearance.faviconRemoved": "Favicon removido.",
    "appearance.logoRemoved": "Logo removida.",

    "settings.title": "Configurações",
    "settings.general": "Geral",
    "settings.siteTitle": "Título do site (público)",
    "settings.browserTitle": "Título do navegador (opcional)",
    "settings.browserTitlePlaceholder": "Sobrescrever o título da aba",
    "settings.dashboardTitle": "Título do painel (opcional)",
    "settings.publicUrl": "URL pública",
    "settings.publicUrlHelp":
      "Prefira definir a URL canônica com APP_URL em produção para manter feeds, sitemap e reset de senha consistentes.",
    "settings.urlMismatchTitle": "A URL pública difere do APP_URL",
    "settings.urlMismatchAction": "Aplicar URL do ambiente",
    "settings.urlMismatchApplying": "Atualizando…",
    "settings.urlMismatchApplied":
      "URL pública atualizada a partir do ambiente.",
    "settings.urlMismatchError": "Não foi possível sincronizar a URL.",
    "settings.introSnippet": "Texto introdutório (homepage)",
    "settings.homePageSlug": "Página customizada da homepage (slug)",
    "settings.homePageDefault": "— Fluxo padrão —",
    "settings.saveGeneral": "Salvar geral",
    "settings.saved": "Configurações salvas.",
    "settings.saveError": "Não foi possível salvar as configurações.",
    "settings.navigation": "Navegação",
    "settings.navigationHelp":
      "Links do cabeçalho no site público (ordem de cima para baixo).",
    "settings.labelPlaceholder": "Rótulo",
    "settings.pathPlaceholder": "/caminho",
    "settings.addLink": "Adicionar link",
    "settings.saveNavigation": "Salvar navegação",
    "settings.navigationSaved": "Navegação salva.",
    "settings.navigationSaveError": "Não foi possível salvar a navegação.",
    "settings.seo": "SEO",
    "settings.metaDescription": "Meta description",
    "settings.saveSeo": "Salvar SEO",
    "settings.newsletterSurfaces": "Superfícies da newsletter",
    "settings.newsletterHome": "Mostrar inscrição na homepage",
    "settings.newsletterPost": "Mostrar inscrição nos posts",
    "settings.saveNewsletter": "Salvar opções da newsletter",

    "dashboard.overview":
      "Visão rápida. Use o cabeçalho para navegar entre as seções.",
    "dashboard.stats.posts": "Posts",
    "dashboard.stats.pages": "Páginas",
    "dashboard.stats.subscribers": "Inscritos",
    "dashboard.stats.campaigns": "Campanhas",

    "posts.new": "Novo post",
    "posts.noTitle": "(sem título)",
    "posts.statusPublished": "publicado",
    "posts.statusDraft": "rascunho",
    "posts.viewDraft": "Ver (rascunho)",
    "posts.viewDraftHint":
      "Publique o post para abri-lo no site público",
    "posts.empty": "Ainda não existem posts.",

    "pages.new": "Nova página",
    "pages.empty": "Ainda não existem páginas.",

    "post.note": "Nota",
    "post.pinned": "Fixado",
    "post.empty": "Ainda não existem posts.",
    "post.pageOf": "Página {page} de {total}",
    "post.untitledNote": "Nota sem título",

    "postType.note": "nota",
    "postType.post": "post",
    "postType.photo": "foto",
    "postType.link": "link",
    "postType.quote": "citação",
    "postType.reply": "resposta",

    "archive.undated": "Sem data",
    "archive.empty": "Nada publicado ainda.",

    "newsletter.placeholder": "Seu email",
    "newsletter.button": "Inscrever",
    "newsletter.success": "Obrigado — inscrição concluída.",
    "newsletter.error": "Não foi possível fazer a inscrição.",
    "newsletter.label": "Newsletter",

    "newsletterDashboard.title": "Newsletter",
    "newsletterDashboard.subtitle":
      "Envios manuais, gestão de inscritos e histórico de campanhas.",
    "newsletterDashboard.activeSubscribers": "Inscritos ativos",
    "newsletterDashboard.subject": "Assunto",
    "newsletterDashboard.previewText": "Texto de prévia",
    "newsletterDashboard.subjectPlaceholder": "O que você vai enviar hoje?",
    "newsletterDashboard.previewPlaceholder":
      "Pré-cabeçalho curto exibido nas caixas de entrada",
    "newsletterDashboard.body": "Corpo",
    "newsletterDashboard.bodyPlaceholder": "Escreva sua newsletter…",
    "newsletterDashboard.bodyHelp":
      "Imagens ficam desativadas nos envios de newsletter por enquanto.",
    "newsletterDashboard.send": "Enviar newsletter",
    "newsletterDashboard.sending": "Enviando…",
    "newsletterDashboard.subjectRequired": "O assunto é obrigatório.",
    "newsletterDashboard.bodyRequired":
      "Escreva a newsletter antes de enviar.",
    "newsletterDashboard.sendError": "Não foi possível enviar a newsletter.",
    "newsletterDashboard.sentSummary":
      "Newsletter enviada para {count} inscritos.",
    "newsletterDashboard.sentSummaryWithFailures":
      "Newsletter enviada para {count} inscritos com {failures} falha(s).",
    "newsletterDashboard.preview": "Prévia ao vivo",
    "newsletterDashboard.previewHelp":
      "Usa o tema ativo do site, o título e a logo atual.",
    "newsletterDashboard.plainText": "Fallback em texto puro",
    "newsletterDashboard.subscribers": "Inscritos",
    "newsletterDashboard.subscribersHelp":
      "Pesquise, confira o status e exporte em CSV.",
    "newsletterDashboard.exportCsv": "Exportar CSV",
    "newsletterDashboard.searchPlaceholder": "Buscar por email",
    "newsletterDashboard.filterAll": "Todos",
    "newsletterDashboard.filterActive": "Ativos",
    "newsletterDashboard.filterUnsubscribed": "Descadastrados",
    "newsletterDashboard.tableEmail": "Email",
    "newsletterDashboard.tableSubscribed": "Inscrição",
    "newsletterDashboard.tableStatus": "Status",
    "newsletterDashboard.unsubscribedOn": "Descadastrado em {date}",
    "newsletterDashboard.noSubscribers":
      "Nenhum inscrito corresponde a este filtro.",
    "newsletterDashboard.recentCampaigns": "Campanhas recentes",
    "newsletterDashboard.recentCampaignsHelp":
      "Últimos envios manuais e contagem de destinatários.",
    "newsletterDashboard.sentTo":
      "Enviada para {count} inscrito(s){suffix}.",
    "newsletterDashboard.failuresSuffix": ", {count} falha(s)",
    "newsletterDashboard.noCampaigns": "Nenhuma campanha enviada ainda.",

    "editor.details": "Detalhes",
    "editor.save": "Salvar",
    "editor.saving": "Salvando…",
    "editor.more": "Mais",
    "editor.publish": "Publicar",
    "editor.update": "Atualizar",
    "editor.viewLive": "Ver ao vivo",
    "editor.deletePost": "Excluir post",
    "editor.type": "Tipo",
    "editor.tags": "Tags",
    "editor.tagsPlaceholder": "separadas por vírgula",
    "editor.linkUrl": "URL do link",
    "editor.schedule": "Agendamento",
    "editor.published": "Publicado",
    "editor.pinned": "Fixado",
    "editor.contentPlaceholder": "Comece a escrever…",
    "editor.titlePlaceholder": "Título",
    "editor.pageTitlePlaceholder": "Título da página",
    "editor.excerptPlaceholder":
      "Resumo opcional — texto puro, máximo de 300 caracteres (usado como description de SEO)",
    "editor.pageContentPlaceholder": "Conteúdo da página…",
    "editor.linkPrompt": "URL",
    "editor.addTextBeforeSaving":
      "Adicione texto ou uma imagem antes de salvar.",
    "editor.postSaved": "Post salvo.",
    "editor.postUpdated": "Post atualizado.",
    "editor.postPublished": "Post publicado.",
    "editor.pageSaved": "Página salva.",
    "editor.pageUpdated": "Página atualizada.",
    "editor.pagePublished": "Página publicada.",
    "editor.saveFailed": "Falha ao salvar",
    "editor.savedAt": "Salvo {time}",
    "editor.unsavedChanges": "Alterações não salvas",
    "editor.draft": "Rascunho",
    "editor.backPosts": "← Posts",
    "editor.backPages": "← Páginas",

    "delete.button": "Excluir",
    "delete.deleting": "Excluindo...",
    "delete.success": "Post excluído.",
    "delete.error": "Falha ao excluir",
    "delete.confirmUntitled":
      "Excluir este post? Esta ação não pode ser desfeita.",
    "delete.confirmTitled":
      "Excluir \"{title}\"? Esta ação não pode ser desfeita.",

    "email.newsletter.receivingBecause":
      "Você está recebendo isto porque se inscreveu em {siteTitle}.",
    "email.newsletter.unsubscribe": "Cancelar inscrição instantaneamente",
    "email.reset.subject": "Redefina sua senha do Banany Blog",
    "email.reset.body":
      "Abra este link para redefinir sua senha (válido por 1 hora):",
  },
};

export function normalizeLocale(locale: string | null | undefined): Locale {
  return locale === "pt" ? "pt" : "en";
}

export function intlLocale(locale: string | null | undefined): "en-US" | "pt-BR" {
  return normalizeLocale(locale) === "pt" ? "pt-BR" : "en-US";
}

export function htmlLang(locale: string | null | undefined): "en" | "pt-BR" {
  return normalizeLocale(locale) === "pt" ? "pt-BR" : "en";
}

export function t(locale: string | null | undefined, key: string): string {
  const loc = normalizeLocale(locale);
  return messages[loc][key] ?? messages.en[key] ?? key;
}

export function tm(
  locale: string | null | undefined,
  key: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    t(locale, key),
  );
}
