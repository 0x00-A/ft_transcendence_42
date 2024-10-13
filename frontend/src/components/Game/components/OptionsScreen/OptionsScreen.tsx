import CloseButton from '../CloseButton/CloseButton';
import css from './OptionsScreen.module.css';
import GameButton from '../GameButton/GameButton';
import { Controller } from '../../../../types/types';

interface OptionsScreenProps {
  onClose: () => void;
  SwitchSound: React.Dispatch<React.SetStateAction<boolean>>;
  sound: boolean;
  setController: React.Dispatch<React.SetStateAction<Controller>>;
  setWinningScore: React.Dispatch<React.SetStateAction<number>>;
  controller: Controller;
  winningScore: number;
}

const OptionsScreen = ({
  onClose,
  sound,
  SwitchSound,
  setController,
  setWinningScore,
  controller,
  winningScore,
}: OptionsScreenProps) => {
  return (
    <div className={css.gameScreenDiv}>
      <CloseButton onClose={onClose} />
      <div className={css.soundButtonWrapper}>
        <button
          // style={
          //   sound
          //     ? { backgroundColor: 'lightgray' }
          //     : { backgroundColor: 'transparent' }
          // }
          id="soundButton"
          className={`${css.soundButton} ${sound ? css.soundOn : css.soundOff}`}
          onClick={() => {
            SwitchSound((s) => !s);
          }}
          aria-label="Toggle Sound"
        ></button>
        <label htmlFor="soundButton" className={css.soundButtonLabel}>
          SOUND
        </label>
      </div>
      <div className={css.winningScoreWrapper}>
        <p className={css.title}>Set Winning Score</p>
        <div className={css.scores}>
          <GameButton
            className={`${winningScore === 7 ? css.on : css.off} ${css.scoreButton}`}
            onClick={() => {
              setWinningScore(7);
            }}
          >
            7
          </GameButton>
          <GameButton
            className={`${winningScore === 11 ? css.on : css.off} ${css.scoreButton}`}
            onClick={() => {
              setWinningScore(11);
            }}
          >
            11
          </GameButton>
          <GameButton
            className={`${winningScore === 21 ? css.on : css.off} ${css.scoreButton}`}
            onClick={() => {
              setWinningScore(21);
            }}
          >
            21
          </GameButton>
        </div>
      </div>
      <div className={css.controllerTypeWrapper}>
        <p className={css.title}>Set Controller Type</p>
        <div className={css.controlls}>
          <GameButton
            className={`${css.controllButtons} ${controller === 'mouse' ? css.on : css.off}`}
            onClick={() => setController('mouse')}
          >
            Mouse
          </GameButton>
          <GameButton
            className={`${css.controllButtons} ${controller === 'keyboard' ? css.on : css.off}`}
            onClick={() => setController('keyboard')}
          >
            Keyboard
          </GameButton>
        </div>
      </div>
    </div>
  );
};

export default OptionsScreen;
