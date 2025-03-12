import React, { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
  const [pages, setPages] = useState({
    all: 1,
    accepted: 1,
    rejected: 1,
  });

  const rowsPerPage = 2; 

  const setPageForTab = (tab, page) => {
    setPages((prev) => ({ ...prev, [tab]: page }));
  };


  const adjustPageForTab = (tab, totalItems) => {
    // Ensure that totalPages is at least 1.
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    setPages((prev) => {
      const currentPage = prev[tab] || 1;
      // If there are no items, reset to page 1.
      if (totalItems === 0) {
        return { ...prev, [tab]: 1 };
      }
      // If the current page is now greater than total pages, update it.
      if (currentPage > totalPages) {
        return { ...prev, [tab]: totalPages };
      }
      return prev;
    });
  };

  return (
    <PaginationContext.Provider value={{ pages, setPageForTab, adjustPageForTab, rowsPerPage }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => useContext(PaginationContext);
