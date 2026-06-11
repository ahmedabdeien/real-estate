import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaXmark, FaBullhorn } from 'react-icons/fa6';

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false);
  const ann = useSelector(s => s.theme.announcementBar);

  if (!ann?.enabled || !ann?.text || dismissed) return null;

  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium relative"
      style={{ backgroundColor: ann.bgColor || '#da1f27', color: ann.textColor || '#ffffff' }}
    >
      <FaBullhorn className="text-xs opacity-80 flex-shrink-0" />
      {ann.link ? (
        <a href={ann.link} target="_blank" rel="noreferrer"
          className="hover:underline transition-all"
          style={{ color: ann.textColor || '#ffffff' }}>
          {ann.text}
        </a>
      ) : (
        <span>{ann.text}</span>
      )}
      {ann.dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-black/20"
          style={{ color: ann.textColor || '#ffffff' }}
        >
          <FaXmark className="text-xs" />
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;
