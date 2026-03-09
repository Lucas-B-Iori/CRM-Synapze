import { Board } from "@/components/kanban/Board";

export default function Home() {
  return (
    <div className="h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
      <Board />
    </div>
  );
}
