const residentImages = import.meta.glob("../assets/images/resident-*.png", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

export function residentImage(id: number): string {
  return residentImages[`../assets/images/resident-${id}.png`] ?? "";
}
