import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://deallyhub-production.up.railway.app';

  static const String _tokenKey = 'deallyhub_jwt_token';
  static const String _userKey = 'deallyhub_user_profile';

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

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  // ================= AUTH API ================= //

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 200 && data['success'] == true) {
      final token = data['token'] as String;
      final user = data['user'] as Map<String, dynamic>;
      await saveSession(token, user);
    }
    return data;
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode == 201 && data['success'] == true) {
      final token = data['token'] as String;
      final user = data['user'] as Map<String, dynamic>;
      await saveSession(token, user);
    }
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
      if (location != null && location.isNotEmpty && !location.toLowerCase().contains('entire country')) {
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
        'currency': currency,
        'location': location,
        'phone': phone,
        'images': images,
      }),
    );

    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ================= WISHLIST / SAVED API ================= //

  static Future<List<dynamic>> getSavedAds() async {
    try {
      final token = await getToken();
      if (token == null) return [];

      final response = await http.get(
        Uri.parse('$baseUrl/api/saved'),
        headers: {'Authorization': 'Bearer $token'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['saved'] is List) {
          return data['saved'] as List<dynamic>;
        }
      }
    } catch (e) {
      // network fallback
    }
    return [];
  }

  static Future<bool> toggleSavedAd(int adId) async {
    final token = await getToken();
    if (token == null) return false;

    final response = await http.post(
      Uri.parse('$baseUrl/api/saved/$adId'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['isSaved'] == true;
    }
    return false;
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
}
