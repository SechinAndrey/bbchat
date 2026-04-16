// ─── Environment ─────────────────────────────────────────────────────────────

const ENV = {
  rich:
    process.stderr.isTTY === true &&
    !process.env["NO_COLOR"] &&
    process.env["TERM"] !== "dumb",
  nerdFonts: Boolean(process.env["NERD_FONTS"]),
} as const;

// ─── ANSI ─────────────────────────────────────────────────────────────────────

const A = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[97m",
  black: "\x1b[30m",
  bgGray: "\x1b[100m",
  bgYellow: "\x1b[43m",
  bgGreen: "\x1b[102m",
} as const;

// ─── Icons ────────────────────────────────────────────────────────────────────

export const ICONS = ENV.nerdFonts
  ? {
      ok: "\uf00c",
      fail: "\uf00d",
      warn: "\uf071",
      step: "\uf0da",
      item: "\uf111",
      next: "\uf061",
      branch: "\ue725",
      fileChanged: "\udb82\ude4b",
      fileDone: "\udb80\ude16",
    }
  : {
      ok: "✓",
      fail: "✗",
      warn: "⚠",
      step: "◆",
      item: "·",
      next: "→",
      branch: "branch:",
      fileChanged: "±",
      fileDone: "file:",
    };

// ─── Primitives ───────────────────────────────────────────────────────────────

function paint(seq: string, text: string): string {
  return ENV.rich ? `${seq}${text}${A.reset}` : text;
}

function out(text: string): void {
  process.stderr.write(`${text}\n`);
}

function rule(char: string): string {
  const width = Math.min(process.stderr.columns ?? 66, 80);
  return char.repeat(width);
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeTone = "muted" | "success";

const BADGE_MAP: Record<BadgeTone, { bg: string; fg: string }> = {
  muted: { bg: A.bgYellow, fg: A.black },
  success: { bg: A.bgGreen, fg: A.black },
};

function badge(text: string, tone: BadgeTone): string {
  if (!ENV.rich) return text;
  const { bg, fg } = BADGE_MAP[tone];
  return `${bg}${fg} ${text} ${A.reset}`;
}

// ─── Level 1: Banner ─────────────────────────────────────────────────────────

export type BannerMeta = {
  from?: string;
  to?: string;
  version?: string;
  branch?: string;
};

export function tuiBanner(
  title: string,
  subtitle?: string,
  meta?: BannerMeta,
): void {
  const bar = paint(A.dim, rule("═"));
  const label = paint(A.bold, title.toUpperCase());
  const sub = subtitle ? paint(A.dim, `  ·  ${subtitle}`) : "";
  out("");
  out(bar);
  out(`  ${label}${sub}`);

  if (meta) {
    const parts: string[] = [];
    if (meta.from && meta.to) {
      parts.push(
        `${badge(meta.from, "muted")}  ${paint(A.dim, ICONS.next)}  ${badge(meta.to, "success")}`,
      );
    } else if (meta.version) {
      parts.push(badge(meta.version, "muted"));
    }
    if (meta.branch) {
      parts.push(paint(A.dim, `${ICONS.branch}  ${meta.branch}`));
    }
    if (parts.length > 0) {
      out(`  ${parts.join("   ")}`);
    }
  }

  out(bar);
}

// ─── Level 2: Section ─────────────────────────────────────────────────────────

export function tuiStep(title: string): void {
  out("");
  out(`  ${paint(A.bold + A.cyan, `${ICONS.step} ${title}`)}`);
}

// ─── Level 3: Status ──────────────────────────────────────────────────────────

type Tone = "success" | "warning" | "danger" | "accent" | "muted";

const TONE_MAP: Record<Tone, { seq: string; icon: string }> = {
  success: { seq: A.green, icon: ICONS.ok },
  danger: { seq: A.red, icon: ICONS.fail },
  warning: { seq: A.yellow, icon: ICONS.warn },
  accent: { seq: A.cyan, icon: ICONS.step },
  muted: { seq: A.dim, icon: ICONS.item },
};

export function tuiStatus(message: string, tone: Tone, icon?: string): void {
  const { seq, icon: defaultIcon } = TONE_MAP[tone];
  out(`    ${paint(A.bold + seq, icon ?? defaultIcon)}  ${message}`);
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function tuiList(items: string[]): void {
  for (const item of items) {
    out(`      ${paint(A.dim, ICONS.item)}  ${item}`);
  }
}

// ─── Final state ──────────────────────────────────────────────────────────────
// Every run ends in exactly one of these. Never silent.

export function tuiDone(message: string, next?: string): void {
  out("");
  out(`  ${paint(A.bold + A.green, `${ICONS.ok}  ${message}`)}`);
  if (next) {
    out(`     ${paint(A.dim, `${ICONS.next} ${next}`)}`);
  }
  out("");
}

export function tuiFail(message: string): void {
  out("");
  out(`  ${paint(A.bold + A.red, `${ICONS.fail}  ${message}`)}`);
  out("");
}
