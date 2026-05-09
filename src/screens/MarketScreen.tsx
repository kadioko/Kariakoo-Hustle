import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, shadow, spacing } from '@/theme';
import { useGame } from '@/state/GameContext';
import { useToast } from '@/components/Toast';
import { t } from '@/utils/i18n';
import { formatTZS } from '@/utils/format';
import { PRODUCTS } from '@/data/products';
import { Product, ProductCategory } from '@/types';
import { inventoryCapacity, inventoryUnits } from '@/game/economy';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Pill';
import { ProgressBar } from '@/components/ProgressBar';
import { StatRow } from '@/components/StatRow';
import { getProductInsight, productMargin } from '@/game/productInsights';

const CATEGORIES: { id: 'all' | ProductCategory; sw: string; en: string; emoji: string }[] = [
  { id: 'all', sw: 'Zote', en: 'All', emoji: '🛍️' },
  { id: 'phone_accessories', sw: 'Simu', en: 'Phone', emoji: '📱' },
  { id: 'clothes', sw: 'Nguo', en: 'Clothes', emoji: '👕' },
  { id: 'cosmetics', sw: 'Vipodozi', en: 'Beauty', emoji: '💄' },
  { id: 'electronics', sw: 'Elektro', en: 'Electro', emoji: '🔌' },
  { id: 'food', sw: 'Chakula', en: 'Food', emoji: '🍪' },
  { id: 'shoes', sw: 'Viatu', en: 'Shoes', emoji: '👟' },
  { id: 'school', sw: 'Shule', en: 'School', emoji: '🎒' },
  { id: 'home', sw: 'Nyumba', en: 'Home', emoji: '🏠' },
  { id: 'imported', sw: 'Import', en: 'Imported', emoji: '🌍' },
  { id: 'spare_parts', sw: 'Spea', en: 'Spare', emoji: '🔧' },
];

const demandColor = {
  low: colors.warning,
  medium: colors.info,
  high: colors.success,
  very_high: '#7C3AED',
};
const riskColor = { low: colors.success, medium: colors.warning, high: colors.danger };
const insightColor = {
  great: colors.success,
  good: colors.primary,
  careful: colors.warning,
  risky: colors.danger,
};

interface BuyModalProps {
  product: Product;
  onClose: () => void;
  onBuy: (qty: number) => void;
  freeSlots: number;
  cash: number;
  ownedQty: number;
  lang: 'sw' | 'en';
}

