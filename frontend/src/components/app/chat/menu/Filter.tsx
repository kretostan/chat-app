export default function Filter() {
  return (
    <div className="flex gap-2 text-sm">
      <button
        type="button"
        className="px-3.25 py-2 bg-secondary text-black rounded-2xl"
      >
        Wszystkie
      </button>
      <button type="button" className="px-3.25 py-2 bg-gray-800 rounded-2xl">
        Prywatne
      </button>
      <button type="button" className="px-3.25 py-2 bg-gray-800 rounded-2xl">
        Grupy
      </button>
    </div>
  );
}
