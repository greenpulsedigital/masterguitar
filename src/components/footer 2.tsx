export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MasterGuitar. Tous droits réservés.</p>
          {/* Links placeholder - to be implemented in future stories */}
        </div>
      </div>
    </footer>
  );
}