const BuyModal: React.FC<BuyModalProps> = ({
  product,
  onClose,
  onBuy,
  freeSlots,
  cash,
  ownedQty,
  lang,
}) => {
  const [qty, setQty] = useState(1);
  const total = qty * product.buyPrice;
  const canAfford = cash >= total;
  const canFit = qty <= freeSlots && freeSlots > 0;
  const name = lang === 'en' ? product.nameEn : product.name;
  const desc = lang === 'en' ? product.descriptionEn : product.description;
  const { margin, marginPercent } = productMargin(product);
  const insight = getProductInsight(product, lang);
  const maxBuyable = Math.min(freeSlots, Math.floor(cash / product.buyPrice));
  const hasBuyingPower = maxBuyable > 0;

  const adjust = (delta: number) => {
    if (!hasBuyingPower) return;
    setQty((q) => Math.max(1, Math.min(maxBuyable, q + delta)));
  };

  return (
    <Modal visible animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{product.emoji} {name}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 22, color: colors.textMuted }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          {/* Desc */}
          <Card>
            <Text style={styles.desc}>{desc}</Text>
            {ownedQty > 0 && (
              <Text style={styles.ownedHint}>
                {lang === 'sw' ? `Una ${ownedQty} units tayari.` : `You have ${ownedQty} units already.`}
              </Text>
            )}
          </Card>

          {/* Stats */}
          <Card>
            <StatRow label={t('cost', lang)} value={formatTZS(product.buyPrice)} />
            <StatRow
              label={lang === 'sw' ? 'Bei ya Kuuza' : 'Sell Price'}
              value={formatTZS(product.sellPrice)}
              highlight
            />
            <StatRow
              label={t('margin', lang)}
              value={`+${formatTZS(margin)}  (+${marginPercent}%)`}
              positive
            />
            <View style={styles.pillRow}>
              <Pill
                label={`${lang === 'sw' ? '📊 Demand' : '📊 Demand'}: ${t(`demand_${product.demand}`, lang)}`}
                bg={demandColor[product.demand] + '22'}
                color={demandColor[product.demand]}
              />
              <Pill
                label={`${lang === 'sw' ? '⚠️ Hatari' : '⚠️ Risk'}: ${t(`risk_${product.risk}`, lang)}`}
                bg={riskColor[product.risk] + '22'}
                color={riskColor[product.risk]}
              />
            </View>
          </Card>

          <Card alt style={{ borderLeftWidth: 4, borderLeftColor: insightColor[insight.tone] }}>
            <View style={styles.insightTop}>
              <Text style={[styles.insightScore, { color: insightColor[insight.tone] }]}>
                {insight.score}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightLabel}>{insight.label}</Text>
                <Text style={styles.insightDesc}>{insight.description}</Text>
              </View>
            </View>
          </Card>

          {/* Quantity picker */}
          <Card>
            <Text style={styles.qtyLabel}>
              {lang === 'sw' ? 'Chagua Idadi' : 'Select Quantity'}
            </Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => adjust(-5)}>
                <Text style={styles.qtyBtnText}>−5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnSm]} onPress={() => adjust(-1)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnSm]} onPress={() => adjust(1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => adjust(5)}>
                <Text style={styles.qtyBtnText}>+5</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.presets}>
              {[1, 5, 10, maxBuyable]
                .filter((v) => v > 0)
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.preset, qty === n && styles.presetActive]}
                  onPress={() => setQty(Math.max(1, Math.min(maxBuyable, n)))}
                >
                  <Text style={[styles.presetText, qty === n && { color: '#fff' }]}>
                    {n === maxBuyable && n !== 1 && n !== 5 && n !== 10
                      ? lang === 'sw' ? 'Max' : 'Max'
                      : String(n)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Total */}
          <Card style={{ backgroundColor: canAfford && canFit ? '#F0FDF4' : '#FFF1F1' }}>
            <StatRow
              label={lang === 'sw' ? 'Gharama Jumla' : 'Total Cost'}
              value={formatTZS(total)}
              negative={!canAfford}
              highlight={canAfford && canFit}
            />
            <StatRow
              label={lang === 'sw' ? 'Faida Inayotarajiwa' : 'Expected Profit'}
              value={`+${formatTZS(qty * margin)}`}
              positive
            />
            {!canAfford && (
              <Text style={{ color: colors.danger, fontSize: font.xs, marginTop: 4 }}>
                ❌ {t('not_enough_cash', lang)} · {lang === 'sw' ? 'Unahitaji' : 'Need'} {formatTZS(total - cash)} {lang === 'sw' ? 'zaidi' : 'more'}
              </Text>
            )}
            {canAfford && freeSlots === 0 && (
              <Text style={{ color: colors.danger, fontSize: font.xs, marginTop: 4 }}>
                ❌ {t('capacity_full', lang)}
              </Text>
            )}
          </Card>

          <Button
            title={canAfford && canFit
              ? `🛒 ${t('buy', lang)} ${qty}× ${name}`
              : !canAfford
              ? t('not_enough_cash', lang)
              : t('capacity_full', lang)}
            disabled={!canAfford || !canFit}
            onPress={() => { onBuy(qty); onClose(); }}
            size="lg"
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export const MarketScreen: React.FC = () => {
  const { state, language, buyProduct } = useGame();
  const toast = useToast();
  const [cat, setCat] = useState<'all' | ProductCategory>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const lang = language;

  const cap = inventoryCapacity(state);
  const used = inventoryUnits(state);
  const freeSlots = cap - used;

  const ownedQtyMap = useMemo(() => {
    const m: Record<string, number> = {};
    state.inventory.forEach((i) => { m[i.productId] = i.quantity; });
    return m;
  }, [state.inventory]);

  const visible = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const inCat = cat === 'all' || p.category === cat;
      const searchLower = search.toLowerCase();
      const nameMatch =
        p.name.toLowerCase().includes(searchLower) ||
        p.nameEn.toLowerCase().includes(searchLower);
      return inCat && (search === '' || nameMatch);
    });
  }, [cat, search]);

  const handleBuy = (productId: string, qty: number) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    const name = p ? (lang === 'en' ? p.nameEn : p.name) : '';
    const res = buyProduct(productId, qty);
    if (res.ok) {
      toast.success(
        lang === 'sw' ? `${qty}× ${name} imenunuliwa!` : `${qty}× ${name} bought!`,
        formatTZS(qty * (p?.buyPrice ?? 0)),
      );
    } else {
      const msg =
        res.reason === 'not_enough_cash'
          ? t('not_enough_cash', lang)
          : res.reason === 'capacity_full'
          ? t('capacity_full', lang)
          : t('not_unlocked', lang);
      toast.error(msg);
    }
  };

  const handleQuickBuy = (p: Product) => {
    if (p.unlockLevel > state.level) {
      toast.error(`${t('not_unlocked', lang)} — L${p.unlockLevel}`);
      return;
    }
    if (freeSlots <= 0) { toast.error(t('capacity_full', lang)); return; }
    if (state.cash < p.buyPrice) { toast.error(t('not_enough_cash', lang)); return; }
    handleBuy(p.id, 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={lang === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.cashPill}>
          <Text style={styles.cashPillText}>{formatTZS(state.cash)}</Text>
        </View>
      </View>

      {/* Capacity bar */}
      <View style={styles.capRow}>
        <Text style={styles.capText}>
          📦 {used}/{cap}
          {freeSlots <= 5 && freeSlots > 0 && (
            <Text style={{ color: colors.warning }}> · {lang === 'sw' ? 'Karibu kujaa!' : 'Almost full!'}</Text>
          )}
          {freeSlots === 0 && (
            <Text style={{ color: colors.danger }}> · {t('capacity_full', lang)}</Text>
          )}
        </Text>
        <ProgressBar
          value={used}
          max={cap}
          height={5}
          color={freeSlots === 0 ? colors.danger : freeSlots <= 5 ? colors.warning : colors.primary}
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm }}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setCat(c.id)}
            style={[styles.catChip, cat === c.id && styles.catChipActive]}
          >
            <Text style={{ fontSize: 12 }}>{c.emoji}</Text>
            <Text style={[styles.catLabel, cat === c.id && { color: '#fff' }]}>
              {lang === 'en' ? c.en : c.sw}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {lang === 'sw' ? 'Bidhaa haijapatikana.' : 'No products found.'}
            </Text>
          </View>
        )}
        {visible.map((p) => {
          const locked = p.unlockLevel > state.level;
          const name = lang === 'en' ? p.nameEn : p.name;
          const { marginPercent } = productMargin(p);
          const insight = getProductInsight(p, lang);
          const owned = ownedQtyMap[p.id] ?? 0;
          const canAfford = state.cash >= p.buyPrice;

          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.productCard,
                locked && styles.productLocked,
                owned > 0 && styles.productOwned,
              ]}
              onPress={() => !locked && setSelected(p)}
              activeOpacity={locked ? 1 : 0.78}
            >
              {/* Owned badge */}
              {owned > 0 && (
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedBadgeText}>{owned}</Text>
                </View>
              )}

              <Text style={styles.productEmoji}>{p.emoji}</Text>
              <Text style={styles.productName} numberOfLines={2}>{name}</Text>
              <Text style={[styles.productPrice, !canAfford && !locked && { color: colors.danger }]}>
                {formatTZS(p.buyPrice)}
              </Text>

              <View style={styles.pillRow}>
                <Pill
                  label={t(`demand_${p.demand}`, lang)}
                  bg={demandColor[p.demand] + '28'}
                  color={demandColor[p.demand]}
                />
                <Pill
                  label={`+${marginPercent}%`}
                  bg={colors.success + '22'}
                  color={colors.success}
                />
                <Pill
                  label={insight.label}
                  bg={insightColor[insight.tone] + '22'}
                  color={insightColor[insight.tone]}
                />
              </View>

              {/* Quick buy button */}
              {!locked && (
                <TouchableOpacity
                  style={[
                    styles.quickBuyBtn,
                    (!canAfford || freeSlots === 0) && styles.quickBuyDisabled,
                  ]}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleQuickBuy(p);
                  }}
                  disabled={!canAfford || freeSlots === 0}
                >
                  <Text style={styles.quickBuyText}>+1</Text>
                </TouchableOpacity>
              )}

              {locked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockText}>🔒 Level {p.unlockLevel}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selected && (
        <BuyModal
          product={selected}
          onClose={() => setSelected(null)}
          onBuy={(qty) => handleBuy(selected.id, qty)}
          freeSlots={freeSlots}
          cash={state.cash}
          ownedQty={ownedQtyMap[selected.id] ?? 0}
          lang={lang}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 40,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: font.sm, color: colors.text },
  cashPill: {
    backgroundColor: colors.primaryLight + '22',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  cashPillText: { color: colors.primary, fontSize: font.xs, fontWeight: '800' },
  capRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  capText: { fontSize: font.xs, color: colors.textMuted },
  catScroll: { flexGrow: 0, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catLabel: { fontSize: font.xs, fontWeight: '700', color: colors.text },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60, width: '100%' },
  emptyText: { color: colors.textMuted, fontSize: font.md },
  productCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
    position: 'relative',
    overflow: 'hidden',
    gap: 4,
  },
  productLocked: { opacity: 0.45 },
  productOwned: { borderColor: colors.primary + '66', backgroundColor: '#F4FBF9' },
  ownedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  ownedBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  productEmoji: { fontSize: 30 },
  productName: { fontSize: font.xs, fontWeight: '700', color: colors.text, lineHeight: 16 },
  productPrice: { fontSize: font.sm, fontWeight: '800', color: colors.primaryDark },
  pillRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 2 },
  quickBuyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  quickBuyDisabled: { backgroundColor: '#C5C5C5' },
  quickBuyText: { color: '#fff', fontSize: font.xs, fontWeight: '900' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFFCC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  lockText: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  // Modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text, flex: 1 },
  desc: { color: colors.textMuted, fontSize: font.sm, lineHeight: 20 },
  ownedHint: { color: colors.primary, fontSize: font.xs, fontWeight: '700', marginTop: 6 },
  qtyLabel: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm, fontSize: font.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  qtyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 44,
  },
  qtyBtnSm: { minWidth: 36 },
  qtyBtnText: { color: '#fff', fontSize: font.md, fontWeight: '800' },
  qtyNum: { fontSize: font.xxl, fontWeight: '900', color: colors.text, minWidth: 52, textAlign: 'center' },
  presets: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'center' },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  insightTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  insightScore: { fontSize: font.xxl, fontWeight: '900', minWidth: 42, textAlign: 'center' },
  insightLabel: { fontSize: font.sm, fontWeight: '900', color: colors.text },
  insightDesc: { fontSize: font.xs, color: colors.textMuted, lineHeight: 17, marginTop: 2 },
});
