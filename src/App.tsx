import React from 'react';

import AppProviders from './container/AppProviders';
import RootNavigator from './container/RootNavigator';

function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
