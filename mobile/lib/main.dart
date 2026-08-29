import 'package:flutter/material.dart';
import 'screens/main_navigation.dart';

void main() {
  runApp(const DeallyhubApp());
}

class DeallyhubApp extends StatelessWidget {
  const DeallyhubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Deallyhub',
      debugShowCheckedModeBanner: false,
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
  }
}
