/// Deallyhub Mobile App Content & Profanity Filter Module
/// Provides client-side real-time profanity checking and censoring in the Flutter Android APK and iOS apps.
class AppContentFilter {
  static const Set<String> safeWordsWhitelist = {
    'rabat',
    'rabatu',
    'rabaty',
    'faktura',
    'faktury',
    'fakturę',
    'faktura vat',
    'dokument',
    'dokumenty',
    'klasyk',
    'klasyka',
    'klasyczny',
    'klasyczna',
    'klasyczne',
    'skrot',
    'skrotu',
    'skroty',
    'przesylka',
    'przesylki',
    'wysylka',
    'wysylki',
    'sukienka',
    'sukienki',
    'sukienke',
    'poszukiwany',
    'poszukiwana',
    'poszukiwane',
    'szmatka',
    'szmatki',
    'szmatke',
    'sciereczka',
    'sciereczki',
    'pedal rowerowy',
    'pedal gazu',
    'pedal hamulca',
    'pedal sprzegla',
    'pedaly rowerowe',
    'pedaly platformowe',
    'pedaly spd',
    'pedaly shimano',
    'pedał rowerowy',
    'pedał gazu',
    'pedał hamulca',
    'pedał sprzęgła',
    'pedał platformowy',
    'pedał spd',
    'pedał shimano',
    'jebao',
    'kutasik',
    'assortment',
    'classic',
    'passage',
    'cocktail',
    'peacock',
    'dickies',
    'spitfire',
  };

