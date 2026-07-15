import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm mt-auto">
      <p>&copy; {new Date().getFullYear()} Tutor de Aprendizado &mdash; POC Inteligência Artificial Generativa</p>
    </footer>
  );
}

export default Footer;
