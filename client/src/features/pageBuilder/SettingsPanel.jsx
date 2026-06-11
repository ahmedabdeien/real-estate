import React from 'react';
import { useEditor } from '@craftjs/core';
import { FaTrash } from 'react-icons/fa6';

export function SettingsPanel() {
  const { selected, actions, query } = useEditor((state, q) => {
    const [id] = state.events.selected;
    if (!id) return { selected: null };
    const node = state.nodes[id];
    return {
      selected: {
        id,
        name: node.data.displayName || node.data.name,
        settings: node.related?.settings,
        isDeletable: q.node(id).isDeletable(),
      },
    };
  });

  if (!selected) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm mt-8">
        <p>اختر عنصرًا لتعديل خصائصه</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{selected.name}</p>
        {selected.isDeletable && (
          <button
            onClick={() => actions.delete(selected.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
          >
            <FaTrash size={13} />
          </button>
        )}
      </div>
      {selected.settings && React.createElement(selected.settings)}
    </div>
  );
}
