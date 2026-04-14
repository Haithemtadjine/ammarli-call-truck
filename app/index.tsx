import { Redirect } from 'expo-router';

// Entry point — unconditionally route to onboarding as the default launch state
export default function Index() {
  return <Redirect href="/onboarding" />;
}
