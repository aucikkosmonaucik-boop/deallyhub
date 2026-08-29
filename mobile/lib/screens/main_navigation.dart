import 'package:flutter/material.dart';
import '../api/api_service.dart';
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

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const HomeScreen(),
      const SavedScreen(),
      PostAdScreen(
        onAdCreated: () => setState(() => _currentIndex = 0),
        onGoToAccount: () => setState(() => _currentIndex = 4),
      ),
      const MessagesScreen(),
      ProfileScreen(
        onAuthChanged: () => setState(() {}),
      ),
    ];
  }

  Future<void> _handleTabTapped(int idx) async {
    // Restrict "Post Ad" tab (index 2) strictly to registered/logged in users
    if (idx == 2) {
      final token = await ApiService.getToken();
      if (token == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF002F34),
            content: Text(
              'Registration Required: Please sign in or create an account to post advertisements.',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            duration: Duration(seconds: 3),
          ),
        );
        setState(() => _currentIndex = 4); // Redirect to Account panel
        return;
      }
    }

    setState(() => _currentIndex = idx);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _handleTabTapped,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF002F34),
        unselectedItemColor: Colors.grey.shade400,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 11),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.explore_outlined),
            activeIcon: Icon(Icons.explore),
            label: 'Explore',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite_border),
            activeIcon: Icon(Icons.favorite),
            label: 'Saved',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle_outline, size: 28, color: Color(0xFF0D9488)),
            activeIcon: Icon(Icons.add_circle, size: 28, color: Color(0xFF0D9488)),
            label: 'Post Ad',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            activeIcon: Icon(Icons.chat_bubble),
            label: 'Messages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}
