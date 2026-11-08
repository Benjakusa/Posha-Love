import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

export type Filters = {
  q: string;
  gender: string | null;
  ethnicity: string | null;
  orientation: string | null;
  ageRange: '18-25' | '26-35' | '36-45' | '46+' | null;
};

export const emptyFilters: Filters = {
  q: '',
  gender: null,
  ethnicity: null,
  orientation: null,
  ageRange: null,
};

const GENDERS = ['male', 'female', 'trans', 'nonbinary'];
const ETHNICITIES = ['black', 'white', 'asian', 'mixed', 'other'];
const ORIENTATIONS = ['straight', 'gay', 'lesbian', 'bisexual', 'other'];
const AGES = ['18-25', '26-35', '36-45', '46+'] as const;

export function SearchFilter({
  filters,
  onChange,
  placeholder = 'Search creators...',
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const activeCount =
    (filters.gender ? 1 : 0) +
    (filters.ethnicity ? 1 : 0) +
    (filters.orientation ? 1 : 0) +
    (filters.ageRange ? 1 : 0);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
            gap: 8,
          }}
        >
          <Icon.Explore size={14} color={theme.colors.textMuted} />
          <TextInput
            value={filters.q}
            onChangeText={(t) => set('q', t)}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            style={{ flex: 1, color: theme.colors.text, fontSize: 13 }}
          />
        </View>
        <Pressable
          onPress={() => setOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: activeCount ? theme.colors.primary : theme.colors.border,
          }}
        >
          <Icon.Filter size={14} color={activeCount ? theme.colors.primary : theme.colors.text} />
          {activeCount > 0 ? (
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '900' }}>
              {activeCount}
            </Text>
          ) : null}
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.bg,
              padding: 20,
              paddingBottom: 40,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Filters</Text>
              <Pressable onPress={() => onChange({ ...emptyFilters, q: filters.q })}>
                <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '800' }}>Clear all</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 500 }} contentContainerStyle={{ gap: 16 }}>
              {[
                { title: 'Gender', options: GENDERS, active: filters.gender, key: 'gender' as const },
                { title: 'Ethnicity', options: ETHNICITIES, active: filters.ethnicity, key: 'ethnicity' as const },
                { title: 'Orientation', options: ORIENTATIONS, active: filters.orientation, key: 'orientation' as const },
              ].map((group) => (
                <View key={group.title} style={{ gap: 8 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>
                    {group.title}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {group.options.map((opt) => {
                      const isActive = group.active === opt;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => set(group.key, isActive ? null : opt)}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: isActive ? theme.colors.primary : theme.colors.border,
                            backgroundColor: isActive ? theme.colors.primary : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              color: isActive ? theme.colors.onPrimary : theme.colors.text,
                              fontSize: 13,
                              fontWeight: '700',
                              textTransform: 'capitalize',
                            }}
                          >
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={{ gap: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>
                  Age range
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {AGES.map((opt) => {
                    const isActive = filters.ageRange === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => set('ageRange', isActive ? null : opt)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: isActive ? theme.colors.primary : theme.colors.border,
                          backgroundColor: isActive ? theme.colors.primary : 'transparent',
                        }}
                      >
                        <Text style={{ color: isActive ? theme.colors.onPrimary : theme.colors.text, fontSize: 13, fontWeight: '700' }}>
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={() => setOpen(false)}
              style={{ backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 20 }}
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 14 }}>Apply</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
