import { useState } from 'react';
import { useDebounce } from './useDebounce';

export const usePagination = (defaultLimit = 15) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const dSearch = useDebounce(search);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  return { page, setPage, search, dSearch, handleSearch, limit: defaultLimit };
};
