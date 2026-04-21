import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import css from './MessageInput.module.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { conversationProps } from '@/types/apiTypes';
import { useWebSocketChat } from '@/contexts/WebSocketChatProvider';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useUser } from '@/contexts/UserContext';
import { SendHorizontal, SmilePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';


interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  conversationData: conversationProps | null;
}

const MessageInput = ({
  conversationData,
  onSendMessage,
  onTyping,
}: MessageInputProps) => {

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const buttonEmojiRef = useRef<HTMLButtonElement>(null);
  const { user } = useUser();
  const { toggleBlockStatus } = useWebSocketChat();
  const { sendMessage } = useWebSocket();
  const [isInviteDisabled, setIsInviteDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;
  const { t } = useTranslation();


  const handleClickOutside = (event: MouseEvent) => {
    if (
      emojiRef.current &&
      !emojiRef.current.contains(event.target as Node) &&
      buttonEmojiRef.current &&
      !buttonEmojiRef.current.contains(event.target as Node)
    ) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendInvite = (username: string) => {

    if (isInviteDisabled) return;
    sendMessage({
      event: 'game_invite',
      from: user?.username,
      to: username,
    });

    setIsInviteDisabled(true);
    setTimeLeft(10);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isInviteDisabled && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isInviteDisabled) {
      setIsInviteDisabled(false);
    }

    return () => clearInterval(timer);
  }, [isInviteDisabled, timeLeft]);

  const handleTypingDebounced = useCallback(
    debounce((isTyping: boolean) => {
      onTyping(isTyping);
    }, 2000),
    [onTyping]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      setMessage(newValue);
      setCharCount(newValue.length);
    }
    if (e.target) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    if (!message.trim()) {
      onTyping(true);
    }
    handleTypingDebounced(false);
  };


  const handleInputBlur = () => {
    if (!message.trim()) {
      onTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      onTyping(false);
    }
    setMessage('');
    setIsFlying(true);
    setShowEmojiPicker(false);
    setCharCount(0);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setTimeout(() => setIsFlying(false), 500);
  };

  const handleBlock = async (activeConversation: conversationProps) => {
    if (user?.id !== undefined) {
      toggleBlockStatus(activeConversation.id, user.id, activeConversation.user_id, false);

    }
  };

  const handleEmojiClick = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    return () => {
      handleTypingDebounced.cancel();
    };
  }, [handleTypingDebounced]);

  if (conversationData?.block_status == 'blocker' || conversationData?.block_status == 'blocked') {
    return (
      <div className={css.messageBlock}>
        {conversationData?.block_status === 'blocker'
          ? <h2>{t('messageInput.block.blocker')}</h2>
          : <h2>{t('messageInput.block.blocked')}</h2>
        }

        <p>{t('messageInput.block.description')}</p>
        {conversationData?.block_status === 'blocker' && (
          <button
            className={css.buttonUnblock}
            onClick={() => handleBlock(conversationData)}
          >
            {t('messageInput.block.unblockBtn')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={css.messageInputWrapper}>
      {showEmojiPicker && (
        <div ref={emojiRef} className={css.emojiPicker}>
          <Picker data={data} onEmojiSelect={handleEmojiClick} />
        </div>
      )}

      <div className={css.messageInputContainer}>
        <textarea
          ref={textareaRef}
          placeholder={t('messageInput.placeholder')}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          className={css.textarea}
          rows={1}
        />
        <div className={css.characterCounter}>
          {charCount}/{maxChars}
        </div>

        <div className={css.buttonAndSend}>
          <div className={css.EmojiAndInvite}>
            <button
              ref={buttonEmojiRef}
              className={css.buttonEmoji}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Open emoji picker"
            >
              <SmilePlus size={25}/>
            </button>

            <button
              className={`${css.buttonClip} ${isInviteDisabled ? css.disabled : ''}`}
              aria-label="Invite game"
              onClick={() => handleSendInvite(conversationData!.name)}
            >
              {isInviteDisabled
                ? <span className={css.cooldownTimer}>{timeLeft}s</span>
                : <img src="/icons/chat/inviteBlack.svg" alt="Invite" />
              }
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            className={`${css.sendButton} ${
              isFlying ? css.animateIcon : ''
            } ${!message.trim() ? css.disabled : ''}`}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <SendHorizontal />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
