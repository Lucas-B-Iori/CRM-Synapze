import { ImportSpreadsheet } from "../kanban/ImportSpreadsheet";

export function Header() {
    return (
        <header className="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md flex justify-between items-center px-8 text-white shrink-0 sticky top-0 z-10">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
                Prospecting Pipeline
            </h1>
            <ImportSpreadsheet />
        </header>
    );
}
