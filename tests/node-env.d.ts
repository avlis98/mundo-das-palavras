declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  export function statSync(path: string): { size: number };
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
}

declare const process: {
  cwd(): string;
};
