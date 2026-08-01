export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">MasterGuitar</span>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          {/* Navigation placeholder - to be implemented in future stories */}
        </nav>
      </div>
    </header>
  );
}
