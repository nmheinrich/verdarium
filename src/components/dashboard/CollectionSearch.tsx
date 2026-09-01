import { Search } from "lucide-react";

interface CollectionSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CollectionSearch({
  value,
  onChange,
}: CollectionSearchProps) {
  return (
    <section
      aria-labelledby="collection-search-heading"
      className="mt-6"
    >
      <div className="max-w-xl">
        <p className="metadata-label">Archive lookup</p>

        <h2
          id="collection-search-heading"
          className="mt-2 font-serif text-xl leading-tight text-[var(--color-text-primary)]"
        >
          Search the collection
        </h2>

        <div className="mt-5 flex items-center gap-3 border-b border-[var(--color-border-strong)] pb-2 transition-colors duration-[var(--transition-base)] focus-within:border-[var(--color-botanical)]">
          <Search
            aria-hidden="true"
            size={10}
            className="shrink-0 italic text-[var(--color-text-muted)]"
          />

          <label
            htmlFor="collection-search"
            className="visually-hidden"
          >
            Search specimens
          </label>

          <input
            id="collection-search"
            type="search"
            value={value}
            onChange={(event) =>
              onChange(event.target.value)
            }
            placeholder="Search the collection"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-1 text-xs italic text-[var(--color-text-primary)] outline-none placeholder:italic placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>
    </section>
  );
}