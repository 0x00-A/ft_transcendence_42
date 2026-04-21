import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DoorOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LeaveTournamentButton = ({
  onLeaveTournament,
}: {
  onLeaveTournament: () => void;

}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  const handleLeaveTournament = () => {
    // Add your tournament leaving logic here
    // console.log('Left tournament');
    onLeaveTournament();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className={`
            flex items-center gap-2 px-4 py-2
            bg-gradient-to-r from-red-500 to-red-600
            hover:from-red-600 hover:to-red-700
            text-white rounded-lg shadow-lg
            transition-all duration-300 ease-in-out
            transform ${isHovered ? 'scale-105' : 'scale-100'}
            hover:shadow-red-500/25 hover:shadow-xl
            font-medium
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <DoorOpen
            className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
            size={20}
          />
          {t('game.remoteTournament.leaveTournamentButton.leaveTournament')}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-gray-900 border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">
          {t('game.remoteTournament.leaveTournamentButton.leaveConfirmationTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
          {t('game.remoteTournament.leaveTournamentButton.leaveConfirmationDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700">
            {t('game.remoteTournament.leaveTournamentButton.stayButton')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white border-0"
            onClick={handleLeaveTournament}
          >
            {t('game.remoteTournament.leaveTournamentButton.leaveButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveTournamentButton;