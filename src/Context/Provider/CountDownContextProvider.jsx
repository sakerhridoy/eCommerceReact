import React, { createContext, useContext } from 'react';
import { useTimer } from 'react-timer-hook';

// Create context
export const CountDownContext = createContext();

const CountDownContextProvider = ({ children }) => {
  const expiryTimestamp = new Date('2025-12-31T23:59:00');

  const timerValue = useTimer({ expiryTimestamp });

  return (
    <CountDownContext.Provider value={timerValue}>
      {children}
    </CountDownContext.Provider>
  );
};

// Custom hook
export const useCountdown = () => useContext(CountDownContext);

export default CountDownContextProvider;
