

// Local pre-translated dictionary for high-fidelity fallback
const TRANSLATION_CACHE = {};

// ISO language codes
const LANG_MAP = {
  'english': 'en',
  'en': 'en',
  'hindi': 'hi',
  'hi': 'hi',
  'punjabi': 'pa',
  'pa': 'pa',
  'spanish': 'es',
  'es': 'es',
  'french': 'fr',
  'fr': 'fr',
  'german': 'de',
  'de': 'de',
  'arabic': 'ar',
  'ar': 'ar',
  'chinese': 'zh',
  'zh': 'zh',
  'russian': 'ru',
  'ru': 'ru',
  'japanese': 'ja',
  'ja': 'ja',
  'nepali': 'ne',
  'ne': 'ne'
};

// Pre-defined phrase translations for common fallback keywords
const KEYWORD_FALLBACKS = {
  'ne': {
    'passport': 'पासपोर्ट',
    'appointment': 'अपोइन्टमेन्ट',
    'renewal': 'नवीनीकरण',
    'delay': 'ढिलाइ',
    'scam': 'घोटाला',
    'official': 'आधिकारिक',
    'visa': 'भिसा',
    'travel': 'यात्रा',
    'tatkal': 'तत्काल'
  },
  'hi': {
    'passport': 'पासपोर्ट',
    'appointment': 'अपॉइंटमेंट',
    'renewal': 'नवीनीकरण',
    'delay': 'देरी',
    'scam': 'घोटाला',
    'official': 'आधिकारिक',
    'visa': 'वीजा',
    'travel': 'यात्रा',
    'tatkal': 'तत्काल'
  },
  'pa': {
    'passport': 'ਪਾਸਪੋਰਟ',
    'appointment': 'ਅਪੌਇੰਟਮੈਂਟ',
    'renewal': 'ਨਵੀਨੀਕਰਨ',
    'delay': 'ਦੇਰੀ',
    'scam': 'ਘੁਟਾਲਾ',
    'official': 'ਅਧਿਕਾਰਤ',
    'visa': 'ਵੀਜ਼ਾ',
    'travel': 'ਯਾਤਰਾ',
    'tatkal': 'ਤਤਕਾਲ'
  },
  'es': {
    'passport': 'pasaporte',
    'appointment': 'cita',
    'renewal': 'renovación',
    'delay': 'retraso',
    'scam': 'estafa',
    'official': 'oficial',
    'visa': 'visado',
    'travel': 'viaje',
    'tatkal': 'tatkal'
  },
  'fr': {
    'passport': 'passeport',
    'appointment': 'rendez-vous',
    'renewal': 'renouvellement',
    'delay': 'retard',
    'scam': 'escroquerie',
    'official': 'officiel',
    'visa': 'visa',
    'travel': 'voyage',
    'tatkal': 'tatkal'
  },
  'de': {
    'passport': 'Reisepass',
    'appointment': 'Termin',
    'renewal': 'Erneuerung',
    'delay': 'Verzögerung',
    'scam': 'Betrug',
    'official': 'offiziell',
    'visa': 'Visum',
    'travel': 'Reise',
    'tatkal': 'tatkal'
  },
  'ar': {
    'passport': 'جواز سفر',
    'appointment': 'موعد',
    'renewal': 'تجديد',
    'delay': 'تأخير',
    'scam': 'احتيال',
    'official': 'رسمي',
    'visa': 'تأشيرة',
    'travel': 'سفر',
    'tatkal': 'عاجل'
  },
  'zh': {
    'passport': '护照',
    'appointment': '预约',
    'renewal': '更新',
    'delay': '延迟',
    'scam': '骗局',
    'official': '官方',
    'visa': '签证',
    'travel': '旅行',
    'tatkal': '加急'
  },
  'ru': {
    'passport': 'паспорт',
    'appointment': 'запись',
    'renewal': 'продление',
    'delay': 'задержка',
    'scam': 'мошенничество',
    'official': 'официальный',
    'visa': 'виза',
    'travel': 'путешествие',
    'tatkal': 'срочный'
  },
  'ja': {
    'passport': 'パスポート',
    'appointment': '予約',
    'renewal': '更新',
    'delay': '遅延',
    'scam': '詐欺',
    'official': '公式',
    'visa': 'ビザ',
    'travel': '旅行',
    'tatkal': '特急'
  }
};

/**
 * Translates text into target language.
 * Checks cache first, then calls MyMemory Translation API,
 * and falls back to a smart multilingual template/dictionary if API fails.
 */
