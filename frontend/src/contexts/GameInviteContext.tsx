// GameInviteContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';

// type GameInvite = {
//   from: string;
//   gameId: string;
//   gameUrl?: string;
// };

type GameInviteContextType = {
  gameInvite: string | null;
  gameAccepted: boolean;
  // sendInvite: (inviteDetails: GameInvite) => void;
  acceptInvite: (gameUrl: string, p1_id: number, p2_id: number) => void;
  setGameAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  player1_id: number | null;
  player2_id: number | null;
};

const GameInviteContext = createContext<GameInviteContextType | undefined>(undefined);

export const GameInviteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameInvite, setGameInvite] = useState<string | null>(null);
  const [gameAccepted, setGameAccepted] = useState<boolean>(false);
  const [player1_id, setPlayer1_id] = useState<number | null>(null);
  const [player2_id, setPlayer2_id] = useState<number | null>(null);

  // const sendInvite = (inviteDetails: GameInvite) => {
  //   setGameInvite(inviteDetails);
  // };

  const acceptInvite = (gameUrl: string, p1_id: number, p2_id: number) => {
    setGameAccepted(true);
    setGameInvite(gameUrl);
    setPlayer1_id(p1_id);
    setPlayer2_id(p2_id);
  };

  return (
    <GameInviteContext.Provider value={{ gameInvite, gameAccepted, setGameAccepted, acceptInvite, player1_id, player2_id }}>
      {children}
    </GameInviteContext.Provider>
  );
};

export const useGameInvite = (): GameInviteContextType => {
  const context = useContext(GameInviteContext);
  if (context === undefined) {
    throw new Error('useGameInvite must be used within a GameInviteProvider');
  }
  return context;
};
