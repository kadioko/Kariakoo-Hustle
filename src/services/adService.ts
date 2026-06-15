import {
  ADMOB_INTERSTITIAL_AD_UNIT_ID,
  ADMOB_REWARDED_AD_UNIT_ID,
  ADS_ENABLED,
  INTERSTITIALS_ENABLED,
  RewardedAdType,
} from '@/data/monetization';

type MobileAdsModule = typeof import('react-native-google-mobile-ads');

export type AdServiceStatus =
  | 'disabled'
  | 'loaded'
  | 'shown'
  | 'earned'
  | 'closed'
  | 'failed';

export interface AdServiceResult {
  ok: boolean;
  status: AdServiceStatus;
  rewardEarned?: boolean;
  error?: string;
}

const rewardedLoaded: Partial<Record<RewardedAdType, boolean>> = {};
let mobileAdsModule: MobileAdsModule | null = null;
let interstitialLoaded = false;

async function getMobileAdsModule(): Promise<MobileAdsModule> {
  if (!mobileAdsModule) {
    mobileAdsModule = await import('react-native-google-mobile-ads');
  }
  return mobileAdsModule;
}

function useTestAds(): boolean {
  return typeof __DEV__ !== 'undefined' ? __DEV__ : true;
}

async function initializeAds(): Promise<void> {
  const mod = await getMobileAdsModule();
  await mod.default().initialize();
}

export async function loadRewardedAd(type: RewardedAdType): Promise<AdServiceResult> {
  if (!ADS_ENABLED) {
    rewardedLoaded[type] = true;
    return { ok: true, status: 'disabled' };
  }

  try {
    const mod = await getMobileAdsModule();
    await initializeAds();
    const adUnitId = useTestAds() ? mod.TestIds.REWARDED : ADMOB_REWARDED_AD_UNIT_ID;
    const rewarded = mod.RewardedAd.createForAdRequest(adUnitId, {
      keywords: ['business', 'education', 'shopping'],
    });

    return await new Promise<AdServiceResult>((resolve) => {
      const unsubscribeLoaded = rewarded.addAdEventListener(mod.RewardedAdEventType.LOADED, () => {
        rewardedLoaded[type] = true;
        unsubscribeLoaded();
        unsubscribeError();
        resolve({ ok: true, status: 'loaded' });
      });
      const unsubscribeError = rewarded.addAdEventListener(mod.AdEventType.ERROR, (error) => {
        rewardedLoaded[type] = false;
        unsubscribeLoaded();
        unsubscribeError();
        resolve({ ok: false, status: 'failed', error: String(error) });
      });
      rewarded.load();
    });
  } catch (error) {
    rewardedLoaded[type] = false;
    return { ok: false, status: 'failed', error: String(error) };
  }
}

export function isRewardedReady(type: RewardedAdType): boolean {
  return !ADS_ENABLED || rewardedLoaded[type] === true;
}

export async function showRewardedAd(type: RewardedAdType): Promise<AdServiceResult> {
  if (!ADS_ENABLED) {
    rewardedLoaded[type] = true;
    return { ok: true, status: 'earned', rewardEarned: true };
  }

  try {
    const mod = await getMobileAdsModule();
    await initializeAds();
    const adUnitId = useTestAds() ? mod.TestIds.REWARDED : ADMOB_REWARDED_AD_UNIT_ID;
    const rewarded = mod.RewardedAd.createForAdRequest(adUnitId, {
      keywords: ['business', 'education', 'shopping'],
    });

    return await new Promise<AdServiceResult>((resolve) => {
      let earned = false;
      const cleanup = () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
      };
      const finish = (result: AdServiceResult) => {
        rewardedLoaded[type] = false;
        cleanup();
        resolve(result);
      };
      const unsubscribeLoaded = rewarded.addAdEventListener(mod.RewardedAdEventType.LOADED, () => {
        rewarded.show();
      });
      const unsubscribeEarned = rewarded.addAdEventListener(mod.RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      const unsubscribeClosed = rewarded.addAdEventListener(mod.AdEventType.CLOSED, () => {
        finish({
          ok: earned,
          status: earned ? 'earned' : 'closed',
          rewardEarned: earned,
        });
      });
      const unsubscribeError = rewarded.addAdEventListener(mod.AdEventType.ERROR, (error) => {
        finish({ ok: false, status: 'failed', error: String(error) });
      });
      rewarded.load();
    });
  } catch (error) {
    rewardedLoaded[type] = false;
    return { ok: false, status: 'failed', error: String(error) };
  }
}

export async function loadInterstitialAd(): Promise<AdServiceResult> {
  if (!INTERSTITIALS_ENABLED) {
    interstitialLoaded = false;
    return { ok: true, status: 'disabled' };
  }

  try {
    const mod = await getMobileAdsModule();
    await initializeAds();
    const adUnitId = useTestAds() ? mod.TestIds.INTERSTITIAL : ADMOB_INTERSTITIAL_AD_UNIT_ID;
    const interstitial = mod.InterstitialAd.createForAdRequest(adUnitId, {
      keywords: ['business', 'education', 'shopping'],
    });

    return await new Promise<AdServiceResult>((resolve) => {
      const unsubscribeLoaded = interstitial.addAdEventListener(mod.AdEventType.LOADED, () => {
        interstitialLoaded = true;
        unsubscribeLoaded();
        unsubscribeError();
        resolve({ ok: true, status: 'loaded' });
      });
      const unsubscribeError = interstitial.addAdEventListener(mod.AdEventType.ERROR, (error) => {
        interstitialLoaded = false;
        unsubscribeLoaded();
        unsubscribeError();
        resolve({ ok: false, status: 'failed', error: String(error) });
      });
      interstitial.load();
    });
  } catch (error) {
    interstitialLoaded = false;
    return { ok: false, status: 'failed', error: String(error) };
  }
}

export function isInterstitialReady(): boolean {
  return INTERSTITIALS_ENABLED && interstitialLoaded;
}
