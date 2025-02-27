import React, { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
  const [pages, setPages] = useState({
    all: 1,
    accepted: 1,
    rejected: 1,
  });

  const rowsPerPage = 20; 

  const setPageForTab = (tab, page) => {
    setPages((prev) => ({ ...prev, [tab]: page }));
  };

  return (
    <PaginationContext.Provider value={{ pages, setPageForTab, rowsPerPage }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => useContext(PaginationContext);
