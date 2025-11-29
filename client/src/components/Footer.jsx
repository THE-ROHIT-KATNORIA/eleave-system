import { memo } from 'react';
import './Footer.css';

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>&copy; {currentYear} E-Leave Management System. All rights reserved.</p>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
