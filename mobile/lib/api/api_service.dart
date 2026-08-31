import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://deallyhub-production.up.railway.app';

  static const String _tokenKey = 'deallyhub_jwt_token';
  static const String _userKey = 'deallyhub_user_profile';
  static const String _savedIdsKey = 'deallyhub_saved_ids';
  static const String _savedAdsCacheKey = 'deallyhub_saved_ads_cache';

  // Reactive notifier for real-time badge updates across the entire app
  static final ValueNotifier<int> savedCountNotifier = ValueNotifier<int>(0);

  static Future<void> initSavedCount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_savedIdsKey) ?? [];
      savedCountNotifier.value = list.length;
    } catch (_) {}
  }

  // ================= AUTH TOKEN HELPERS ================= //

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveSession(String token, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_userKey);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<Map<String, dynamic>?> fetchCurrentUserFromServer() async {
    final token = await getToken();
    if (token == null) return null;
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/auth/me'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['user'] != null) {
          final user = data['user'] as Map<String, dynamic>;
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(_userKey, jsonEncode(user));
          return user;
        }
      }
    } catch (_) {}
    return await getCurrentUser();
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    savedCountNotifier.value = 0;
  }

  // ================= AUTH API ================= //

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['success'] == true && data['token'] != null) {
      final token = data['token'] as String;
      final user = data['user'] as Map<String, dynamic>;
      await saveSession(token, user);
    }
    return data;
  }

  static Future<Map<String, dynamic>> loginWithGoogle(String? idToken, {String? accessToken}) async {
    try {
      final payload = <String, dynamic>{};
      if (idToken != null && idToken.isNotEmpty) payload['idToken'] = idToken;
      if (accessToken != null && accessToken.isNotEmpty) payload['accessToken'] = accessToken;

      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['success'] == true && data['token'] != null) {
        final token = data['token'] as String;
        final user = data['user'] as Map<String, dynamic>;
        await saveSession(token, user);
      }
      return data;
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> loginWithFacebook(String accessToken) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/facebook'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'accessToken': accessToken}),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['success'] == true && data['token'] != null) {
        final token = data['token'] as String;
        final user = data['user'] as Map<String, dynamic>;
        await saveSession(token, user);
      }
      return data;
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    // Do not save session on registration - email verification is required before login
    return data;
  }

  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/api/auth/forgot-password'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email}),
          )
          .timeout(const Duration(seconds: 12));

      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> resendVerification(String email) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/api/auth/resend-verification'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'email': email}),
          )
          .timeout(const Duration(seconds: 12));

      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  // ================= CATEGORIES API ================= //

  static Future<List<dynamic>> getCategories() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/categories'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] is List) {
          return data['data'] as List<dynamic>;
        }
      }
    } catch (e) {
      // Fallback
    }
    return [];
  }

  // ================= ADVERTISEMENTS API ================= //

  static Future<List<dynamic>> getAds({String? category, String? search, String? location}) async {
    try {
      final queryParams = <String, String>{};
      if (category != null && category.isNotEmpty) queryParams['category'] = category;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      final locLower = location?.toLowerCase().trim() ?? '';
      final isEntireCountry = locLower.isEmpty ||
          locLower.contains('entire country') ||
          locLower.contains('cały kraj') ||
          locLower.contains('caly kraj');
      if (location != null && location.isNotEmpty && !isEntireCountry) {
        queryParams['location'] = location;
      }

      final uri = Uri.parse('$baseUrl/api/ads').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final response = await http.get(uri).timeout(const Duration(seconds: 12));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['ads'] is List) {
          return data['ads'] as List<dynamic>;
        }
      }
    } catch (e) {
      // network fallback
    }
    return [];
  }

  static Future<Map<String, dynamic>?> getAdById(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/ads/$id')).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['ad'] != null) {
          return data['ad'] as Map<String, dynamic>;
        }
      }
    } catch (e) {
      // network fallback
    }
    return null;
  }

  static Future<Map<String, dynamic>> createAd({
    required String categorySlug,
    required String title,
    required String description,
    required double price,
    double? originalPrice,
    String currency = 'USD',
    String location = 'Entire Country',
    String phone = '',
    List<String> images = const [],
  }) async {
    final token = await getToken();
    if (token == null) throw Exception('Must be logged in to post an ad');

    final response = await http.post(
      Uri.parse('$baseUrl/api/ads'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'categorySlug': categorySlug,
        'title': title,
        'description': description,
        'price': price,
        if (originalPrice != null) 'originalPrice': originalPrice,
        'currency': currency,
        'location': location,
        'phone': phone,
        'images': images,
      }),
    );

    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ================= WISHLIST / SAVED API ================= //

  static Future<Set<int>> getSavedAdIds() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_savedIdsKey) ?? [];
    final idSet = list.map((id) => int.tryParse(id)).whereType<int>().toSet();
    savedCountNotifier.value = idSet.length;

    final token = await getToken();
    if (token != null) {
      try {
        final response = await http.get(
          Uri.parse('$baseUrl/api/saved'),
          headers: {'Authorization': 'Bearer $token'},
        ).timeout(const Duration(seconds: 8));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          if (data['success'] == true && data['saved'] is List) {
            final serverList = data['saved'] as List<dynamic>;
            final serverIds = serverList.map((e) => int.tryParse('${e['id']}')).whereType<int>().toSet();
            idSet.addAll(serverIds);
            await prefs.setStringList(_savedIdsKey, idSet.map((id) => id.toString()).toList());
            await prefs.setString(_savedAdsCacheKey, jsonEncode(serverList));
            savedCountNotifier.value = idSet.length;
          }
        }
      } catch (_) {}
    }

    return idSet;
  }

  static Future<List<dynamic>> getSavedAds() async {
    final prefs = await SharedPreferences.getInstance();
    final token = await getToken();

    if (token != null) {
      try {
        final response = await http.get(
          Uri.parse('$baseUrl/api/saved'),
          headers: {'Authorization': 'Bearer $token'},
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          if (data['success'] == true && data['saved'] is List) {
            final list = data['saved'] as List<dynamic>;
            await prefs.setString(_savedAdsCacheKey, jsonEncode(list));
            final idList = list.map((e) => e['id'].toString()).toList();
            await prefs.setStringList(_savedIdsKey, idList);
            savedCountNotifier.value = list.length;
            return list;
          }
        }
      } catch (_) {}
    }

    // Fallback to local cached ads
    final cachedStr = prefs.getString(_savedAdsCacheKey);
    if (cachedStr != null && cachedStr.isNotEmpty) {
      try {
        final decoded = jsonDecode(cachedStr);
        if (decoded is List) {
          savedCountNotifier.value = decoded.length;
          return decoded;
        }
      } catch (_) {}
    }
    return [];
  }

  static Future<bool> toggleSavedAd(int adId, [Map<String, dynamic>? adData]) async {
    final prefs = await SharedPreferences.getInstance();
    final savedIds = (prefs.getStringList(_savedIdsKey) ?? []).toSet();
    final token = await getToken();

    final willBeSaved = !savedIds.contains(adId.toString());

    if (willBeSaved) {
      savedIds.add(adId.toString());
    } else {
      savedIds.remove(adId.toString());
    }
    await prefs.setStringList(_savedIdsKey, savedIds.toList());
    savedCountNotifier.value = savedIds.length;

    final cachedStr = prefs.getString(_savedAdsCacheKey);
    List<dynamic> cachedAds = [];
    if (cachedStr != null && cachedStr.isNotEmpty) {
      try {
        final decoded = jsonDecode(cachedStr);
        if (decoded is List) cachedAds = decoded;
      } catch (_) {}
    }

    if (willBeSaved) {
      if (adData != null && !cachedAds.any((a) => a['id'] == adId)) {
        cachedAds.insert(0, adData);
      }
    } else {
      cachedAds.removeWhere((a) => a['id'] == adId);
    }
    await prefs.setString(_savedAdsCacheKey, jsonEncode(cachedAds));

    if (token != null) {
      try {
        final response = await http.post(
          Uri.parse('$baseUrl/api/saved/$adId'),
          headers: {'Authorization': 'Bearer $token'},
        ).timeout(const Duration(seconds: 8));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          if (data['success'] == true && data['isSaved'] != null) {
            final isSaved = data['isSaved'] as bool;
            if (isSaved) {
              savedIds.add(adId.toString());
            } else {
              savedIds.remove(adId.toString());
            }
            await prefs.setStringList(_savedIdsKey, savedIds.toList());
            savedCountNotifier.value = savedIds.length;
            return isSaved;
          }
        }
      } catch (_) {}
    }

    return willBeSaved;
  }

  // ================= CONVERSATIONS & CHAT API ================= //

  static Future<List<dynamic>> getConversations() async {
    final token = await getToken();
    if (token == null) return [];

    final response = await http.get(
      Uri.parse('$baseUrl/api/conversations'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['conversations'] is List) {
        return data['conversations'] as List<dynamic>;
      }
    }
    return [];
  }

  static Future<Map<String, dynamic>> startConversation(int adId) async {
    final token = await getToken();
    if (token == null) throw Exception('Must be logged in to chat');

    final response = await http.post(
      Uri.parse('$baseUrl/api/conversations'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'adId': adId}),
    );

    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  static Future<List<dynamic>> getMessages(int conversationId) async {
    final token = await getToken();
    if (token == null) return [];

    final response = await http.get(
      Uri.parse('$baseUrl/api/conversations/$conversationId/messages'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['messages'] is List) {
        return data['messages'] as List<dynamic>;
      }
    }
    return [];
  }

  static Future<Map<String, dynamic>> sendMessage(int conversationId, String content) async {
    final token = await getToken();
    if (token == null) throw Exception('Must be logged in');

    final response = await http.post(
      Uri.parse('$baseUrl/api/conversations/$conversationId/messages'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'content': content}),
    );

    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ================= USER ADS & MANAGEMENT ================= //

  static Future<List<dynamic>> getUserAds() async {
    final token = await getToken();
    if (token == null) return [];
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/ads/my'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['ads'] is List) {
          return data['ads'] as List<dynamic>;
        }
      }
    } catch (_) {}
    return [];
  }

  static Future<bool> deleteAd(int adId) async {
    final token = await getToken();
    if (token == null) return false;
    try {
      final res = await http.delete(
        Uri.parse('$baseUrl/api/ads/$adId'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (_) {}
    return false;
  }

  static Future<Map<String, dynamic>> updateAd({
    required int adId,
    required String categorySlug,
    required String title,
    required String description,
    required double price,
    double? originalPrice,
    required String currency,
    required String location,
    required String phone,
    required List<String> images,
  }) async {
    final token = await getToken();
    if (token == null) return {'success': false, 'error': 'Not logged in'};

    try {
      final res = await http.put(
        Uri.parse('$baseUrl/api/ads/$adId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'categorySlug': categorySlug,
          'title': title,
          'description': description,
          'price': price,
          'originalPrice': originalPrice,
          'currency': currency,
          'location': location,
          'phone': phone,
          'images': images,
        }),
      ).timeout(const Duration(seconds: 15));

      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  // ================= NOTIFICATIONS API ================= //

  static Future<List<dynamic>> getNotifications() async {
    final token = await getToken();
    if (token == null) return [];
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/notifications'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['notifications'] is List) {
          return data['notifications'] as List<dynamic>;
        }
      }
    } catch (_) {}
    return [];
  }

  static Future<void> markAllNotificationsRead() async {
    final token = await getToken();
    if (token == null) return;
    try {
      await http.post(
        Uri.parse('$baseUrl/api/notifications/read-all'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 8));
    } catch (_) {}
  }

  // ================= ACCOUNT SETTINGS API ================= //

  static Future<Map<String, dynamic>> updateProfile(String name) async {
    final token = await getToken();
    if (token == null) return {'success': false, 'error': 'Not logged in'};
    try {
      final res = await http.put(
        Uri.parse('$baseUrl/api/auth/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'name': name}),
      ).timeout(const Duration(seconds: 12));

      try {
        final data = jsonDecode(res.body);
        if (data is Map<String, dynamic>) {
          if (data['success'] == true && data['user'] != null) {
            await saveSession(token, data['user'] as Map<String, dynamic>);
          }
          return data;
        }
      } catch (_) {}

      return {'success': false, 'error': 'Server error (${res.statusCode})'};
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> updatePassword(String currentPassword, String newPassword) async {
    final token = await getToken();
    if (token == null) return {'success': false, 'error': 'Not logged in'};
    try {
      final res = await http.put(
        Uri.parse('$baseUrl/api/auth/password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      ).timeout(const Duration(seconds: 12));

      try {
        final data = jsonDecode(res.body);
        if (data is Map<String, dynamic>) {
          return data;
        }
      } catch (_) {}

      return {'success': false, 'error': 'Server error (${res.statusCode})'};
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }

  // ================= ADMIN PORTAL API ================= //

  static Future<Map<String, dynamic>?> getAdminStats() async {
    final token = await getToken();
    if (token == null) return null;
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/api/admin/stats'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['stats'] != null) {
          return data['stats'] as Map<String, dynamic>;
        }
      }
    } catch (_) {}
    return null;
  }

  static Future<List<dynamic>> adminGetAllAds({String? search}) async {
    final token = await getToken();
    if (token == null) return [];
    try {
      final uri = Uri.parse('$baseUrl/api/admin/ads').replace(
        queryParameters: (search != null && search.isNotEmpty) ? {'search': search} : null,
      );
      final res = await http.get(
        uri,
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['ads'] is List) {
          return data['ads'] as List<dynamic>;
        }
      }
    } catch (_) {}
    return [];
  }

  static Future<bool> adminDeleteAd(int adId) async {
    final token = await getToken();
    if (token == null) return false;
    try {
      final res = await http.delete(
        Uri.parse('$baseUrl/api/admin/ads/$adId'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['success'] == true;
      }
    } catch (_) {}
    return false;
  }

  static Future<Map<String, dynamic>> sendAdminNotification({
    required String title,
    required String message,
    int? targetUserId,
  }) async {
    final token = await getToken();
    if (token == null) return {'success': false, 'error': 'Not logged in'};
    try {
      final payload = <String, dynamic>{
        'title': title,
        'message': message,
      };
      if (targetUserId != null) {
        payload['targetUserId'] = targetUserId;
      }

      final res = await http.post(
        Uri.parse('$baseUrl/api/admin/notifications'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 12));
      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (e) {
      return {'success': false, 'error': 'Connection error: $e'};
    }
  }
}
