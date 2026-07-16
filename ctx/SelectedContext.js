import React from "react";

const SelectedContext = React.createContext({
  selectedApps: [],
  setSelectedApps: () => {},
  defaultInstallOptions: null,
  setDefaultInstallOptions: () => {},
});

export default SelectedContext;
