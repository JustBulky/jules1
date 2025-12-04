import { SettingsProvider } from './context/SettingsContext';
import AppContent from './AppContent';

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
