import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    if (!supportOpen) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSupportOpen(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [supportOpen]);

  return (
    <footer className="app-footer">
      <div className="footer-shell">
        <div className="footer-brand-row">
          <h2 className="footer-brand mb-0">Eventra</h2>
          <p className="footer-copy footer-copy-inline mb-0">
            Manage Events & Tasks Easily with one focused portal for campus,
            clubs, and team collaboration.
          </p>
        </div>

        <div className="footer-links-block">
          <span className="footer-section-title">Support / Help</span>
          <nav className="footer-link-list" aria-label="Footer support links">
            <div className="footer-support-popover-wrap">
              <button
                type="button"
                className="footer-link footer-link-button"
                onClick={() => setSupportOpen(true)}
              >
                Support
              </button>
              {supportOpen ? (
                <div className="footer-support-popover" role="status">
                  Thanks for reaching out
                </div>
              ) : null}
            </div>
            <Link to="/profile" className="footer-link">
              Account Settings
            </Link>
          </nav>
        </div>

        <div className="footer-links-block">
          <span className="footer-section-title">Social Links</span>
          <div className="footer-link-list" aria-label="Footer social links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="footer-link"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-meta-block">
          <span className="footer-status-pill">
            Support available for your next event
          </span>
          <div className="footer-contact-list">
            <a className="footer-contact-item" href="tel:9838693305">
              9838693305
            </a>
            <a
              className="footer-contact-item"
              href="mailto:adityagupta983869@gmail.com"
            >
              adityagupta983869@gmail.com
            </a>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-meta footer-copyright mb-0">
            &copy; {year} Eventra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
