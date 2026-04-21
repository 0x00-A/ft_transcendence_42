import { useTranslation } from 'react-i18next';
import { GameScreens } from '../../types/types';
import GameButton from '../Game/components/GameButton/GameButton';
import css from './DifficultyScreen.module.css';

const DifficultyScreen = ({
  onNext,
  setBallSpeed,
  setPaddleSpeed,
}: {
  onNext: (nextScreen: GameScreens) => void;
  setBallSpeed: React.Dispatch<React.SetStateAction<number>>;
  setPaddleSpeed: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation();

  return (
    <div className={css.gameScreenDiv}>
      <p className={css.title}>{t('game.localGame.DifficultyScreen.Title')}</p>
      <GameButton
        onClick={() => {
          onNext('game');
          setBallSpeed(4);
          setPaddleSpeed(5);
        }}
      >
        {t('game.localGame.DifficultyScreen.DifficultyOptions.Easy')}
      </GameButton>
      <GameButton
        onClick={() => {
          onNext('game');
          setBallSpeed(6);
          setPaddleSpeed(8);
        }}
      >
{t('game.localGame.DifficultyScreen.DifficultyOptions.Normal')}
      </GameButton>
      <GameButton
        onClick={() => {
          onNext('game');
          setBallSpeed(8);
          setPaddleSpeed(10);
        }}
      >
        {t('game.localGame.DifficultyScreen.DifficultyOptions.Hard')}
      </GameButton>
    </div>
  );
};

export default DifficultyScreen;
