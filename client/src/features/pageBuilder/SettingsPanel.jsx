import React from 'react';
import { useEditor } from '@craftjs/core';
import { FaTrash, FaCopy, FaArrowUp, FaArrowDown } from 'react-icons/fa6';

export function SettingsPanel() {
  const { selected, actions, query } = useEditor((state, q) => {
    const [id] = state.events.selected;
    if (!id || !state.nodes[id]) return { selected: null };
    const node = state.nodes[id];
    return {
      selected: {
        id,
        name: node.data.displayName || node.data.name,
        settings: node.related?.settings,
        isDeletable: q.node(id).isDeletable(),
        parent: node.data.parent,
      },
    };
  });

  if (!selected) {
    return (
      <div className="p-5 text-center text-gray-400 text-sm mt-8 space-y-2">
        <p className="font-semibold">لا يوجد عنصر محدد</p>
        <p className="text-xs leading-relaxed">اضغط على أي عنصر في الصفحة لتعديل خصائصه، أو اسحب عنصرًا جديدًا من اللوحة اليسرى.</p>
      </div>
    );
  }

  const move = (dir) => {
    const parentId = selected.parent;
    if (!parentId) return;
    const siblings = query.node(parentId).childNodes();
    const idx = siblings.indexOf(selected.id);
    const to = dir === 'up' ? idx - 1 : idx + 2;
    if (to < 0 || to > siblings.length) return;
    actions.move(selected.id, parentId, to);
  };

  const duplicate = () => {
    try {
      const parentId = selected.parent;
      if (!parentId) return;
      const tree = query.node(selected.id).toNodeTree();
      const serialized = query.serialize();
      const parsed = JSON.parse(serialized);
      const nodeData = parsed[selected.id];
      const freshNode = query.parseSerializedNode(nodeData).toNode();
      const siblings = query.node(parentId).childNodes();
      actions.add(freshNode, parentId, siblings.indexOf(selected.id) + 1);
    } catch { /* duplication best-effort */ }
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <p className="text-xs font-bold text-gray-700">{selected.name}</p>
        <div className="flex gap-0.5">
          <button onClick={() => move('up')} title="تحريك لأعلى"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"><FaArrowUp size={11} /></button>
          <button onClick={() => move('down')} title="تحريك لأسفل"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"><FaArrowDown size={11} /></button>
          <button onClick={duplicate} title="نسخ العنصر"
            className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors"><FaCopy size={11} /></button>
          {selected.isDeletable && (
            <button onClick={() => actions.delete(selected.id)} title="حذف العنصر"
              className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><FaTrash size={11} /></button>
          )}
        </div>
      </div>
      {selected.settings && React.createElement(selected.settings)}
    </div>
  );
}
