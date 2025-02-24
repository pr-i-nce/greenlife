import React, { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [groupData, setGroupData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    }, []);

  return (
    <GlobalContext.Provider value={{ groupData, updateGroupData, accessToken, updateAccessToken }}>
      {children}
    </GlobalContext.Provider>
  );
};
