import css from './GameModeScreen.module.css';

import { Controller, GameScreens } from '../../../../types/types';
import { useState } from 'react';
import OptionsScreen from '../OptionsScreen/OptionsScreen';
import GameButton from '../GameButton/GameButton';
import { useTranslation } from 'react-i18next';

const GameModeScreen = ({
  onNext,
  SetIsOnePlayerMode,
  SwitchSound,
  sound,
  setController,
  setWinningScore,
  controller,
  winningScore,
}: {
  onNext: (nextScreen: GameScreens) => void;
  SetIsOnePlayerMode: React.Dispatch<React.SetStateAction<boolean>>;
  SwitchSound: React.Dispatch<React.SetStateAction<boolean>>;
  sound: boolean;
  setController: React.Dispatch<React.SetStateAction<Controller>>;
  setWinningScore: React.Dispatch<React.SetStateAction<number>>;
  controller: Controller;
  winningScore: number;
}) => {
  const [options, openOptions] = useState(false);
  const { t } = useTranslation();


  const handleClose = () => openOptions(false);

  if (options)
    return (
      <OptionsScreen
        onClose={handleClose}
        sound={sound}
        SwitchSound={SwitchSound}
        setController={setController}
        setWinningScore={setWinningScore}
        controller={controller}
        winningScore={winningScore}
      ></OptionsScreen>
    );

  return (
    <div id="gameModeScreen" className={css.gameScreenDiv}>
      <GameButton
        onClick={() => {
          onNext('difficulty');
          SetIsOnePlayerMode(true);
        }}
      >
        {t('game.localGame.onePlayer')}
      </GameButton>
      <GameButton
        onClick={() => {
          onNext('difficulty');
          SetIsOnePlayerMode(false);
        }}
      >
        {t('game.localGame.twoPlayer')}
      </GameButton>

      <div
        id="optionsButton"
        className={css.optionsButton}
        onClick={() => openOptions((o) => !o)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 15.7881C8.35601 15.7881 6.21257 13.6448 6.21257 10.9992C6.21257 8.35526 8.35601 6.21186 11 6.21186C13.644 6.21186 15.7874 8.35526 15.7874 10.9992C15.7874 13.6448 13.644 15.7881 11 15.7881ZM20.5038 8.51938H18.9049C18.7572 8.04837 18.5647 7.59868 18.339 7.16705L19.4732 6.033C20.0576 5.44874 20.0576 4.50014 19.4734 3.91588L18.083 2.52578C17.4986 1.94152 16.5514 1.94152 15.9671 2.52578L14.8328 3.65983C14.4018 3.43499 13.9507 3.24297 13.4792 3.09362V1.49514C13.4792 0.669626 12.8093 0 11.983 0H10.0168C9.19051 0 8.52061 0.669626 8.52061 1.49514V3.09362C8.04929 3.24297 7.59815 3.43499 7.1672 3.65983L6.03286 2.52578C5.44863 1.94152 4.50138 1.94152 3.91698 2.52578L2.52664 3.91588C1.94241 4.50014 1.94241 5.44874 2.52681 6.033L3.66098 7.16705C3.43533 7.59868 3.24283 8.04837 3.09513 8.51938H1.49619C0.669898 8.51938 0 9.19061 0 10.0161V11.9823C0 12.8094 0.669898 13.479 1.49619 13.479H3.09513C3.24283 13.95 3.43533 14.4014 3.66098 14.833L2.52681 15.967C1.94241 16.5513 1.94241 17.4983 2.52664 18.0825L3.91698 19.4726C4.50138 20.0585 5.44863 20.0585 6.03286 19.4726L7.1672 18.3385C7.59815 18.565 8.04929 18.757 8.52061 18.9047V20.5033C8.52061 21.3304 9.19051 22 10.0168 22H11.983C12.8093 22 13.4792 21.3304 13.4792 20.5033V18.9047C13.9507 18.757 14.4018 18.565 14.8328 18.3385L15.9671 19.4726C16.5514 20.0585 17.4986 20.0585 18.083 19.4726L19.4734 18.0825C20.0576 17.4983 20.0576 16.5513 19.4732 15.967L18.339 14.833C18.5647 14.4014 18.7572 13.95 18.9049 13.479H20.5038C21.3301 13.479 22 12.8094 22 11.9823V10.0161C22 9.19061 21.3301 8.51938 20.5038 8.51938Z"
            fill="#F2F2F2"
          />
        </svg>
      </div>
    </div>
  );
};

export default GameModeScreen;
