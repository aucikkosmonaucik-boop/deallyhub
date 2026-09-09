import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../api/api_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
}

class PushNotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _androidChannel =
      AndroidNotificationChannel(
    'deallyhub_notifications_channel',
    'Deallyhub Notifications',
    description: 'Notifications for deals, messages, and announcements from Deallyhub',
    importance: Importance.high,
    playSound: true,
  );

  static bool _isInitialized = false;

  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // 1. Initialize Firebase Core safely
      await Firebase.initializeApp();

      // 2. Register background message handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // 3. Request permissions (Android 13+ and iOS)
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('[PushService] User permission status: ${settings.authorizationStatus}');

      // 4. Setup Local Notifications for Foreground display
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const darwinSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: darwinSettings,
      );

      await _localNotifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          // Refresh notifications when user taps the notification
          ApiService.refreshNotificationCount();
        },
      );

      final androidPlugin = _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(_androidChannel);
      }

      // 5. Handle foreground push messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('[PushService] Foreground message received: ${message.notification?.title}');
        
        // Refresh app unread count immediately
        ApiService.refreshNotificationCount();

        final notification = message.notification;
        final android = message.notification?.android;

        if (notification != null && !kIsWeb) {
          _localNotifications.show(
            notification.hashCode,
            notification.title ?? 'Deallyhub',
            notification.body ?? '',
            NotificationDetails(
              android: AndroidNotificationDetails(
                _androidChannel.id,
                _androidChannel.name,
                channelDescription: _androidChannel.description,
                icon: android?.smallIcon ?? '@mipmap/ic_launcher',
                importance: Importance.high,
                priority: Priority.high,
                playSound: true,
              ),
              iOS: const DarwinNotificationDetails(
                presentAlert: true,
                presentBadge: true,
                presentSound: true,
              ),
            ),
          );
        }
      });

      // 6. Retrieve and register FCM device token
      final token = await messaging.getToken();
      if (token != null) {
        debugPrint('[PushService] FCM Token obtained: ${token.substring(0, 10)}...');
        await ApiService.registerDeviceToken(
          token,
          platform: Platform.isIOS ? 'ios' : 'android',
        );
      }

      // 7. Listen for token refreshes
      messaging.onTokenRefresh.listen((newToken) {
        debugPrint('[PushService] FCM Token refreshed');
        ApiService.registerDeviceToken(
          newToken,
          platform: Platform.isIOS ? 'ios' : 'android',
        );
      });

      _isInitialized = true;
      debugPrint('[PushService] Push Notification Service successfully initialized.');
    } catch (e) {
      debugPrint('[PushService] Firebase/FCM setup waiting for google-services.json configuration: $e');
    }
  }

  /// Manually sync token with backend (e.g. after user logs in)
  static Future<void> syncTokenAfterLogin() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) {
        await ApiService.registerDeviceToken(
          token,
          platform: Platform.isIOS ? 'ios' : 'android',
        );
      }
    } catch (_) {}
  }
}
