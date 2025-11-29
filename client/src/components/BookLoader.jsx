import React from 'react';
import './BookLoader.css';

const BookLoader = () => {
  return (
    <div className="book-loader-wrapper">
      <div className="book">
        <div className="book__pg-shadow" />
        <div className="book__pg" />
        <div className="book__pg book__pg--2" />
        <div className="book__pg book__pg--3" />
        <div className="book__pg book__pg--4" />
        <div className="book__pg book__pg--5" />
      </div>
    </div>
  );
};

export default BookLoader;
