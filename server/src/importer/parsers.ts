import yaml from "js-yaml";

type ParseFn = (text: string) => unknown;
const PARSERS: Record<string, ParseFn> = {
  yaml: (text) => yaml.load(text),
  yml: (text) => yaml.load(text),
  json: (text) => JSON.parse(text) as unknown,
};

export function getAllowedFileExtensions(): string[] {
  return Object.keys(PARSERS);
}

export function getParser(ext: string): ParseFn | null {
  return PARSERS[ext.toLowerCase()] || null;
}
