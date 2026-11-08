import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Creating blobs from', 'Blob', 'arraybuffer']);
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { AppBackground } from './src/components/AppBackground';
import { GradientView } from './src/components/Gradient';
import { AgeGateScreen } from './src/screens/AgeGateScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { CreatorProfileScreen } from './src/screens/CreatorProfileScreen';
import { MyCreatorProfileScreen } from './src/screens/MyCreatorProfileScreen';
import { CreatePostScreen } from './src/screens/CreatePostScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { VideoScreen } from './src/screens/VideoScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { LegalScreen } from './src/screens/LegalScreen';
import { ReportProblemScreen } from './src/screens/ReportProblemScreen';
import { HelpScreen } from './src/screens/HelpScreen';
import { CreatorStudioScreen } from './src/screens/CreatorStudioScreen';
import { CreatorWizardScreen } from './src/screens/CreatorWizardScreen';
import { CreatorDashboardScreen } from './src/screens/CreatorDashboardScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { CreatorBenefitsScreen } from './src/screens/CreatorBenefitsScreen';
import { createGuestSession } from './src/api';
import { saveSession, loadSession, clearSession } from './src/session';
import type { GuestSessionResponse } from '@posha/shared';
import type { NavRoute } from './src/components/BottomNav';

type Route =
  | 'gate' | 'signin-member' | 'signin-creator' | 'creator-benefits'
  | 'home' | 'explore' | 'chat' | 'video' | 'profile' | 'settings'
  | 'studio' | 'creator-wizard' | 'edit-creator-profile' | 'creator-profile' | 'creator-dashboard' | 'create-post' | 'notifications' | 'privacy' | 'terms' | 'report-problem' | 'help';

