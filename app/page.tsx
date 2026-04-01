import { ArenaGame } from "@/Components/arena/ArenaGame";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-stretch justify-start overflow-x-hidden sm:items-center">
      <ArenaGame />
    </div>
  );
}
