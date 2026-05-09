import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '@/theme';
import { GameState } from '@/types';
import { UPGRADES } from '@/data/upgrades';
import { WORKERS } from '@/data/workers';
import { Card } from './Card';

interface Boosts {
  salesBoost: number;
  demandBoost: number;
  expenseReduction: number;
  eventLossReduction: number;
  inventoryBonus: number;
}

function calcBoosts(state: GameState): Boosts {
  let salesBoost = 0;
  let demandBoost = 0;
  let expenseReduction = 0;
  let eventLossReduction = 0;
  let inventoryBonus = 0;

  state.upgrades.forEach((id) => {
    const u = UPGRADES.find((x) => x.id === id);
    if (!u) return;
    salesBoost += u.effects.salesBoostPercent ?? 0;
    demandBoost += u.effects.demandBoostPercent ?? 0;
    expenseReduction += u.effects.expenseReductionPercent ?? 0;
    eventLossReduction += u.effects.eventLossReductionPercent ?? 0;
    inventoryBonus += u.effects.inventoryCapacityBonus ?? 0;
  });
  state.workers.forEach((id) => {
    const w = WORKERS.find((x) => x.id === id);
    if (!w) return;
    salesBoost += w.effects.salesBoostPercent ?? 0;
    demandBoost += w.effects.demandBoostPercent ?? 0;
    expenseReduction += w.effects.expenseReductionPercent ?? 0;
    eventLossReduction += w.effects.eventLossReductionPercent ?? 0;
  });

  return { salesBoost, demandBoost, expenseReduction, eventLossReduction, inventoryBonus };
}

interface Props {
  state: GameState;
  lang: 'sw' | 'en';
}

export const BoostSummary: React.FC<Props> = ({ state, lang }) => {
  const b = calcBoosts(state);
  const hasAny =
    b.salesBoost > 0 ||
    b.demandBoost > 0 ||
    b.expenseReduction > 0 ||
    b.eventLossReduction > 0 ||
    b.inventoryBonus > 0;

  if (!hasAny && state.upgrades.length === 0 && state.workers.length === 0) return null;

  const Boost = ({ emoji, label, val }: { emoji: string; label: string; val: string }) => (
    <View style={styles.boostItem}>
      <Text style={styles.boostEmoji}>{emoji}</Text>
      <Text style={styles.boostLabel}>{label}</Text>
      <Text style={styles.boostVal}>{val}</Text>
    </View>
  );

  return (
    <Card style={styles.card} alt>
      <Text style={styles.title}>
        {lang === 'sw' ? '⚡ Nguvu za Biashara Yako' : '⚡ Your Business Power'}
      </Text>
      {b.salesBoost > 0 && (
        <Boost emoji="📈" label={lang === 'sw' ? 'Mauzo' : 'Sales'} val={`+${Math.round(b.salesBoost * 100)}%`} />
      )}
      {b.demandBoost > 0 && (
        <Boost emoji="🔥" label={lang === 'sw' ? 'Demand' : 'Demand'} val={`+${Math.round(b.demandBoost * 100)}%`} />
      )}
      {b.expenseReduction > 0 && (
        <Boost emoji="💸" label={lang === 'sw' ? 'Matumizi chini' : 'Expenses down'} val={`−${Math.round(b.expenseReduction * 100)}%`} />
      )}
      {b.eventLossReduction > 0 && (
        <Boost emoji="🛡️" label={lang === 'sw' ? 'Ulinzi wa Hasara' : 'Loss Protection'} val={`−${Math.round(b.eventLossReduction * 100)}%`} />
      )}
      {b.inventoryBonus > 0 && (
        <Boost emoji="📦" label={lang === 'sw' ? 'Capacity Extra' : 'Extra Capacity'} val={`+${b.inventoryBonus}`} />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {},
  title: { fontSize: font.sm, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  boostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 5,
  },
  boostEmoji: { fontSize: 18, width: 24 },
  boostLabel: { flex: 1, fontSize: font.sm, color: colors.textMuted },
  boostVal: { fontSize: font.sm, fontWeight: '800', color: colors.success },
});
