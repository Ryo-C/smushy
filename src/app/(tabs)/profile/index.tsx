import { View } from 'react-native';
import { ProfileScreen } from '@/features/profile';
import { LogoutButton } from '@/features/auth';

export default function ProfileIndex() {
  return (
    <ProfileScreen
      accountAction={
        <View className="mt-2">
          <LogoutButton variant="outline" size="md" />
        </View>
      }
    />
  );
}