  static final List<RegExp> profanityPatterns = [
    // --- POLISH (PL) ---
    RegExp(r'\b(?:w|na|za|od|po|przy|pod|roz|do|s|u)?k+[uou]*r+w+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bk+[uou]*r+w+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bk+u+r+e+w+s+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bk+u+r+w+i+s+z+o+n[a-z]*\b', caseSensitive: false),
    RegExp(r'\bk+u+r+w+i+s+k+o[a-z]*\b', caseSensitive: false),
    RegExp(r'\bk+u+r+w+i+a+c[a-z]*\b', caseSensitive: false),

    RegExp(r'\b(?:o|od|za|po|z|u|do|na|w)?(?:ch|h)+[uou]*j+[a-z]*\b', caseSensitive: false),
    RegExp(r'\b(?:ch|h)+u+j+e+k[a-z]*\b', caseSensitive: false),
    RegExp(r'\b(?:ch|h)+u+j+n+i+[a-z]*\b', caseSensitive: false),
    RegExp(r'\b(?:ch|h)+u+j+o+w+[a-z]*\b', caseSensitive: false),
    RegExp(r'\b(?:ch|h)+u+j+a+m+i\b', caseSensitive: false),

    RegExp(r'\b(?:wy|za|do|od|pod|roz|na|u|s|z|po|prze|przy|w)?j+[eou]*b+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bj+[eou]*b+a+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bj+[eou]*b+a+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bz+j+[eou]*b+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+o+j+[eou]*b+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bj+e+b+n+i+e+t+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bj+[eou]*b+a+c\b', caseSensitive: false),

    RegExp(r'\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na|w)?p+[i]*[e]?r+d+o+l+[a-z]*\b', caseSensitive: false),
    RegExp(r'\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na|w)?p+[i]*[e]?r+d+a+l+[a-z]*\b', caseSensitive: false),
    RegExp(r'\b(?:s|wy|za|do|od|roz|o|po|prze|przy|na|w)?p+r+d+l+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+i+e+r+d+o+l+e+\b', caseSensitive: false),
    RegExp(r'\bp+i+e+r+d+o+l+i+s+z+\b', caseSensitive: false),
    RegExp(r'\bp+i+e+r+d+o+l+a+\b', caseSensitive: false),
    RegExp(r'\bp+i+e+r+d+y+k+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+i+e+r+d+z+i+e+l+[a-z]*\b', caseSensitive: false),

    RegExp(r'\b(?:wy|od|za|s|roz|o)?p+[i]*z+d+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+i+z+d+a+\b', caseSensitive: false),
    RegExp(r'\bp+i+z+d+z+i+e+\b', caseSensitive: false),
    RegExp(r'\bp+i+z+d+o+w+a+t+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+i+z+d+k+[a-z]*\b', caseSensitive: false),

    RegExp(r'\bc+i+p+[aeyoęąu]\b', caseSensitive: false),
    RegExp(r'\bc+i+p+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+i+p+s+k+o[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+i+p+e+k[a-z]*\b', caseSensitive: false),

    RegExp(r'\bk+u+t+a+s+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+w+e+l+[a-z]*\b', caseSensitive: false),

    RegExp(r'\bp+e+d+a+l+a+m+i\b', caseSensitive: false),
    RegExp(r'\bp+e+d+a+l+s+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bj+e+b+a+n+y+ +p+e+d+a+l+\b', caseSensitive: false),
    RegExp(r'\bt+y+ +p+e+d+a+l+e+\b', caseSensitive: false),
    RegExp(r'\bp+e+d+a+l+e+\b', caseSensitive: false),

    RegExp(r'\bd+z+i+w+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+z+m+a+t+[aeyoęąu]\b', caseSensitive: false),
    RegExp(r'\bs+z+m+a+c+i+e+\b', caseSensitive: false),
    RegExp(r'\bs+z+m+a+t+l+a+w+i+e+c\b', caseSensitive: false),

    RegExp(r'\bs+k+u+r+w+y+s+y+n[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+k+u+r+w+i+e+l[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+u+k+i+n+s+y+n[a-z]*\b', caseSensitive: false),

    RegExp(r'\bc+h+u+j+o+z+a\b', caseSensitive: false),
    RegExp(r'\bd+o+j+e+b+a+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\br+u+c+h+a+n+i+e\b', caseSensitive: false),
    RegExp(r'\br+u+c+h+a+c\b', caseSensitive: false),
    RegExp(r'\bw+y+r+u+c+h+a+c\b', caseSensitive: false),
    RegExp(r'\bw+k+u+r+w+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bn+a+j+e+b+a+n+[a-z]*\b', caseSensitive: false),

    // --- ENGLISH (EN) ---
    RegExp(r'\bf+[uou]*c+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bm+o+t+h+e+r+f+[uou]*c+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+h+[i]*t+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bb+u+l+l+s+h+i+t+\b', caseSensitive: false),
    RegExp(r'\bb+[i]*t+c+h+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+u+n+t+[a-z]*\b', caseSensitive: false),
    RegExp(r'\ba+s+s+h+[o]*l+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bd+i+c+k+h+e+a+d+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bd+i+c+k+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+u+s+s+y+\b', caseSensitive: false),
    RegExp(r'\bn+i+g+g+e+r+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bn+i+g+g+a+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bf+a+g+g+o+t+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bw+h+o+r+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+l+u+t+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bb+a+s+t+a+r+d+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+o+c+k+s+u+c+k+e+r+[a-z]*\b', caseSensitive: false),

    // --- GERMAN (DE) ---
    RegExp(r'\bs+c+h+e+i+s+s+[a-z]*\b', caseSensitive: false),
    RegExp(r'\ba+r+s+c+h+l+o+c+h+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bh+u+r+e+n+s+o+h+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bf+o+t+z+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bw+i+c+h+s+e+r+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+c+h+l+a+m+p+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bf+i+c+k+e+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bm+i+s+t+s+t+u+e+c+k+[a-z]*\b', caseSensitive: false),

    // --- FRENCH (FR) ---
    RegExp(r'\bm+e+r+d+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+u+t+a+i+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+o+n+n+a+r+d+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+a+l+o+p+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\be+n+c+u+l+e+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bf+i+l+s+ +d+e+ +p+u+t+e+\b', caseSensitive: false),
    RegExp(r'\bp+u+t+e+[a-z]*\b', caseSensitive: false),

    // --- SPANISH (ES) ---
    RegExp(r'\bm+i+e+r+d+a+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bh+i+j+o+ +d+e+ +p+u+t+a+\b', caseSensitive: false),
    RegExp(r'\bc+a+b+r+o+n+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+e+n+d+e+j+o+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+o+n+o+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bg+i+l+i+p+o+l+l+a+s+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+u+t+a+[a-z]*\b', caseSensitive: false),

    // --- ITALIAN (IT) ---
    RegExp(r'\bc+a+z+z+o+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bs+t+r+o+n+z+o+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bv+a+f+f+a+n+c+u+l+o+\b', caseSensitive: false),
    RegExp(r'\bt+r+o+i+a+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bp+u+t+t+a+n+a+[a-z]*\b', caseSensitive: false),
    RegExp(r'\bc+o+g+l+i+o+n+e+[a-z]*\b', caseSensitive: false),
  ];

