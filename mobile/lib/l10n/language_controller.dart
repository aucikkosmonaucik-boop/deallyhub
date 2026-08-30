import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_translations.dart';

class LanguageController extends ChangeNotifier {
  static final LanguageController instance = LanguageController._internal();
  LanguageController._internal();

  static const String _prefKey = 'deallyhub_language';
  static const String defaultLang = 'en';

  Locale _locale = const Locale(defaultLang);
  bool _initialized = false;

  Locale get currentLocale => _locale;
  String get languageCode => _locale.languageCode;
  bool get isInitialized => _initialized;

  /// Initialize language setting from storage or platform locale
  Future<void> init() async {
    if (_initialized) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final savedCode = prefs.getString(_prefKey);

      if (savedCode != null && _isSupported(savedCode)) {
        _locale = Locale(savedCode);
      } else {
        // Match device locale
        final deviceLocales = WidgetsBinding.instance.platformDispatcher.locales;
        String matchedCode = defaultLang;
        for (final loc in deviceLocales) {
          if (_isSupported(loc.languageCode)) {
            matchedCode = loc.languageCode;
            break;
          }
        }
        _locale = Locale(matchedCode);
      }
    } catch (e) {
      debugPrint('Error loading language preferences: $e');
      _locale = const Locale(defaultLang);
    } finally {
      _initialized = true;
      notifyListeners();
    }
  }

  bool _isSupported(String code) {
    return AppTranslations.supportedLanguages.any((l) => l['code'] == code);
  }

  /// Change active language and persist to SharedPreferences
  Future<void> setLanguage(String langCode) async {
    if (!_isSupported(langCode)) return;
    if (_locale.languageCode == langCode) return;

    _locale = Locale(langCode);
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefKey, langCode);
    } catch (e) {
      debugPrint('Error saving language preference: $e');
    }
  }

  /// Translate a string key in current language
  String t(String key, [String? fallback]) {
    return AppTranslations.translate(_locale.languageCode, key, fallback);
  }

  /// Translate category slug in current language
  String getCategoryName(String slug, [String? fallback]) {
    return AppTranslations.getCategoryName(_locale.languageCode, slug, fallback);
  }
}

/// Global shortcut functions
String tr(String key, [String? fallback]) => LanguageController.instance.t(key, fallback);
String trCat(String slug, [String? fallback]) => LanguageController.instance.getCategoryName(slug, fallback);
