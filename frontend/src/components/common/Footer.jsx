/**
 * Footer — simple app footer
 * Used by: LoginPage, RegisterPage, OTPPage (auth pages only)
 * Not used on dashboard/inner pages (those use BottomNav)
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <p className="app-footer-text">
        © {new Date().getFullYear()} EcoSankalan &nbsp;·&nbsp; NSUT CPVS-STP 2025-26
      </p>
      <p className="app-footer-sub">
        Built with 💚 for a circular future
      </p>
    </footer>
  );
}
