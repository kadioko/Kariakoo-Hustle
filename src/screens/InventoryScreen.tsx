import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { findProduct } from '@/data/products';
import { inventoryCapacity, inventoryUnits, inventoryValue } from '@/game/economy';
import { Card } from '@/components/Card';
import { StatRow } from '@/components/StatRow';
import { ProgressBar } from '@/components/ProgressBar';
import { Header } from '@/components/Header';
import { Pill } from '@/components/Pill';
import { Button } from '@/components/Button';
import { clearanceUnitPrice } from '@/game/economy';
import { dayPriceFor } from '@/game/marketPrices';
import { buzz } from '@/utils/haptics';
import { stockAgeDays, stockAgeTone } from '@/game/stockAging';
import { supplierQualityFor, supplierTierForReturnMultiplier } from '@/game/supplierQuality';

type SortKey = 'name' | 'value' | 'qty' | 'profit';

const demandColor = {
  low: colors.warning,
  medium: colors.info,
  high: colors.success,
  very_high: '#7C3AED',
};

export const InventoryScreen: React.FC = () => {
  const { state, language, clearInventory } = useGame();
  const toast = useToast();
  const lang = language;
  const [sort, setSort] = useState<SortKey>('value');

  const cap = inventoryCapacity(state);
  const used = inventoryUnits(state);
  const invVal = inventoryValue(state);

  const sorted = useMemo(() => {
    return [...state.inventory]
      .map((item) => {
        const product = findProduct(item.productId);
        return { item, product };
      })
      .filter((x) => !!x.product)
      .sort((a, b) => {
        const pa = a.product!;
        const pb = b.product!;
        switch (sort) {
          case 'name':
            return (lang === 'en' ? pa.nameEn : pa.name).localeCompare(lang === 'en' ? pb.nameEn : pb.name);
          case 'qty':
            return b.item.quantity - a.item.quantity;
          case 'value':
            return b.item.quantity * b.item.unitCost - a.item.quantity * a.item.unitCost;
          case 'profit':
            const gainA = (dayPriceFor(pa, state.day).sellPrice - a.item.unitCost) * a.item.quantity;
            const gainB = (dayPriceFor(pb, state.day).sellPrice - b.item.unitCost) * b.item.quantity;
            return gainB - gainA;
          default:
            return 0;
        }
      });
  }, [state.inventory, state.day, sort, lang]);

  const totalPotentialProfit = sorted.reduce((sum, { item, product }) => {
    if (!product) return sum;
    return sum + (dayPriceFor(product, state.day).sellPrice - item.unitCost) * item.quantity;
  }, 0);

  const SORTS: { key: SortKey; sw: string; en: string }[] = [
    { key: 'value', sw: 'Thamani', en: 'Value' },
    { key: 'qty', sw: 'Idadi', en: 'Qty' },
    { key: 'profit', sw: 'Faida', en: 'Profit' },
    { key: 'name', sw: 'Jina', en: 'Name' },
  ];

  const handleClearance = (
    productId: string,
    name: string,
    qty: number,
    unitPrice: number,
  ) => {
    const total = unitPrice * qty;
    Alert.alert(
      lang === 'sw' ? 'Punguza bei?' : 'Run clearance sale?',
      lang === 'sw'
        ? `Uza ${qty}× ${name} kwa ${formatTZS(total)} sasa hivi. Utapata cash haraka lakini kwa discount.`
        : `Sell ${qty}× ${name} for ${formatTZS(total)} now. You get quick cash, but at a discount.`,
      [
        { text: t('cancel', lang), style: 'cancel' },
        {
          text: lang === 'sw' ? 'Uza kwa Discount' : 'Clear Stock',
          style: 'destructive',
          onPress: () => {
            const res = clearInventory(productId, qty);
            if (res.ok) {
              buzz(state.settings, 'success');
              toast.success(
                lang === 'sw' ? 'Stock imeuzwa kwa discount' : 'Stock cleared',
                `${formatTZS(res.cashGained ?? 0)} · ${res.profit && res.profit >= 0 ? '+' : ''}${formatTZS(res.profit ?? 0)}`,
              );
            } else {
              toast.error(lang === 'sw' ? 'Imeshindikana kuuza stock' : 'Could not clear stock');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header
        title={`📦 ${t('inventory', lang)}`}
        subtitle={`${used}/${cap} units · ${formatTZS(invVal)}`}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <Card>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryCellVal}>{formatTZS(invVal)}</Text>
              <Text style={styles.summaryCellLabel}>{lang === 'sw' ? 'Thamani' : 'Cost Value'}</Text>
            </View>
            <View style={[styles.summaryCell, styles.summaryCellBorder]}>
              <Text style={[styles.summaryCellVal, { color: colors.success }]}>+{formatTZS(totalPotentialProfit)}</Text>
              <Text style={styles.summaryCellLabel}>{lang === 'sw' ? 'Faida Yote' : 'Total Potential'}</Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryCellVal, { color: used >= cap ? colors.danger : colors.text }]}>
                {used}/{cap}
              </Text>
              <Text style={styles.summaryCellLabel}>{t('capacity', lang)}</Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <ProgressBar
              value={used}
              max={cap}
              height={8}
              color={used >= cap ? colors.danger : used / cap > 0.8 ? colors.warning : colors.primary}
            />
          </View>
        </Card>

        {state.inventory.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>{t('no_stock', lang)}</Text>
          </View>
        ) : (
          <>
            {/* Sort bar */}
            <View style={styles.sortBar}>
              <Text style={styles.sortLabel}>{lang === 'sw' ? 'Panga kwa:' : 'Sort by:'}</Text>
              {SORTS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sortChip, sort === s.key && styles.sortChipActive]}
                  onPress={() => setSort(s.key)}
                >
                  <Text style={[styles.sortChipText, sort === s.key && { color: '#fff' }]}>
                    {lang === 'sw' ? s.sw : s.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Items */}
            {sorted.map(({ item, product }) => {
              if (!product) return null;
              const name = lang === 'en' ? product.nameEn : product.name;
              const daySell = dayPriceFor(product, state.day).sellPrice;
              const totalCost = item.quantity * item.unitCost;
              const totalSell = item.quantity * daySell;
              const gain = totalSell - totalCost;
              const marginPct = Math.round(((daySell - item.unitCost) / item.unitCost) * 100);
              const clearancePrice = clearanceUnitPrice(product, item.unitCost, daySell);
              const clearanceAll = clearancePrice * item.quantity;
              const age = stockAgeDays(item, state.day);
              const ageTone = stockAgeTone(age);
              const quality = supplierQualityFor(supplierTierForReturnMultiplier(item.qualityReturnMultiplier));

              return (
                <Card key={item.productId}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemEmoji}>{product.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{name}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <Pill
                          label={t(`demand_${product.demand}`, lang)}
                          bg={demandColor[product.demand] + '22'}
                          color={demandColor[product.demand]}
                        />
                        <Pill
                          label={`+${marginPct}%`}
                          bg={colors.success + '22'}
                          color={colors.success}
                        />
                        <Pill
                          label={lang === 'sw' ? quality.name : quality.nameEn}
                          bg={quality.id === 'budget' ? colors.warning + '22' : quality.id === 'premium' ? colors.success + '22' : colors.info + '22'}
                          color={quality.id === 'budget' ? colors.warning : quality.id === 'premium' ? colors.success : colors.info}
                        />
                        {age > 0 && (
                          <Pill
                            label={lang === 'sw' ? `Imekaa siku ${age}` : `${age} days in stock`}
                            bg={(ageTone === 'old' ? colors.danger : colors.warning) + '22'}
                            color={ageTone === 'old' ? colors.danger : colors.warning}
                          />
                        )}
                      </View>
                      {ageTone !== 'fresh' && (
                        <Text style={styles.agingHint}>
                          {lang === 'sw'
                            ? 'Stock hii imekaa; fikiria punguzo au badilisha mzunguko.'
                            : 'This stock is aging; consider a discount or rotate your mix.'}
                        </Text>
                      )}
                    </View>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyNum}>{item.quantity}</Text>
                      <Text style={styles.qtySub}>units</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statsRow}>
                    <View style={styles.statsCell}>
                      <Text style={styles.statsCellLabel}>{t('unit_cost', lang)}</Text>
                      <Text style={styles.statsCellVal}>{formatTZS(item.unitCost)}</Text>
                    </View>
                    <View style={styles.statsCell}>
                      <Text style={styles.statsCellLabel}>{lang === 'sw' ? 'Jumla Gharama' : 'Total Cost'}</Text>
                      <Text style={styles.statsCellVal}>{formatTZS(totalCost)}</Text>
                    </View>
                    <View style={styles.statsCell}>
                      <Text style={styles.statsCellLabel}>{lang === 'sw' ? 'Faida Yote' : 'Total Profit'}</Text>
                      <Text style={[styles.statsCellVal, { color: colors.success }]}>+{formatTZS(gain)}</Text>
                    </View>
                  </View>

                  <View style={styles.clearanceBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clearanceTitle}>
                        {lang === 'sw' ? 'Punguza bei, rudisha cash' : 'Clearance cash recovery'}
                      </Text>
                      <Text style={styles.clearanceText}>
                        {lang === 'sw'
                          ? `${formatTZS(clearancePrice)} kwa unit · jumla ${formatTZS(clearanceAll)}`
                          : `${formatTZS(clearancePrice)} per unit · total ${formatTZS(clearanceAll)}`}
                      </Text>
                    </View>
                    <View style={styles.clearanceActions}>
                      <Button
                        title={lang === 'sw' ? 'Uza 1' : 'Clear 1'}
                        onPress={() => handleClearance(item.productId, name, 1, clearancePrice)}
                        size="sm"
                        variant="outline"
                      />
                      <Button
                        title={lang === 'sw' ? 'Zote' : 'All'}
                        onPress={() => handleClearance(item.productId, name, item.quantity, clearancePrice)}
                        size="sm"
                        variant="secondary"
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row' },
  summaryCell: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  summaryCellBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  summaryCellVal: { fontSize: font.md, fontWeight: '900', color: colors.text },
  summaryCellLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyEmoji: { fontSize: 56 },
  emptyText: { color: colors.textMuted, fontSize: font.md, textAlign: 'center' },
  sortBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  sortLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: '700' },
  sortChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: colors.card,
  },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortChipText: { fontSize: font.xs, fontWeight: '700', color: colors.text },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  itemEmoji: { fontSize: 36 },
  itemName: { fontSize: font.md, fontWeight: '700', color: colors.text },
  qtyBadge: {
    backgroundColor: colors.primaryLight + '22',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 52,
  },
  qtyNum: { fontSize: font.xl, fontWeight: '900', color: colors.primary },
  qtySub: { fontSize: font.xs, color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statsCell: { flex: 1, alignItems: 'center' },
  statsCellLabel: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center' },
  statsCellVal: { fontSize: font.sm, fontWeight: '800', color: colors.text, marginTop: 2, textAlign: 'center' },
  clearanceBox: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearanceTitle: { fontSize: font.xs, color: colors.text, fontWeight: '800' },
  clearanceText: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  agingHint: { fontSize: 10, color: colors.warning, fontWeight: '700', marginTop: 4, lineHeight: 15 },
  clearanceActions: { flexDirection: 'row', gap: spacing.xs },
});
