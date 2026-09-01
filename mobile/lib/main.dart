import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/language_controller.dart';
import 'theme/theme_controller.dart';
import 'theme/app_theme.dart';
import 'screens/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LanguageController.instance.init();
  await ThemeController.instance.init();
  runApp(const DeallyhubApp());
}

class DeallyhubApp extends StatelessWidget {
  const DeallyhubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([
        LanguageController.instance,
        ThemeController.instance,
      ]),
      builder: (context, _) {
        return MaterialApp(
          title: 'Deally',
          debugShowCheckedModeBanner: false,
          locale: LanguageController.instance.currentLocale,
          supportedLocales: const [
            Locale('en'),
            Locale('fr'),
            Locale('es'),
            Locale('de'),
            Locale('pl'),
            Locale('it'),
            Locale('el'),
          ],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeController.instance.themeMode,
          home: const MainNavigation(),
        );
      },
    );
  }
}