function Root() {
  const { theme, mode, toggle } = useTheme();
  const [route, setRoute] = useState<Route>('gate');
  const [session, setSession] = useState<GuestSessionResponse | null>(null);
  const [creatorHandle, setCreatorHandle] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const restored = await loadSession();
      if (restored) {
        setSession(restored);
        setRoute('home');
      }
      setBooting(false);
    })();
  }, []);

  async function handleGuest() {
    const s = await createGuestSession();
    await saveSession(s);
    setSession(s);
    setRoute('home');
  }

  const go = (r: Route) => setRoute(r);
  const navigate = (r: NavRoute) => {
    if (r === 'home') setRoute('home');
    else if (r === 'explore') setRoute('explore');
    else if (r === 'profile') setRoute('profile');
    else if (r === 'settings') setRoute('settings');
  };

  const signOut = async () => {
    await clearSession();
    setSession(null);
    setRoute('gate');
  };

  const onSignInSuccess = async (s: GuestSessionResponse) => {
    await saveSession(s);
    setSession(s);
    if (s.role === 'creator') {
      const status = (s as any).creatorStatus;
      // Creator with no profile yet → straight to the wizard
      if (!status || status === 'none') {
        setRoute('creator-wizard');
      } else {
        setRoute('creator-dashboard');
      }
      return;
    }
    // Member / guest → home
    setRoute('home');
  };

  if (booting) {
    return (
      <GradientView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style={mode === 'dark' ? 'dark' : 'light'} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </GradientView>
    );
  }

  const gate = (
    <AgeGateScreen
      onGuest={handleGuest}
      onSignIn={() => go('signin-member')}
      onSignInCreator={() => go('signin-creator')}
    />
  );

  let screen: React.ReactNode;
  switch (route) {
    case 'signin-member':
      screen = <SignInScreen role="member" onSuccess={onSignInSuccess} onBack={() => go('gate')} />;
      break;
    case 'signin-creator':
      screen = <SignInScreen role="creator" onSuccess={onSignInSuccess} onBack={() => go('gate')} />;
      break;
    case 'creator-benefits':
      screen = <CreatorBenefitsScreen onApply={() => go('creator-wizard')} onBack={() => go('home')} />;
      break;
    case 'creator-wizard':
      screen = session ? (
        <CreatorWizardScreen token={session.token} onDone={() => go('profile')} onCancel={() => go('home')} />
      ) : gate;
      break;
    case 'chat':
      screen = session ? <ChatScreen token={session.token} onBack={() => go('home')} /> : gate;
      break;
    case 'video':
      screen = session ? <VideoScreen token={session.token} onBack={() => go('home')} /> : gate;
      break;
    case 'edit-creator-profile':
      screen = session ? (
        <EditProfileScreen
          token={session.token}
          onSaved={() => go('profile')}
          onCancel={() => go('profile')}
        />
      ) : gate;
      break;
    case 'creator-profile':
      screen = session && creatorHandle ? (
        <CreatorProfileScreen
          token={session.token}
          handle={creatorHandle}
          onBack={() => go('home')}
        />
      ) : gate;
      break;
    case 'creator-dashboard':
      screen = session ? (
        <CreatorDashboardScreen
          token={session.token}
          creatorStatus={(session as any).creatorStatus ?? 'none'}
          onEditProfile={() => go('edit-creator-profile')}
          onCompleteProfile={() => go('creator-wizard')}
          onBrowse={() => go('home')}
          onSignOut={signOut}
        />
      ) : gate;
      break;
    case 'create-post':
      screen = session ? (
        <CreatePostScreen
          token={session.token}
          onBack={() => go('profile')}
          onCreated={() => go('profile')}
        />
      ) : gate;
      break;
    case 'studio':
      screen = <CreatorStudioScreen onBack={() => go('home')} />;
      break;
    case 'explore':
      screen = session ? <ExploreScreen token={session.token} onNavigate={navigate} onOpenCreator={(h) => { setCreatorHandle(h); go('creator-profile'); }} /> : gate;
      break;
    case 'profile':
      screen = session ? (
        session.role === 'creator' ? (
          <MyCreatorProfileScreen
            token={session.token}
            onDashboard={() => go('creator-dashboard')}
            onCreate={() => go('create-post')}
            onEditProfile={() => go('edit-creator-profile')}
            onCompleteProfile={() => go('creator-wizard')}
          />
        ) : (
          <ProfileScreen
            token={session.token}
            alias={session.alias}
            role={session.role}
            onNavigate={navigate}
            onStartCreator={() => (session.role === 'guest' ? go('signin-creator') : go('creator-wizard'))}
            onEditProfile={() => go('edit-creator-profile')}
            onSignOut={signOut}
          />
        )
      ) : gate;
      break;
    case 'notifications':
      screen = <NotificationsScreen onBack={() => go('settings')} />;
      break;
    case 'privacy':
      screen = <LegalScreen kind="privacy" token={session?.token} onBack={() => go('settings')} />;
      break;
    case 'terms':
      screen = <LegalScreen kind="terms" token={session?.token} onBack={() => go('settings')} />;
      break;
    case 'report-problem':
      screen = session ? <ReportProblemScreen token={session.token} onBack={() => go('settings')} /> : gate;
      break;
    case 'help':
      screen = <HelpScreen onBack={() => go('settings')} />;
      break;
    case 'settings':
      screen = <SettingsScreen
        onBack={() => go('home')}
        mode={mode}
        onToggleTheme={toggle}
        onSignOut={signOut}
        onEditProfile={() => go('edit-creator-profile')}
        onNotifications={() => go('notifications')}
        onPrivacy={() => go('privacy')}
        onTerms={() => go('terms')}
        onReport={() => go('report-problem')}
        onHelp={() => go('help')}
      />;
      break;
    case 'home':
      screen = session ? (
        <HomeScreen
          token={session.token}
          role={session.role}
          onChat={() => go('chat')}
          onVideo={() => go('video')}
          onNavigate={navigate}
        />
      ) : gate;
      break;
    case 'gate':
    default:
      screen = gate;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {screen}
    </View>
  );
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
