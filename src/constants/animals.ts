const modules = import.meta.glob<string>("../assets/images/animal/*.svg", {
  query: "?url",
  import: "default",
  eager: true,
});

export const ANIMALS: { id: string; url: string }[] = Object.entries(modules)
  .map(([path, url]) => ({
    id: path.replace(/.*\/(.+)\.svg$/, "$1"),
    url,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

export const ANIMAL_URL_MAP: Record<string, string> = Object.fromEntries(
  ANIMALS.map(({ id, url }) => [id, url]),
);
