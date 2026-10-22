import React from 'react';

import HomeScreen from '../screens/HomeScreen';

/**
 * Root of the screen tree. No navigation yet: shows HomeScreen.
 * The navigation phase turns this into the root native stack.
 */
function RootNavigator() {
  return <HomeScreen />;
}

export default RootNavigator;
