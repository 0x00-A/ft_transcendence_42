import React from 'react';
import css from './MessageArea.module.css';

interface MessageProps {
  name: string;
  content: string;
  sender: boolean;
  avatar: string;
  time: string;
}

const Message: React.FC<MessageProps> = ({
  content,
  sender,
  avatar,
  time,
  name,
}) => {
  return (
    <div
      className={`${css.messageWrapper} ${sender ? css.sender : css.receiver}`}
    >
      {!sender && <img src={avatar} alt="avatar" className={css.avatar} />}
      <div className={css.sideMessage}>
        <div className={css.nameAndTime}>
          {!sender ? (
            <span>
              {name} • {time}
            </span>
          ) : (
            <span>{time} • YOU</span>
          )}
        </div>

        <div className={css.messageBubble}>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
