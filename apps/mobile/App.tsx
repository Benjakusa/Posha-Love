import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { AppBackground } from './src/components/AppBackground';
import { AgeGateScreen } from './src/screens/AgeGateScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { VideoScreen } from './src/screens/VideoScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { CreatorStudioScreen } from './src/screens/CreatorStudioScreen';
import { createGuestSession } from './src/api';
import type { GuestSessionResponse } from '@posha/shared';

type Route = 'gate' | 'home' | 'explore' | 'chat' | 'video' | 'profile' | 'settings' | 'studio';

function Root() {
  const { mode, toggle } = useTheme();
  const [route, setRoute] = useState<Route>('gate');
  const [session, setSession] = useState<GuestSessionResponse | null>(null);

  async function handleEnter() {
    const s = await createGuestSession();
    setSession(s);
    setRoute('home');
  }

  const go = (r: Route) => setRoute(r);
  const signOut = () => { setSession(null); setRoute('gate'); };

  let screen: React.ReactNode;
  switch (route) {
    case 'chat':
      screen = session ? <ChatScreen token={session.token} onBack={() => go('home')} /> : <AgeGateScreen onEnter={handleEnter} />;
      break;
    case 'video': screen = <VideoScreen onBack={() => go('home')} />; break;
    case 'studio': screen = <CreatorStudioScreen onBack={() => go('home')} />; break;
    case 'explore':
      screen = <ExploreScreen onHome={() => go('home')} onProfile={() => go('profile')} onSettings={() => go('settings')} />;
      break;
    case 'profile':
      screen = <ProfileScreen alias={session?.alias ?? 'Guest'} onBack={() => go('home')} />;
      break;
    case 'settings':
      screen = <SettingsScreen onBack={() => go('home')} mode={mode} onToggleTheme={toggle} onSignOut={signOut} />;
      break;
    case 'home':
    case 'gate':
    default:
      screen = route === 'gate'
        ? <AgeGateScreen onEnter={handleEnter} />
        : <HomeScreen
            onChat={() => go('chat')}
            onVideo={() => go('video')}
            onProfile={() => go('profile')}
            onSettings={() => go('settings')}
            onExplore={() => go('explore')}
            onHome={() => go('home')}
          />;
  }

  return <View style={{ flex: 1 }}>{screen}</View>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppBackground>
          <Root />
        </AppBackground>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