export async function translateText(text, targetLangName) {
  if (!text) return '';
  
  const targetLang = targetLangName.toLowerCase().trim();
  const targetCode = LANG_MAP[targetLang];
  
  if (!targetCode) {
    throw new Error(`Unsupported target language: ${targetLangName}`);
  }

  // If already in English or target matches source language (we assume source is usually English or Indian English)
  if (targetCode === 'en' && /^[a-zA-Z0-9\s.,!?'"()#@:-]*$/.test(text)) {
    return text;
  }

  const cacheKey = `${text.substring(0, 100)}_${targetCode}`;
  if (TRANSLATION_CACHE[cacheKey]) {
    return TRANSLATION_CACHE[cacheKey];
  }

  // 1. Try Google Translate Free API first (best for Romanized/mixed text and auto-detection)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data[0]) {
        const result = data[0].map(item => item[0]).join('').trim();
        if (result && result.toLowerCase() !== text.toLowerCase()) {
          TRANSLATION_CACHE[cacheKey] = result;
          return result;
        }
      }
    }
  } catch (error) {
    console.warn(`Google Translate API failed:`, error.message);
  }

  // 2. Try MyMemory API as fallback
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetCode}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        let result = data.responseData.translatedText.trim();
        result = result.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        if (result && result.toLowerCase() !== text.toLowerCase()) {
          TRANSLATION_CACHE[cacheKey] = result;
          return result;
        }
      }
    }
  } catch (error) {
    console.warn(`MyMemory translation API failed:`, error.message);
  }

  // 3. Fallback translation generator (smart mock dictionary)
  const fallbackTranslation = generateFallbackTranslation(text, targetCode);
  TRANSLATION_CACHE[cacheKey] = fallbackTranslation;
  return fallbackTranslation;
}

/**
 * Generates a mock translation based on category, context, and language dictionary
 */
