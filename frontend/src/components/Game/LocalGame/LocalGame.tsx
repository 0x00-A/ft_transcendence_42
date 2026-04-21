import { useState } from 'react';
import css from './LocalGame.module.css';
import GameModeScreen from '../components/GameModeScreen/GameModeScreen';

import { Controller, GameScreens } from '../../../types/types';
import Pong from '../components/Pong/Pong';
import EndGameScreen from '../components/EndGameScreen/EndGameScreen';
import DifficultyScreen from '../../DifficultyScreen/DifficultyScreen';
import ReturnBack from '../components/ReturnBack/ReturnBack';
import PlayerMatchupBanner from './PlayerMatchupBanner'

const LocalGame = ({ onReturn }: { onReturn?: () => void }) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreens>('mode'); // Starting screen is 'mode'
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [isOnePlayerMode, SetIsOnePlayerMode] = useState(false);
  const [ballSpeed, setBallSpeed] = useState(5);
  const [paddleSpeed, SetPaddleSpeed] = useState(10);
  const [sound, SwitchSound] = useState(true);
  const [controller, setController] = useState<Controller>('mouse');
  const [winningScore, setWinningScore] = useState(7);
  const [paused, setPaused] = useState(false);

  const handleNextScreen = (nextScreen: GameScreens) => {
    setCurrentScreen(nextScreen);
  };
  const handleRetry = () => {
    setCurrentScreen('game');
    setIsGameOver(false);
  };
  const handleMainMenu = () => {
    setCurrentScreen('mode');
    setIsGameOver(false);
  };
  return (
    <div className={css.container}>
      {currentScreen === 'game' && (
        <PlayerMatchupBanner isOnePlayerMode={isOnePlayerMode} paused={paused} />
      )}
      <div className={css.gameArea}>
        {currentScreen === 'mode' && (
          <GameModeScreen
            onNext={handleNextScreen}
            SetIsOnePlayerMode={SetIsOnePlayerMode}
            SwitchSound={SwitchSound}
            sound={sound}
            setController={setController}
            setWinningScore={setWinningScore}
            controller={controller}
            winningScore={winningScore}
          />
        )}
        {currentScreen === 'difficulty' && (
          <DifficultyScreen
            onNext={handleNextScreen}
            setBallSpeed={setBallSpeed}
            setPaddleSpeed={SetPaddleSpeed}
          />
        )}
        {currentScreen === 'game' && (
          <Pong
            onNext={handleNextScreen}
            isGameOver={isGameOver}
            setIsGameOver={setIsGameOver}
            setIsWinner={setIsWinner}
            isOnePlayerMode={isOnePlayerMode}
            sound={sound}
            ballSpeed={ballSpeed}
            paddleSpeed={paddleSpeed}
            controller={controller}
            winningScore={winningScore}
            paused={paused}
            setPaused={setPaused}
          />
        )}
        {currentScreen === 'end' && (
          <EndGameScreen
            isWinner={isWinner}
            handleRetry={handleRetry}
            handleMainMenu={handleMainMenu}
            isLocalGame={true}
            isOnePlayerMode={isOnePlayerMode}
          />
        )}
      </div>
      <ReturnBack onClick={onReturn} />
    </div>
  );
};

export default LocalGame;