  static String normalizeText(String text) {
    if (text.isEmpty) return '';

    String norm = text.toLowerCase();

    const diacritics = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'á': 'a', 'à': 'a', 'â': 'a',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'ô': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u',
      'ñ': 'n', 'ç': 'c',
    };

    diacritics.forEach((k, v) {
      norm = norm.replaceAll(k, v);
    });

    const leet = {
      '@': 'a',
      '0': 'o',
      '1': 'i',
      '!': 'i',
      '|': 'i',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '\$': 's',
      '7': 't',
      '+': 't',
      '8': 'b',
      'v': 'u',
      'vv': 'w',
    };

    leet.forEach((k, v) {
      norm = norm.replaceAll(k, v);
    });

    return norm;
  }

  static String collapseObfuscations(String text) {
    return text.replaceAllMapped(
      RegExp(r'([a-z0-9])[\s._\-*~#^/\\,+]+([a-z0-9])', caseSensitive: false),
      (m) => '${m[1]}${m[2]}',
    );
  }

  static String reduceRepeats(String text) {
    return text.replaceAllMapped(
      RegExp(r'(.)\1{2,}', caseSensitive: false),
      (m) => '${m[1]}${m[1]}',
    );
  }

  /// Returns true if text contains any vulgarity or prohibited profanity.
  static bool containsProfanity(String? text) {
    if (text == null || text.trim().isEmpty) return false;

    final rawNormalized = normalizeText(text);

    if (safeWordsWhitelist.contains(rawNormalized.trim())) {
      return false;
    }

    final collapsed = collapseObfuscations(rawNormalized);
    final collapsedReduced = reduceRepeats(collapsed);
    final collapsed2 = collapseObfuscations(collapsed);

    final variants = [
      rawNormalized,
      collapsed,
      collapsedReduced,
      collapsed2,
      reduceRepeats(rawNormalized),
    ];

    for (final variant in variants) {
      for (final pattern in profanityPatterns) {
        final match = pattern.firstMatch(variant);
        if (match != null) {
          final matchedStr = match.group(0)!.trim();
          bool isWhitelisted = false;

          for (final safe in safeWordsWhitelist) {
            if (safe == matchedStr || (safe.length >= 4 && rawNormalized.contains(safe))) {
              isWhitelisted = true;
              break;
            }
          }

          if (!isWhitelisted) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /// Censors profanity by replacing inner characters with asterisks (e.g. k****a).
  static String censorProfanity(String text) {
    if (text.isEmpty) return text;

    String censored = text;
    for (final pattern in profanityPatterns) {
      censored = censored.replaceAllMapped(pattern, (match) {
        final matched = match.group(0)!;
        final norm = normalizeText(matched);
        if (safeWordsWhitelist.contains(norm)) {
          return matched;
        }
        if (matched.length <= 2) return '*' * matched.length;
        return matched[0] + ('*' * (matched.length - 2)) + matched[matched.length - 1];
      });
    }
    return censored;
  }
}