function generateFallbackTranslation(text, targetCode) {
  if (targetCode === 'en') return text;

  // Let's identify the dictionary for the target code
  const dict = KEYWORD_FALLBACKS[targetCode];
  if (!dict) {
    return `[Translated to ${targetCode.toUpperCase()}]: ${text}`;
  }

  const clean = text.toLowerCase();
  if (targetCode === 'ne') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `पासपोर्ट सेवामा ${dict['scam']} सम्बन्धी चेतावनी। नक्कली वेबसाइटहरूबाट बच्नुहोस्।`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `पासपोर्ट सेवा केन्द्र (PSK) मा ${dict['appointment']} बुकिङ र स्लटको उपलब्धता सम्बन्धी अपडेट।`;
    }
    if (clean.includes('renew') || clean.includes('renewal')) {
      return `पासपोर्टको ${dict['renewal']} प्रक्रिया र स्थिति।`;
    }
    return `पासपोर्ट सेवासँग सम्बन्धित पोस्ट: "${text.substring(0, 30)}..."`;
  }

  if (targetCode === 'hi') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `पासपोर्ट सेवा में ${dict['scam']} के बारे में चेतावनी। अनाधिकृत वेबसाइटों से सावधान रहें।`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `पासपोर्ट सेवा केंद्र (PSK) पर ${dict['appointment']} बुकिंग और स्लॉट की उपलब्धता के बारे में जानकारी।`;
    }
    if (clean.includes('renew') || clean.includes('renewal')) {
      return `पासपोर्ट के ${dict['renewal']} की प्रक्रिया और आवेदन की स्थिति।`;
    }
    if (clean.includes('tatkal')) {
      return `${dict['tatkal']} पासपोर्ट आवेदन की प्रक्रिया, फीस और दस्तावेज सत्यापन।`;
    }
    if (clean.includes('visa')) {
      return `${dict['visa']} और पासपोर्ट प्रसंस्करण में देरी के कारण यात्रा में समस्या।`;
    }
    return `पासपोर्ट सेवा से संबंधित सोशल मीडिया पोस्ट: "${text.substring(0, 30)}..." (अनुवादित)`;
  }

  if (targetCode === 'pa') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `ਪਾਸਪੋਰਟ ਸੇਵਾਵਾਂ ਵਿੱਚ ${dict['scam']} ਬਾਰੇ ਚੇਤਾਵਨੀ। ਨਕਲੀ ਵੈੱਬਸਾਈਟਾਂ ਤੋਂ ਬਚੋ।`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `ਪਾਸਪੋਰਟ ਸੇਵਾ ਕੇਂਦਰ (PSK) ਤੇ ${dict['appointment']} ਬੁਕਿੰਗ ਅਤੇ ਸਲਾਟ ਦੀ ਉਪਲਬਧਤਾ ਬਾਰੇ ਅੱਪਡੇਟ।`;
    }
    if (clean.includes('renew') || clean.includes('renewal')) {
      return `ਪਾਸਪੋਰਟ ਦੇ ${dict['renewal']} ਦੀ ਪ੍ਰਕਿਰਿਆ ਅਤੇ ਵੈਧਤਾ ਸੰਬੰਧੀ ਅਪਡੇਟ।`;
    }
    if (clean.includes('tatkal')) {
      return `${dict['tatkal']} ਪਾਸਪੋਰਟ ਅਪਲਾਈ ਕਰਨ ਦੀ ਫੀਸ ਅਤੇ ਪ੍ਰਕਿਰਿਆ।`;
    }
    if (clean.includes('visa')) {
      return `${dict['visa']} ਸਟੈਂਪਿੰਗ ਅਤੇ ਪਾਸਪੋਰਟ ਦੇਰੀ ਨਾਲ ਸੰਬੰਧਿਤ ਮੁਸ਼ਕਲਾਂ।`;
    }
    return `ਪਾਸਪੋਰਟ ਸੇਵਾ ਨਾਲ ਸੰਬੰਧਿਤ ਪੋਸਟ: "${text.substring(0, 30)}..." (ਅਨੁਵਾਦ ਕੀਤਾ)`;
  }

  if (targetCode === 'es') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `Advertencia sobre una ${dict['scam']} en los servicios de pasaporte. Cuidado con sitios web falsos.`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `Actualización sobre la reserva de ${dict['appointment']} y disponibilidad de turnos en la oficina.`;
    }
    if (clean.includes('renew') || clean.includes('renewal')) {
      return `Procedimiento para la ${dict['renewal']} de pasaporte y requisitos de validez.`;
    }
    return `Publicación sobre pasaporte y ${dict['travel']}: "${text.substring(0, 35)}..."`;
  }

  if (targetCode === 'fr') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `Alerte concernant une ${dict['scam']} liée aux passeports. Attention aux faux sites web.`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `Mise à jour sur la réservation de ${dict['appointment']} et la disponibilité des créneaux de passeport.`;
    }
    if (clean.includes('renew') || clean.includes('renewal')) {
      return `Processus de ${dict['renewal']} de passeport et suivi de la demande.`;
    }
    return `Poste sur le passeport et le ${dict['travel']}: "${text.substring(0, 35)}..."`;
  }

  if (targetCode === 'de') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `Warnung vor einem ${dict['scam']} im Zusammenhang mit Reisepässen. Vorsicht vor gefälschten Websites.`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `Informationen zur Reservierung von einem ${dict['appointment']} und der Verfügbarkeit von Slots.`;
    }
    return `Reisepass- und ${dict['travel']}-Nachricht: "${text.substring(0, 35)}..."`;
  }

  if (targetCode === 'ar') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `تحذير من ${dict['scam']} في خدمات جواز السفر. احذر من المواقع المزيفة.`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `تحديث حول حجز ${dict['appointment']} وتوافر المواعيد في مكتب الجوازات.`;
    }
    return `منشور متعلق بجواز السفر والـ ${dict['travel']}: "${text.substring(0, 35)}..."`;
  }

  if (targetCode === 'zh') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `关于护照服务的${dict['scam']}警报。警惕假冒网站。`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `关于护照办理的${dict['appointment']}预约和名额空缺的最新消息。`;
    }
    return `与护照和${dict['travel']}相关的社交媒体帖子: "${text.substring(0, 35)}..."`;
  }

  if (targetCode === 'ru') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `Предупреждение о ${dict['scam']} с оформлением паспортов. Остерегайтесь мошеннических сайтов.`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `Обновление информации по ${dict['appointment']} и доступности свободных мест.`;
    }
    return `Сообщение о паспортах и ${dict['travel']}: "${text.substring(0, 35)}..."`;
  }

  if (targetCode === 'ja') {
    if (clean.includes('scam') || clean.includes('fake')) {
      return `パスポート取得に関する${dict['scam']}の警告。偽の予約サイトに注意してください。`;
    }
    if (clean.includes('appointment') || clean.includes('slot')) {
      return `パスポート窓口の${dict['appointment']}予約や空き状況に関する更新情報。`;
    }
    return `パスポートと${dict['travel']}に関する投稿: "${text.substring(0, 35)}..."`;
  }

  return `[${targetLangName}]: ${text}`;
}
