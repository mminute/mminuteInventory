import React from 'react';
import { routePaths } from 'consts/routePaths';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './App.css';
import 'gestalt/dist/gestalt.css';
import actions from '../consts/actions';
import InventoryItem from '../Inventory/InventoryItem';
import InventoryView from './components/InventoryView';
import ViewAndEditItemSheet from './components/ViewAndEditItemSheet';
import Splash from './components/Splash/Splash';
import Settings from './components/Settings';
import Pages from './components/Pages';
import WarningModal from './components/WarningModal';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}
interface State {
  categories: Array<string>;
  currentItem: InventoryItem | null;
  filepath: string;
  fileSettings: {
    showArchived: boolean;
    sortCol: string;
    sortOrder: 'asc' | 'desc';
  };
  hasChanges: boolean;
  inventory: Array<InventoryItem>;
  locations: Array<string>;
  recentFiles: Array<string>;
  secrets: Record<string, string>;
  showSheet: boolean;
  viewingNewItem: boolean;
  warningModalType: {
    type: 'unsaved-changes';
    actionType: 'new-file' | 'existing-file';
  } | null;
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      categories: [],
      currentItem: null,
      filepath: '',
      fileSettings: { showArchived: false, sortCol: 'name', sortOrder: 'asc' },
      hasChanges: false,
      inventory: [],
      locations: [],
      recentFiles: [],
      secrets: {},
      showSheet: false,
      viewingNewItem: false,
      warningModalType: null,
    };
  }

  componentDidMount() {
    window.electron.ipcRenderer.on(
      actions.INVENTORY_INITIALIZED,
      this.handleInventoryInitialized
    );

    window.electron.ipcRenderer.on(
      actions.INVENTORY_UPDATED,
      this.handleInventoryUpdated
    );

    window.electron.ipcRenderer.on(actions.ADD_NEW_ITEM, this.handleAddNewItem);

    window.electron.ipcRenderer.on(
      actions.INVENTORY_SAVED,
      this.handleInventorySaved
    );

    window.electron.ipcRenderer.on(
      actions.INVENTORY_CREATED,
      this.handleFilepathSet
    );

    window.electron.ipcRenderer.on(
      actions.INVENTORY_OPENED,
      this.handleFilepathSet
    );

    window.electron.ipcRenderer.on(
      actions.SETTINGS_UPDATED,
      this.handleSettingsUpdated
    );

    window.electron.ipcRenderer.on(
      actions.INVENTORY_CHANGE_WITHOUT_SAVE,
      this.handleNewInventoryWithoutSave
    );
  }

  componentWillUnmount() {
    window.electron.ipcRenderer.removeAllListeners(
      [actions.INVENTORY_INITIALIZED],
      this.handleInventoryInitialized
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.INVENTORY_UPDATED],
      this.handleInventoryUpdated
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.ADD_NEW_ITEM],
      this.handleAddNewItem
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.INVENTORY_SAVED],
      this.handleInventorySaved
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.INVENTORY_CREATED],
      this.handleFilepathSet
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.INVENTORY_OPENED],
      this.handleFilepathSet
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.SETTINGS_UPDATED],
      this.handleSettingsUpdated
    );

    window.electron.ipcRenderer.removeAllListeners(
      [actions.INVENTORY_CHANGE_WITHOUT_SAVE],
      this.handleNewInventoryWithoutSave
    );
  }

  handleInventoryInitialized = (
    inventory: Array<InventoryItem>,
    categories: Set<string>,
    locations: Set<string>,
    recentFiles: Array<string>,
    fileSettings: {
      showArchived: boolean;
      sortCol: string;
      sortOrder: 'asc' | 'desc';
    },
    secrets: Record<string, string>
  ) => {
    this.setState({
      inventory,
      categories: Array.from(categories),
      locations: Array.from(locations),
      viewingNewItem: false,
      recentFiles,
      fileSettings,
      secrets,
    });
  };

  handleInventoryUpdated = (
    inventory: Array<InventoryItem>,
    categories: Set<string>,
    locations: Set<string>,
    hasChanges: boolean
  ) => {
    this.setState({
      inventory,
      categories: Array.from(categories),
      locations: Array.from(locations),
      viewingNewItem: false,
      hasChanges,
    });
  };

  handleFilepathSet = (filepath: string | null) => {
    if (filepath !== null && filepath.length > 0) {
      this.setState({ filepath });
    }
  };

  handleSettingsUpdated = (
    fileSettings: { showArchived: boolean },
    recentFiles: Array<string>,
    secrets: Record<string, string>
  ) => {
    this.setState((prevState) => ({
      recentFiles,
      fileSettings: { ...prevState.fileSettings, ...fileSettings },
      secrets,
    }));
  };

  handleSelectItem = (item: InventoryItem | null) => {
    this.setState((prevState) => {
      return { showSheet: !prevState.showSheet, currentItem: item };
    });
  };

  handleAddNewItem = (newItem: InventoryItem, hasChanges: boolean) => {
    this.setState({
      showSheet: true,
      currentItem: newItem,
      viewingNewItem: true,
      hasChanges,
    });
  };

  handleInventorySaved = (hasChanges: boolean) => {
    this.setState({ hasChanges });
  };

  handleNewInventoryWithoutSave = (
    actionType: 'new-file' | 'existing-file'
  ) => {
    this.setState({
      warningModalType: { type: 'unsaved-changes', actionType },
    });
  };

  render() {
    const {
      categories,
      currentItem,
      filepath,
      fileSettings,
      hasChanges,
      inventory,
      locations,
      recentFiles,
      secrets,
      showSheet,
      viewingNewItem,
      warningModalType,
    } = this.state;

    return (
      <>
        <Router>
          <Sidebar
            filepath={filepath}
            saveDisabled={!hasChanges}
            onAddNewItem={() => {
              window.electron.ipcRenderer.addNewItem();
            }}
          />

          <Pages>
            <Route
              path={routePaths.HOME}
              element={<Splash recentFiles={recentFiles} />}
            />
            <Route
              path={routePaths.SETTINGS}
              element={
                <Settings
                  filepath={filepath}
                  fileSettings={fileSettings}
                  secrets={secrets}
                />
              }
            />
            <Route
              path={routePaths.VIEW}
              element={
                <InventoryView
                  categories={categories.filter((category) => category.length)}
                  inventory={inventory}
                  locations={locations.filter((category) => category.length)}
                  onSelectItem={this.handleSelectItem}
                  showArchived={fileSettings?.showArchived}
                  sortColSetting={fileSettings.sortCol}
                  sortOrderSetting={fileSettings.sortOrder}
                />
              }
            />
          </Pages>
        </Router>

        {showSheet && currentItem && (
          <ViewAndEditItemSheet
            categories={categories.filter((category) => category.length)}
            item={currentItem}
            isNewItem={viewingNewItem}
            locations={locations}
            onDismiss={() => this.handleSelectItem(null)}
          />
        )}

        {warningModalType && (
          <WarningModal
            warningType={warningModalType.type}
            actionType={warningModalType.actionType}
            onDismiss={() => this.setState({ warningModalType: null })}
          />
        )}
      </>
    );
  }
}

export default App;
