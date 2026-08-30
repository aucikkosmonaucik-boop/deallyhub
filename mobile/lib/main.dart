import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/language_controller.dart';
import 'screens/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LanguageController.instance.init();
  runApp(const DeallyhubApp());
}

class DeallyhubApp extends StatelessWidget {
  const DeallyhubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: LanguageController.instance,
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
          theme: ThemeData(
            useMaterial3: true,
            fontFamily: 'Roboto',
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF002F34),
              primary: const Color(0xFF002F34),
              secondary: const Color(0xFF0D9488),
            ),
            scaffoldBackgroundColor: const Color(0xFFF9FAFB),
          ),
          home: const MainNavigation(),
        );
      },
    );
  }
}
