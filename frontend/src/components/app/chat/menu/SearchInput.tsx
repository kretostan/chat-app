import Search from "@/assets/search.svg?react";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="flex items-center px-3.5 py-3 bg-[#191C24] rounded-xl">
      <Search />
      <input
        type="text"
        className="flex-1 ml-3 text-sm outline-none placeholder:text-muted/60"
        style={{ color: "var(--foreground-primary)" }}
        placeholder="Szukaj rozmów, osób i grup"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
