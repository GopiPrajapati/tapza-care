import { DEFAULT_TABS } from '../src/commonutils/constants';
import { resolveTabs } from '../src/container/TabNavigator';

describe('resolveTabs', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('keeps config order and maps screens to routes', () => {
    const tabs = resolveTabs([
      { id: 'b', label: 'Bookings', icon: 'calendar', screen: 'bookings' },
      { id: 'h', label: 'Home', icon: 'home', screen: 'home' },
    ]);
    expect(tabs.map(t => t.route)).toEqual(['Bookings', 'Home']);
  });

  it('skips unknown and duplicate screens', () => {
    const tabs = resolveTabs([
      { id: 'h', label: 'Home', icon: 'home', screen: 'home' },
      { id: 'x', label: 'Doctors', icon: 'stethoscope', screen: 'doctors' },
      { id: 'h2', label: 'Home again', icon: 'home', screen: 'home' },
    ]);
    expect(tabs.map(t => t.id)).toEqual(['h']);
  });

  it('falls back to a default icon for unknown icon names', () => {
    const [tab] = resolveTabs([{ id: 'p', label: 'Profile', icon: 'nope', screen: 'profile' }]);
    expect(tab.Icon).toBeDefined();
  });

  it('uses the default tabs when nothing is usable', () => {
    const tabs = resolveTabs([{ id: 'x', label: 'X', icon: 'x', screen: 'unknown' }]);
    expect(tabs.map(t => t.id)).toEqual(DEFAULT_TABS.map(t => t.id));
  });
});
