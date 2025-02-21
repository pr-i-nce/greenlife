import React, { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [groupData, setGroupData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
    }
    const storedGroup = localStorage.getItem('groupData');
    if (storedGroup) {
      setGroupData(JSON.parse(storedGroup));
    }
  }, []);

  const updateGroupData = (data) => {
    setGroupData(data);
    localStorage.setItem('groupData', JSON.stringify(data));
  };

  const updateAccessToken = (token) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
  };

  return (
    <GlobalContext.Provider value={{ groupData, updateGroupData, accessToken, updateAccessToken }}>
      {children}
    </GlobalContext.Provider>
  );
};
