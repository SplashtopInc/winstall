import { createContext, useCallback, useContext, useMemo, useState } from "react";
import SearchDialog from "../components/SearchDialog";

const SearchDialogContext = createContext({
  openSearch: () => {},
  closeSearch: () => {},
});

export function SearchDialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openSearch, closeSearch }),
    [openSearch, closeSearch]
  );

  return (
    <SearchDialogContext.Provider value={value}>
      {children}
      <SearchDialog isOpen={isOpen} onClose={closeSearch} />
    </SearchDialogContext.Provider>
  );
}

export function useSearchDialog() {
  return useContext(SearchDialogContext);
}

export default SearchDialogContext;
