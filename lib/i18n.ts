export type Locale = "en" | "pt";

export const DEFAULT_LOCALE: Locale = "en";

const messages: Record<
  Locale,
  Record<string, string>
> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.posts": "Posts",
    "nav.pages": "Pages",
    "nav.media": "Media",
    "nav.appearance": "Appearance",
    "nav.settings": "Settings",
    "nav.home": "Home",
    "nav.archive": "Archive",
    "footer.madeWith": "Made with",
    "footer.tagline": "— a small home for small-web writing.",
    "login.title": "Sign in",
    "setup.title": "Welcome to Banany Blog",
    "newsletter.placeholder": "Your email",
    "newsletter.button": "Subscribe",
    "newsletter.success": "Thanks — check your inbox.",
  },
  pt: {
    "nav.dashboard": "Painel",
    "nav.posts": "Posts",
    "nav.pages": "Páginas",
    "nav.media": "Mídia",
    "nav.appearance": "Aparência",
    "nav.settings": "Configurações",
    "nav.home": "Início",
    "nav.archive": "Arquivo",
    "footer.madeWith": "Feito com",
    "footer.tagline": "— um lar pequeno para escrita small-web.",
    "login.title": "Entrar",
    "setup.title": "Bem-vindo ao Banany Blog",
    "newsletter.placeholder": "Seu email",
    "newsletter.button": "Inscrever",
    "newsletter.success": "Obrigado — verifique seu email.",
  },
};

export function t(locale: string | null | undefined, key: string): string {
  const loc = locale === "pt" ? "pt" : "en";
  return messages[loc][key] ?? messages.en[key] ?? key;
}
