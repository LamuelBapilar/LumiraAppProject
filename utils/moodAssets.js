// Central mapping for mood assets (images) and fallbacks

const MOOD_MAP = {
  happy: {
    label: 'Happy',
    image: '@/assets/images/calmi-happy.png',
    emoji: '😊',
  },
  depressed: {
    label: 'Depressed',
    image: '@/assets/images/calm-depressed.png',
    emoji: '😔',
  },
  sad: {
    label: 'Sad',
    image: '@/assets/images/calmi-sad.png',
    emoji: '😢',
  },
  angry: {
    label: 'Angry',
    image: '@/assets/images/calmi-angry.png',
    emoji: '😠',
  },
  tired: {
    label: 'Tired',
    image: '@/assets/images/calmi-tired.png',
    emoji: '😴',
  },
  confused: {
    label: 'Confused',
    image: '@/assets/images/calmi-confused.png',
    emoji: '😕',
  },
};

export const getAssetByKey = (key) => MOOD_MAP[key?.toLowerCase?.()] || null;

export const getEmojiForMoodKey = (key) => (getAssetByKey(key)?.emoji || '🙂');

export const getImageForMoodKey = (key) => getAssetByKey(key)?.image || null;

export const getLabelForMoodKey = (key) => getAssetByKey(key)?.label || key;

// Parse a stored feeling string and return display metadata
// Accepts formats like:
// - "/assets/images/calmi-happy.png Happy"
// - "happy"
// - "😊 Happy"
export const getDisplayForFeeling = (feeling) => {
  const str = (feeling || '').trim();
  if (!str) return { type: 'emoji', char: '🙂', label: 'Neutral', key: 'neutral' };

  // If starts with an image path
  if (str.startsWith('/assets/') || str.startsWith('assets/')) {
    const parts = str.split(/\s+/);
    const img = parts[0];
    const file = img.split('/').pop().split('.')[0];
    // map filename to key
    const keyFromFile = file
      .replace('calmi-', '')
      .replace('calm-', '')
      .toLowerCase();
    const asset = getAssetByKey(keyFromFile);
    const label = parts.slice(1).join(' ') || asset?.label || keyFromFile;
    return {
      type: 'image',
      src: asset?.image || img,
      label,
      key: keyFromFile,
      char: asset?.emoji || '🙂',
    };
  }

  // If first token is an emoji character
  if (/^[\p{Emoji}\p{Extended_Pictographic}]/u.test(str)) {
    const [emoji, ...rest] = str.split(' ');
    const label = rest.join(' ') || 'Neutral';
    // best-effort map label to key
    const key = label.toLowerCase();
    const asset = getAssetByKey(key);
    return asset
      ? { type: 'image', src: asset.image, label: asset.label, key, char: asset.emoji }
      : { type: 'emoji', char: emoji, label, key };
  }

  // Else assume it's just a key
  const key = str.toLowerCase();
  const asset = getAssetByKey(key);
  if (asset) {
    return { type: 'image', src: asset.image, label: asset.label, key, char: asset.emoji };
  }
  // Fallback
  return { type: 'emoji', char: '🙂', label: key, key };
};


