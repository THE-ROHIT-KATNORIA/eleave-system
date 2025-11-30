import { memo } from 'react';
import './Footer.css';

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>&copy; {currentYear} E-Leave Management System. All rights reserved.</p>
      <p className="footer-contact">
        <a href="mailto:therohitkatnoria@gmail.com" className="footer-email">
          <svg viewBox="0 0 24 24" fill="currentColor" className="gmail-icon">
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
          </svg>
          therohitkatnoria@gmail.com
        </a>
        <span className="footer-divider">|</span>
        <a href="mailto:therohitkatnoria@gmail.com?subject=Feedback for E-Leave System" className="footer-feedback">
          Send Feedback
        </a>
      </p>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
