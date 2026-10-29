import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  INITIAL_COLLECTIONS,
  MOCK_SURVEYS,
  type DraftSurvey,
  type InformationCollectionRecord,
} from '@/features/manage-collections/types/manageCollections.types';
import {
  INITIAL_INTERFACES,
  type DedicatedInterfaceConfig,
} from '@/features/dedicated-interface/types/dedicatedInterface.types';

/*
 * In-memory data shared by the Information Collection pages (no backend yet), so that what is saved on one page
 * shows on the others: a collection saved in Create Collection appears in Manage Collections, Validation Rules and
 * Dedicated Interface. Starts from the mock data and resets on page reload.
 */

interface CollectionStore {
  /** Surveys of Survey Management (Draft surveys that a collection can link to). */
  surveys: DraftSurvey[];
  setSurveys: Dispatch<SetStateAction<DraftSurvey[]>>;
  collections: InformationCollectionRecord[];
  setCollections: Dispatch<SetStateAction<InformationCollectionRecord[]>>;
  interfaces: DedicatedInterfaceConfig[];
  setInterfaces: Dispatch<SetStateAction<DedicatedInterfaceConfig[]>>;
}

const StoreContext = createContext<CollectionStore | null>(null);

export const CollectionStoreProvider = ({ children }: { children: ReactNode }) => {
  const [surveys, setSurveys] = useState<DraftSurvey[]>(MOCK_SURVEYS);
  const [collections, setCollections] = useState<InformationCollectionRecord[]>(INITIAL_COLLECTIONS);
  const [interfaces, setInterfaces] = useState<DedicatedInterfaceConfig[]>(INITIAL_INTERFACES);

  const value = useMemo(
    () => ({ surveys, setSurveys, collections, setCollections, interfaces, setInterfaces }),
    [surveys, collections, interfaces]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCollectionStore = (): CollectionStore => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useCollectionStore must be used inside <CollectionStoreProvider>');
  return ctx;
};
