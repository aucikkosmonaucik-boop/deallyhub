import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeController extends ChangeNotifier {
  static final ThemeController instance = ThemeController._internal();
  ThemeController._internal();

  static const String _prefKey = 'deallyhub_theme_mode';

  ThemeMode _themeMode = ThemeMode.dark;
  bool _initialized = false;

  ThemeMode get themeMode => _themeMode;
  bool get isInitialized => _initialized;

  /// Returns true if currently in dark theme given the context or system brightness
  bool isDarkMode(BuildContext context) {
    if (_themeMode == ThemeMode.dark) return true;
    if (_themeMode == ThemeMode.light) return false;
    return MediaQuery.platformBrightnessOf(context) == Brightness.dark;
  }

  /// Initialize theme mode from SharedPreferences
  Future<void> init() async {
    if (_initialized) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final savedMode = prefs.getString(_prefKey);

      if (savedMode == 'light') {
        _themeMode = ThemeMode.light;
      } else if (savedMode == 'system') {
        _themeMode = ThemeMode.system;
      } else if (savedMode == 'dark') {
        _themeMode = ThemeMode.dark;
      } else {
        _themeMode = ThemeMode.dark;
      }
    } catch (e) {
      debugPrint('Error loading theme mode: $e');
      _themeMode = ThemeMode.dark;
    } finally {
      _initialized = true;
      notifyListeners();
    }
  }

  /// Set and persist theme mode
  Future<void> setThemeMode(ThemeMode mode) async {
    if (_themeMode == mode) return;

    _themeMode = mode;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      String val = 'system';
      if (mode == ThemeMode.light) val = 'light';
      if (mode == ThemeMode.dark) val = 'dark';
      await prefs.setString(_prefKey, val);
    } catch (e) {
      debugPrint('Error saving theme mode: $e');
    }
  }

  /// Toggle between light and dark modes
  Future<void> toggleTheme(BuildContext context) async {
    final currentlyDark = isDarkMode(context);
    await setThemeMode(currentlyDark ? ThemeMode.light : ThemeMode.dark);
  }
}
