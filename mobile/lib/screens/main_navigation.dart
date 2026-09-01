import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';
import 'home_screen.dart';
import 'saved_screen.dart';
import 'post_ad_screen.dart';
import 'messages_screen.dart';
import 'profile_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  int _authVersion = 0;
  int _savedVersion = 0;

  @override
  void initState() {
    super.initState();
    ApiService.initSavedCount();
    ApiService.getSavedAdIds();
  }

  void _onAuthChanged() {
    setState(() {
      _authVersion++;
      _savedVersion++;
    });
  }

  Future<void> _handleTabTapped(int idx) async {
    // Restrict "Post Ad" tab (index 2) strictly to registered/logged in users
    if (idx == 2) {
      final token = await ApiService.getToken();
      if (token == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Theme.of(context).brightness == Brightness.dark
                ? const Color(0xFF1E293B)
                : const Color(0xFF002F34),
            content: Text(
              tr('post_req_auth'),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(
                color: Theme.of(context).brightness == Brightness.dark
                    ? const Color(0xFF334155)
                    : Colors.transparent,
              ),
            ),
            duration: const Duration(seconds: 3),
          ),
        );
        setState(() => _currentIndex = 4); // Redirect to Account panel
        return;
      }
    }

    if (idx == 1) {
      _savedVersion++;
    }

    setState(() => _currentIndex = idx);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListenableBuilder(
      listenable: LanguageController.instance,
      builder: (context, _) {
        final screens = [
          const HomeScreen(),
          SavedScreen(
            key: ValueKey('saved_${_authVersion}_$_savedVersion'),
            onGoToAccount: () => setState(() => _currentIndex = 4),
          ),
          PostAdScreen(
            key: ValueKey('post_ad_$_authVersion'),
            onAdCreated: () => setState(() => _currentIndex = 0),
            onGoToAccount: () => setState(() => _currentIndex = 4),
          ),
          const MessagesScreen(),
          ProfileScreen(
            key: ValueKey('profile_$_authVersion'),
            onAuthChanged: _onAuthChanged,
            onNavigateTab: (targetIdx) {
              if (targetIdx == 1) _savedVersion++;
              setState(() => _currentIndex = targetIdx);
            },
          ),
        ];

        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          body: IndexedStack(
            index: _currentIndex,
            children: screens,
          ),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: _handleTabTapped,
            type: BottomNavigationBarType.fixed,
            backgroundColor: Theme.of(context).colorScheme.surface,
            selectedItemColor: isDark
                ? const Color(0xFF2DD4BF)
                : const Color(0xFF002F34),
            unselectedItemColor: isDark
                ? const Color(0xFF94A3B8)
                : Colors.grey.shade500,
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
            unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 11),
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.explore_outlined),
                activeIcon: const Icon(Icons.explore),
                label: tr('nav_explore'),
              ),
              BottomNavigationBarItem(
                icon: ValueListenableBuilder<int>(
                  valueListenable: ApiService.savedCountNotifier,
                  builder: (context, count, child) {
                    return Badge(
                      isLabelVisible: count > 0,
                      label: Text(
                        '$count',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.white),
                      ),
                      backgroundColor: const Color(0xFFE11D48),
                      child: const Icon(Icons.favorite_border),
                    );
                  },
                ),
                activeIcon: ValueListenableBuilder<int>(
                  valueListenable: ApiService.savedCountNotifier,
                  builder: (context, count, child) {
                    return Badge(
                      isLabelVisible: count > 0,
                      label: Text(
                        '$count',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.white),
                      ),
                      backgroundColor: const Color(0xFFE11D48),
                      child: const Icon(Icons.favorite),
                    );
                  },
                ),
                label: tr('nav_saved'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.add_circle_outline, size: 28, color: Color(0xFF0D9488)),
                activeIcon: const Icon(Icons.add_circle, size: 28, color: Color(0xFF0D9488)),
                label: tr('nav_post_ad'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.chat_bubble_outline),
                activeIcon: const Icon(Icons.chat_bubble),
                label: tr('nav_messages'),
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.person_outline),
                activeIcon: const Icon(Icons.person),
                label: tr('nav_account'),
              ),
            ],
          ),
        );
      },
    );
  }
}
