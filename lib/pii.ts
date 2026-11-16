// Strip personal details before the free text goes anywhere (including the AI).
export function scrubPII(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/(\+?\d[\d\s-]{7,}\d)/g, "[phone]")
    .replace(/\b(my name is|i am called|mera naam|naam hai)\s+[^\s,.!?]+(\s+[A-Z][a-z]+)?/gi, "$1 [name]")
    .slice(0, 500);
}
