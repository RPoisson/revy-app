"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StudioLogo } from "@/components/StudioLogo";
import { useProjects } from "@/context/ProjectContext";

const designConceptPaths = [
  { href: "/designconcept#executive-summary", label: "Summary" },
  { href: "/designconcept#moodboards", label: "Moodboards" },
  { href: "/designconcept#decision-detail", label: "Decision Detail" },
];

function NavLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`text-sm font-medium tracking-wide transition-colors ${
        active ? "text-black" : "text-black/70 hover:text-black"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const { projects, currentProject, currentProjectId, setCurrentProjectId } = useProjects();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [designConceptOpen, setDesignConceptOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const quizHref = currentProjectId ? "/quiz/scope" : "/create-project";
  const isQuizActive = pathname === "/" || pathname?.startsWith("/quiz");

  const isDesignConceptActive =
    pathname?.startsWith("/designconcept");

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      setLoggedIn(res.ok);
    } catch {
      setLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    window.location.href = "/";
  };

  // Don't show nav on login page
  if (pathname === "/login") return null;

  return (
    <header className="bg-white border-b border-black/5">
      {/* Top white space — marketing style like studiorevy.com */}
      <div className="h-4 md:h-6" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          {/* Logo — left justified */}
          <Link href="/" className="flex-shrink-0" aria-label="Rêvy home">
            <StudioLogo size="default" className="text-black" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href={quizHref}
              className={`text-sm font-medium tracking-wide transition-colors ${
                isQuizActive ? "text-black" : "text-black/70 hover:text-black"
              }`}
            >
              Project Quiz
            </Link>
            <NavLink href="/brief">Project Plan</NavLink>

            {/* Design Details with sub-links */}
            <div
              className="relative"
              onMouseEnter={() => setDesignConceptOpen(true)}
              onMouseLeave={() => setDesignConceptOpen(false)}
            >
              <div className="flex items-center gap-1">
                <Link
                  href="/designconcept"
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    isDesignConceptActive ? "text-black" : "text-black/70 hover:text-black"
                  }`}
                >
                  Design Details
                </Link>
                <button
                  type="button"
                  className="flex items-center justify-center"
                  aria-label="Open Design Details sections"
                  aria-expanded={designConceptOpen}
                  aria-haspopup="true"
                  onClick={() => setDesignConceptOpen((open) => !open)}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${designConceptOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {designConceptOpen && (
                <div className="absolute top-full left-0 pt-1 z-20">
                  <div className="bg-white rounded-lg border border-black/10 shadow-lg py-2 min-w-[200px]">
                    {designConceptPaths.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="block px-4 py-2 text-sm text-black/80 hover:bg-black/5 hover:text-black"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/sourcelist">Source List</NavLink>

            {/* Project switcher */}
            <div
              className="relative"
              onMouseEnter={() => setProjectDropdownOpen(true)}
              onMouseLeave={() => setProjectDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black border border-black/10 rounded-full pl-4 pr-3 py-2 min-w-[160px] justify-between"
                aria-expanded={projectDropdownOpen}
                aria-haspopup="true"
              >
                <span className="truncate">
                  {currentProject ? currentProject.name : "Select project"}
                </span>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {projectDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 z-20">
                  <div className="bg-white rounded-lg border border-black/10 shadow-lg py-2 min-w-[220px] max-h-[280px] overflow-y-auto">
                    {projects.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-black/50">
                        No projects yet
                      </div>
                    ) : (
                      projects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setCurrentProjectId(p.id);
                            setProjectDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                            currentProjectId === p.id ? "bg-black/5 font-medium text-black" : "text-black/80 hover:bg-black/5"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))
                    )}
                    <Link
                      href="/create-project"
                      className="block px-4 py-2 text-sm text-black/70 hover:bg-black/5 border-t border-black/5 mt-1"
                      onClick={() => setProjectDropdownOpen(false)}
                    >
                      + Create new project
                    </Link>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-black/60 hover:bg-black/5 border-t border-black/5 mt-1"
                    >
                      Manage projects →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/account">Account</NavLink>

            {loggedIn === true ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-black/70 hover:text-black"
              >
                Log out
              </button>
            ) : (
              <NavLink href="/login">Log in</NavLink>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-black/70 hover:bg-black/5"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href={quizHref}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-black/80"
            >
              Project Quiz
            </Link>
            <Link
              href="/brief"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-black/80"
            >
              Project Plan
            </Link>
            <div className="py-2">
              <Link
                href="/designconcept"
                onClick={() => setMobileOpen(false)}
                className="block text-xs font-semibold uppercase tracking-wider text-black/50 mb-2"
              >
                Design Details
              </Link>
              <div className="pl-3 space-y-1">
                {designConceptPaths.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-sm text-black/70"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/sourcelist"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-black/80"
            >
              Source List
            </Link>
            <div className="pt-2 border-t border-black/10">
              <span className="block text-xs font-semibold uppercase tracking-wider text-black/50 mb-2">
                Project
              </span>
              <p className="text-sm text-black/70 py-1">
                {currentProject ? currentProject.name : "No project selected"}
              </p>
              <Link
                href="/create-project"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-black/80"
              >
                + Create new project
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-black/80"
              >
                Account & projects →
              </Link>
            </div>
            <div className="pt-2 border-t border-black/10">
              {loggedIn === true ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="block py-2 text-sm font-medium text-black/80 w-full text-left"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm font-medium text-black/80"
                >
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
