import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:deallyhub_mobile/api/api_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('Guest deleting notification persists ID in SharedPreferences', () async {
    // Calling deleteNotification as guest (token is null)
    await ApiService.deleteNotification(101);

    final prefs = await SharedPreferences.getInstance();
    final guestDismissed = prefs.getStringList('deallyhub_guest_dismissed_notifs');
    expect(guestDismissed, isNotNull);
    expect(guestDismissed, contains('101'));
  });

  test('Guest marking notification read persists ID in SharedPreferences', () async {
    await ApiService.markNotificationRead(202);

    final prefs = await SharedPreferences.getInstance();
    final guestRead = prefs.getStringList('deallyhub_guest_read_notifs');
    expect(guestRead, isNotNull);
    expect(guestRead, contains('202'));
  });

  test('Guest marking all notifications read persists all IDs in SharedPreferences', () async {
    await ApiService.markAllNotificationsRead([301, 302, 303]);

    final prefs = await SharedPreferences.getInstance();
    final guestRead = prefs.getStringList('deallyhub_guest_read_notifs');
    expect(guestRead, isNotNull);
    expect(guestRead, containsAll(['301', '302', '303']));
  });

  test('Logged-in user deleting notification persists ID in user-specific key', () async {
    // Mock user login session
    await ApiService.saveSession('mock-jwt-token', {'id': 42, 'name': 'Test User'});

    await ApiService.deleteNotification(505);

    final prefs = await SharedPreferences.getInstance();
    final userDismissed = prefs.getStringList('deallyhub_user_42_dismissed_notifs');
    expect(userDismissed, isNotNull);
    expect(userDismissed, contains('505'));
  });
}
