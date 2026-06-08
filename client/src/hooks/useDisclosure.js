/**
 * useDisclosure — Controls open/close state for modals, drawers, dropdowns
 * Eliminates repeated isOpen/setIsOpen + onOpen/onClose boilerplate
 *
 * Usage:
 *   const modal = useDisclosure();
 *   <button onClick={modal.open}>Add</button>
 *   <Modal isOpen={modal.isOpen} onClose={modal.close} />
 *
 *   // With data (e.g. edit modal):
 *   const editModal = useDisclosure();
 *   <button onClick={() => editModal.open(item)}>Edit</button>
 *   editModal.data   // the item passed to open()
 */
import { useState, useCallback } from "react";

export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data,   setData]   = useState(null);

  const open  = useCallback((payload = null) => { setData(payload); setIsOpen(true);  }, []);
  const close = useCallback(() => { setIsOpen(false); setData(null); }, []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  return { isOpen, data, open, close, toggle };
}
