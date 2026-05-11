import type { AvatarPerson } from "@/components/layout/primitives/AvatarStack";

export function hashToHue(input: string) {
  let hue = 0;
  for (let index = 0; index < input.length; index++) hue = (hue * 31 + input.charCodeAt(index)) >>> 0;
  return hue % 360;
}

export function getInitials(label: string) {
  const namePart = label.split("(")[0]?.trim() || label.trim();
  const parts = namePart.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "U";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return (first + (second || "")).toUpperCase();
}

export function getUniquePeople(people: AvatarPerson[]) {
  const seen = new Set<string>();
  const uniquePeople: AvatarPerson[] = [];
  for (const person of people) {
    const key = person.id || person.label;
    if (seen.has(key)) continue;
    seen.add(key);
    uniquePeople.push({ id: key, label: person.label });
  }
  return uniquePeople;
}

