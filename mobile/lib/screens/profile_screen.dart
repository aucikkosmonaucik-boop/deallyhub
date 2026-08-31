import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_service.dart';
import '../l10n/app_translations.dart';
import '../l10n/language_controller.dart';
import '../widgets/app_image.dart';
import '../widgets/language_picker_dialog.dart';
import 'ad_details_screen.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback? onAuthChanged;
  final Function(int tabIndex)? onNavigateTab;

  const ProfileScreen({
    super.key,
    this.onAuthChanged,
    this.onNavigateTab,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;
  bool _loading = true;
  int _unreadNotifications = 0;

  // Auth form states
  bool _isLogin = true;
  final _formKey = GlobalKey<FormState>();
  String _name = '';
  String _email = '';
  String _password = '';
  bool _authSubmitting = false;
  bool _googleSubmitting = false;
  bool _fbSubmitting = false;
  String? _authError;

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: '1073600566504-1sikbtmhde712fhkalhmoc6v6ivu63dh.apps.googleusercontent.com',
    serverClientId: '1073600566504-rmbe5e4na60o18ehark84qv74d2v57ku.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
  );

  @override
  void initState() {
    super.initState();
    _checkUser();
  }

  Future<void> _checkUser() async {
    setState(() => _loading = true);
    final user = await ApiService.fetchCurrentUserFromServer();
    if (mounted) {
      setState(() {
        _user = user;
        _loading = false;
      });
      if (user != null) {
        _loadCounts();
      }
    }
  }

  Future<void> _loadCounts() async {
    try {
      await ApiService.getSavedAds();
      final notifications = await ApiService.getNotifications();
      if (mounted) {
        setState(() {
          _unreadNotifications = notifications.where((n) => n['is_read'] != true).length;
        });
      }
    } catch (_) {}
  }

  Future<void> _handleAuth() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() {
      _authSubmitting = true;
      _authError = null;
    });

    try {
      final res = _isLogin
          ? await ApiService.login(_email, _password)
          : await ApiService.register(_name, _email, _password);

      if (res['success'] == true) {
        if (!_isLogin) {
          if (mounted) {
            setState(() {
              _isLogin = true;
              _authError = null;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                backgroundColor: Color(0xFF0D9488),
                duration: Duration(seconds: 8),
                content: Text('Account created! Please check your email to verify your address before logging in.'),
              ),
            );
          }
          return;
        }
        await _checkUser();
        widget.onAuthChanged?.call();
      } else {
        final errorMsg = res['error'] ?? 'Authentication failed';
        setState(() => _authError = errorMsg);

        if (res['requiresVerification'] == true && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: Colors.amber.shade900,
              duration: const Duration(seconds: 10),
              content: const Text('Email address not verified yet.'),
              action: SnackBarAction(
                label: 'Resend Email',
                textColor: Colors.white,
                onPressed: () async {
                  final sendRes = await ApiService.resendVerification(_email);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: const Color(0xFF0D9488),
                        content: Text(sendRes['message'] ?? 'Verification link sent! Check your inbox.'),
                      ),
                    );
                  }
                },
              ),
            ),
          );
        }
      }
    } catch (e) {
      setState(() => _authError = 'Error connecting to server: $e');
    } finally {
      if (mounted) setState(() => _authSubmitting = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _googleSubmitting = true;
      _authError = null;
    });

    try {
      await _googleSignIn.signOut();
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        if (mounted) setState(() => _googleSubmitting = false);
        return;
      }

      final GoogleSignInAuthentication auth = await account.authentication;
      final idToken = auth.idToken;
      final accessToken = auth.accessToken;

      if (idToken == null && accessToken == null) {
        throw Exception('Could not obtain Google authentication token.');
      }

      final res = await ApiService.loginWithGoogle(idToken, accessToken: accessToken);
      if (res['success'] == true) {
        await _checkUser();
        widget.onAuthChanged?.call();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: Color(0xFF0D9488),
              content: Text('Successfully signed in with Google!'),
            ),
          );
        }
      } else {
        setState(() => _authError = res['error'] ?? 'Google authentication failed.');
      }
    } catch (e) {
      final errStr = e.toString();
      debugPrint('Google sign-in error: $errStr');
      if (mounted) {
        if (errStr.contains('10') || errStr.contains('ApiException: 10') || errStr.contains('sign_in_failed')) {
          _showGoogleApkNoticeDialog();
        } else {
          setState(() => _authError = 'Google sign-in error: $e');
        }
      }
    } finally {
      if (mounted) setState(() => _googleSubmitting = false);
    }
  }

  void _showGoogleApkNoticeDialog() {
    const sha1 = 'D0:45:98:6E:B3:71:81:D4:09:82:7E:8F:F3:ED:07:8F:B9:86:85:13';
    const pkg = 'com.deallyhub.deallyhub_mobile';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: Color(0xFF0D9488)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                tr('google_apk_setup_title'),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('google_apk_setup_desc'),
              style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Package: $pkg', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('SHA-1:', style: TextStyle(fontSize: 10, color: Colors.grey)),
                  const SelectableText(
                    sha1,
                    style: TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.copy, size: 16),
            label: Text(tr('google_apk_copy_sha')),
            onPressed: () {
              Clipboard.setData(const ClipboardData(text: sha1));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF0D9488),
                  content: Text(tr('google_apk_copied')),
                ),
              );
              Navigator.pop(ctx);
            },
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF002F34)),
            onPressed: () {
              Navigator.pop(ctx);
              launchUrl(Uri.parse('https://deallyhub.com'), mode: LaunchMode.externalApplication);
            },
            child: Text(tr('google_apk_web_login'), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Future<void> _handleFacebookSignIn() async {
    setState(() {
      _fbSubmitting = true;
      _authError = null;
    });

    try {
      final LoginResult result = await FacebookAuth.instance.login(
        permissions: ['email', 'public_profile'],
      );

      if (result.status == LoginStatus.success) {
        final AccessToken? accessToken = result.accessToken;
        if (accessToken == null || accessToken.tokenString.isEmpty) {
          throw Exception('Facebook login succeeded but token was empty.');
        }

        final res = await ApiService.loginWithFacebook(accessToken.tokenString);
        if (res['success'] == true) {
          await _checkUser();
          widget.onAuthChanged?.call();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                backgroundColor: Color(0xFF0D9488),
                content: Text('Successfully signed in with Facebook!'),
              ),
            );
          }
        } else {
          setState(() => _authError = res['error'] ?? 'Facebook authentication failed.');
        }
      } else if (result.status == LoginStatus.cancelled) {
        // User cancelled login - no error
      } else {
        final msg = result.message ?? 'Facebook login failed.';
        debugPrint('Facebook sign-in failed: status=${result.status}, msg=$msg');
        if (mounted) {
          _showFacebookApkNoticeDialog(msg);
        }
      }
    } catch (e) {
      final errStr = e.toString();
      debugPrint('Facebook sign-in exception: $errStr');
      if (mounted) {
        _showFacebookApkNoticeDialog(errStr);
      }
    } finally {
      if (mounted) setState(() => _fbSubmitting = false);
    }
  }

  void _showFacebookApkNoticeDialog([String? detail]) {
    const keyHash = '0EWYbrNxgdQJgn6P8+0Hj7mGhRM=';
    const pkg = 'com.deallyhub.deallyhub_mobile';
    const appId = '1983054212398881';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: Color(0xFF1877F2)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                tr('facebook_apk_setup_title'),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tr('facebook_apk_setup_desc'),
                style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('App ID: $appId', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('Package: $pkg', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    const Text('Key Hash (Base64):', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    const SelectableText(
                      keyHash,
                      style: TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              if (detail != null && detail.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Details: $detail',
                  style: const TextStyle(fontSize: 11, color: Colors.redAccent),
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.copy, size: 16),
            label: Text(tr('facebook_apk_copy_hash')),
            onPressed: () {
              Clipboard.setData(const ClipboardData(text: keyHash));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF1877F2),
                  content: Text(tr('facebook_apk_copied')),
                ),
              );
              Navigator.pop(ctx);
            },
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF002F34)),
            onPressed: () {
              Navigator.pop(ctx);
              launchUrl(Uri.parse('https://deallyhub.com'), mode: LaunchMode.externalApplication);
            },
            child: Text(tr('google_apk_web_login'), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showForgotPasswordDialog() {
    final emailController = TextEditingController(text: _email);
    bool sending = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.lock_reset, color: Color(0xFF002F34)),
              SizedBox(width: 8),
              Text('Reset Password', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter your registered email address and we will send you a password reset link in Deallyhub style.',
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'name@example.com',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: sending
                  ? null
                  : () async {
                      final inputEmail = emailController.text.trim();
                      if (inputEmail.isEmpty || !inputEmail.contains('@')) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please enter a valid email address.')),
                        );
                        return;
                      }

                      final messenger = ScaffoldMessenger.of(context);
                      final nav = Navigator.of(ctx);
                      setDialogState(() => sending = true);
                      final res = await ApiService.forgotPassword(inputEmail);
                      nav.pop();

                      messenger.showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF0D9488),
                          content: Text(res['message'] ?? 'Password reset link sent! Check your inbox.'),
                        ),
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF002F34),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: sending
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Send Reset Link'),
            ),
          ],
        ),
      ),
    );
  }

  void _showResendVerificationDialog() {
    final emailController = TextEditingController(text: _email);
    bool sending = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.mark_email_read_outlined, color: Color(0xFF0D9488)),
              SizedBox(width: 8),
              Text('Verify Email', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter your email address to receive a new verification link.',
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'name@example.com',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: sending
                  ? null
                  : () async {
                      final inputEmail = emailController.text.trim();
                      if (inputEmail.isEmpty || !inputEmail.contains('@')) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please enter a valid email address.')),
                        );
                        return;
                      }

                      final messenger = ScaffoldMessenger.of(context);
                      final nav = Navigator.of(ctx);
                      setDialogState(() => sending = true);
                      final res = await ApiService.resendVerification(inputEmail);
                      nav.pop();

                      messenger.showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF0D9488),
                          content: Text(res['message'] ?? 'Verification link sent! Check your inbox.'),
                        ),
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: sending
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Resend Link'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _logout() async {
    try {
      await FacebookAuth.instance.logOut();
    } catch (_) {}
    await ApiService.logout();
    await _checkUser();
    widget.onAuthChanged?.call();
  }

  void _showLogoutConfirmDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34))),
        content: const Text('Are you sure you want to sign out of your Deallyhub account?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );
  }

  // 1. Notifications Modal
  void _showNotificationsDialog() async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (ctx, scrollController) => FutureBuilder<List<dynamic>>(
          future: ApiService.getNotifications(),
          builder: (ctx, snapshot) {
            final items = snapshot.data ?? [];
            return Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB)))),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.notifications_active_rounded, color: Color(0xFF0D9488)),
                          SizedBox(width: 8),
                          Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF002F34))),
                        ],
                      ),
                      if (items.isNotEmpty)
                        TextButton(
                          onPressed: () async {
                            await ApiService.markAllNotificationsRead();
                            _loadCounts();
                            if (ctx.mounted) Navigator.pop(ctx);
                          },
                          child: const Text('Mark all read', style: TextStyle(color: Color(0xFF0D9488), fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: snapshot.connectionState == ConnectionState.waiting
                      ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
                      : items.isEmpty
                          ? const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.notifications_none, size: 48, color: Colors.grey),
                                  SizedBox(height: 12),
                                  Text('No notifications yet', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            )
                          : ListView.separated(
                              controller: scrollController,
                              padding: const EdgeInsets.all(16),
                              itemCount: items.length,
                              separatorBuilder: (context, index) => const Divider(height: 1),
                              itemBuilder: (ctx, idx) {
                                final n = items[idx];
                                final isRead = n['is_read'] == true;
                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                                  leading: CircleAvatar(
                                    backgroundColor: isRead ? Colors.grey.shade100 : const Color(0xFFE6FFFA),
                                    child: Icon(
                                      Icons.notifications,
                                      size: 20,
                                      color: isRead ? Colors.grey : const Color(0xFF0D9488),
                                    ),
                                  ),
                                  title: Text(n['title'] ?? '', style: TextStyle(fontWeight: isRead ? FontWeight.normal : FontWeight.bold, fontSize: 14)),
                                  subtitle: Text(n['message'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.black87)),
                                );
                              },
                            ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  // 3. My Advertisements Modal
  void _showMyAdsDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => DraggableScrollableSheet(
          initialChildSize: 0.8,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollController) => FutureBuilder<List<dynamic>>(
            future: ApiService.getUserAds(),
            builder: (ctx, snapshot) {
              final ads = snapshot.data ?? [];
              return Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB)))),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.description_outlined, color: Color(0xFF002F34)),
                            const SizedBox(width: 8),
                            Text(tr('my_ads_title'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF002F34))),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: RefreshIndicator(
                      color: const Color(0xFF0D9488),
                      onRefresh: () async {
                        setSheetState(() {});
                      },
                      child: snapshot.connectionState == ConnectionState.waiting
                          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
                          : ads.isEmpty
                              ? ListView(
                                  children: [
                                    const SizedBox(height: 100),
                                    Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey),
                                          const SizedBox(height: 12),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 24),
                                            child: Text(tr('my_ads_empty'), style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                )
                              : ListView.separated(
                                  controller: scrollController,
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  padding: const EdgeInsets.all(16),
                                  itemCount: ads.length,
                                  separatorBuilder: (context, index) => const Divider(height: 16),
                                itemBuilder: (ctx, idx) {
                                  final ad = ads[idx];
                                  final images = (ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
                                  final cover = images.isNotEmpty ? images[0] : null;

                                  final numPrice = double.tryParse('${ad['price']}') ?? 0.0;
                                  final origPrice = ad['original_price'] != null ? double.tryParse('${ad['original_price']}') : null;
                                  final hasPromo = origPrice != null && origPrice > numPrice && numPrice > 0;

                                  return InkWell(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (_) => AdDetailsScreen(ad: ad)),
                                      );
                                    },
                                    child: Row(
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(10),
                                          child: SizedBox(
                                            width: 70,
                                            height: 70,
                                            child: AppImage(imageUrl: cover, fit: BoxFit.cover),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(ad['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                              const SizedBox(height: 4),
                                              Row(
                                                children: [
                                                  Text(
                                                    '${ad['price']} ${ad['currency']}',
                                                    style: TextStyle(
                                                      color: hasPromo ? const Color(0xFF16A34A) : const Color(0xFF0D9488),
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                  if (hasPromo) ...[
                                                    const SizedBox(width: 6),
                                                    Text(
                                                      '$origPrice',
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        color: Colors.grey,
                                                        decoration: TextDecoration.lineThrough,
                                                      ),
                                                    ),
                                                  ],
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            IconButton(
                                              icon: const Icon(Icons.edit_outlined, color: Color(0xFF0D9488)),
                                              tooltip: tr('my_ads_edit'),
                                              onPressed: () async {
                                                final updated = await _showEditAdModal(ad);
                                                if (updated == true) {
                                                  setSheetState(() {});
                                                }
                                              },
                                            ),
                                            IconButton(
                                              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                              tooltip: tr('my_ads_delete'),
                                              onPressed: () async {
                                                final confirm = await showDialog<bool>(
                                                  context: context,
                                                  builder: (c) => AlertDialog(
                                                    title: Text(tr('my_ads_delete')),
                                                    content: Text(tr('my_ads_delete_confirm')),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(c, false), child: Text(tr('common_cancel'))),
                                                      ElevatedButton(
                                                        onPressed: () => Navigator.pop(c, true),
                                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                                                        child: Text(tr('my_ads_delete')),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (confirm == true) {
                                                  await ApiService.deleteAd(ad['id'] as int);
                                                  setSheetState(() {});
                                                }
                                              },
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  // 3b. Edit Advertisement Modal
  Future<bool?> _showEditAdModal(Map<String, dynamic> ad) async {
    final titleController = TextEditingController(text: ad['title'] ?? '');
    final priceController = TextEditingController(text: '${ad['price'] ?? 0}');
    final origPriceController = TextEditingController(
      text: ad['original_price'] != null && double.tryParse('${ad['original_price']}') != null && (double.tryParse('${ad['original_price']}') ?? 0) > (double.tryParse('${ad['price'] ?? 0}') ?? 0)
          ? '${ad['original_price']}'
          : '',
    );
    bool isPromo = ad['original_price'] != null &&
        double.tryParse('${ad['original_price']}') != null &&
        (double.tryParse('${ad['original_price']}') ?? 0) > (double.tryParse('${ad['price'] ?? 0}') ?? 0);
    final descController = TextEditingController(text: ad['description'] ?? '');
    final phoneController = TextEditingController(text: ad['phone'] ?? '');
    final locationController = TextEditingController(text: ad['location'] ?? 'Entire Country');

    String selectedCategory = ad['category_slug'] ?? 'antiques-collectibles';
    String currency = ad['currency'] ?? 'USD';
    List<String> images = (ad['images'] as List<dynamic>?)?.cast<String>().toList() ?? [];
    final picker = ImagePicker();
    bool saving = false;
    bool picking = false;

    return await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setEditState) {
          Future<void> pickImg(ImageSource source) async {
            try {
              setEditState(() => picking = true);
              final XFile? photo = await picker.pickImage(
                source: source,
                maxWidth: 1200,
                maxHeight: 1200,
                imageQuality: 80,
              );
              if (photo != null) {
                final bytes = await photo.readAsBytes();
                final b64 = 'data:image/jpeg;base64,${base64Encode(bytes)}';
                setEditState(() {
                  images.add(b64);
                });
              }
            } catch (_) {
            } finally {
              setEditState(() => picking = false);
            }
          }

          return DraggableScrollableSheet(
            initialChildSize: 0.9,
            minChildSize: 0.6,
            maxChildSize: 0.95,
            expand: false,
            builder: (ctx, scrollController) => SafeArea(
              top: false,
              bottom: true,
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.edit_note, color: Color(0xFF0D9488), size: 24),
                            const SizedBox(width: 8),
                            Text(
                              tr('edit_ad_title'),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF002F34)),
                            ),
                          ],
                        ),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx, false)),
                      ],
                    ),
                  ),

                  // Form Content
                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 40),
                    children: [
                      // Title
                      Text('${tr("post_ad_title")} *', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                      const SizedBox(height: 6),
                      TextField(
                        controller: titleController,
                        decoration: InputDecoration(
                          hintText: 'e.g. Vintage Leather Jacket',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Category
                      Text('${tr("post_category")} *', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                      const SizedBox(height: 6),
                      FutureBuilder<List<dynamic>>(
                        future: ApiService.getCategories(),
                        builder: (c, snapshot) {
                          final cats = snapshot.data ?? [];
                          return DropdownButtonFormField<String>(
                            initialValue: cats.any((c) => c['slug'] == selectedCategory)
                                ? selectedCategory
                                : (cats.isNotEmpty ? cats[0]['slug'] : selectedCategory),
                            decoration: InputDecoration(
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            ),
                            items: cats.map<DropdownMenuItem<String>>((c) {
                              final slug = c['slug'] as String;
                              final name = c['name'] as String;
                              return DropdownMenuItem<String>(
                                value: slug,
                                child: Text(trCat(slug, name), style: const TextStyle(fontSize: 14)),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setEditState(() => selectedCategory = val);
                              }
                            },
                          );
                        },
                      ),
                      const SizedBox(height: 16),

                      // Price & Currency
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${tr("post_price")} *', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: priceController,
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  decoration: InputDecoration(
                                    hintText: '0.00',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tr('post_currency'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                                const SizedBox(height: 6),
                                DropdownButtonFormField<String>(
                                  initialValue: currency,
                                  decoration: InputDecoration(
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  ),
                                  items: ['USD', 'EUR', 'PLN', 'GBP']
                                      .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) setEditState(() => currency = val);
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Promo Checkbox & Original Price Input
                      CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          tr('post_is_promo'),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.deepOrange),
                        ),
                        secondary: const Icon(Icons.local_offer_outlined, color: Colors.deepOrange, size: 20),
                        value: isPromo,
                        activeColor: Colors.deepOrange,
                        onChanged: (val) => setEditState(() => isPromo = val ?? false),
                      ),
                      if (isPromo) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${tr("post_regular_price")} *',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.red.shade900),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: origPriceController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                onChanged: (_) => setEditState(() {}),
                                decoration: InputDecoration(
                                  hintText: 'e.g. 120.00',
                                  filled: true,
                                  fillColor: Colors.white,
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.red.shade300)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                ),
                              ),
                              Builder(
                                builder: (context) {
                                  final curP = double.tryParse(priceController.text.trim()) ?? 0.0;
                                  final origP = double.tryParse(origPriceController.text.trim()) ?? 0.0;
                                  if (origP > curP && curP > 0) {
                                    final discount = ((origP - curP) / origP * 100).round();
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '${tr("post_you_save")}: ${(origP - curP).toStringAsFixed(2)} $currency',
                                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.red.shade800),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: Colors.red.shade600,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              '-$discount% ${tr("post_discount_off")}',
                                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }
                                  return const SizedBox.shrink();
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),

                      // Location & Phone
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tr('post_location'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: locationController,
                                  decoration: InputDecoration(
                                    hintText: 'e.g. Warsaw',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tr('post_phone'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                                const SizedBox(height: 6),
                                TextField(
                                  controller: phoneController,
                                  keyboardType: TextInputType.phone,
                                  decoration: InputDecoration(
                                    hintText: '+48 ...',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Photos Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(tr('post_photos'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                          Row(
                            children: [
                              TextButton.icon(
                                onPressed: picking ? null : () => pickImg(ImageSource.gallery),
                                icon: const Icon(Icons.photo_library, size: 16, color: Color(0xFF0D9488)),
                                label: Text(tr('edit_ad_gallery'), style: const TextStyle(color: Color(0xFF0D9488), fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                              TextButton.icon(
                                onPressed: picking ? null : () => pickImg(ImageSource.camera),
                                icon: const Icon(Icons.camera_alt, size: 16, color: Color(0xFF0D9488)),
                                label: Text(tr('edit_ad_camera'), style: const TextStyle(color: Color(0xFF0D9488), fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      if (images.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Center(
                            child: Text(tr('edit_ad_no_photos'), style: const TextStyle(color: Colors.grey, fontSize: 12), textAlign: TextAlign.center),
                          ),
                        )
                      else
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: List.generate(images.length, (idx) {
                            return Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: SizedBox(
                                    width: 80,
                                    height: 80,
                                    child: AppImage(imageUrl: images[idx], fit: BoxFit.cover),
                                  ),
                                ),
                                if (idx == 0)
                                  Positioned(
                                    top: 4,
                                    left: 4,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                      decoration: BoxDecoration(color: const Color(0xFF002F34), borderRadius: BorderRadius.circular(4)),
                                      child: Text(tr('edit_ad_cover'), style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () {
                                      setEditState(() => images.removeAt(idx));
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.all(2),
                                      decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                                      child: const Icon(Icons.close, size: 14, color: Colors.white),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }),
                        ),
                      const SizedBox(height: 16),

                      // Description
                      Text('${tr("post_desc")} *', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                      const SizedBox(height: 6),
                      TextField(
                        controller: descController,
                        maxLines: 4,
                        decoration: InputDecoration(
                          hintText: '...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.all(14),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Save Changes Button
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: saving
                              ? null
                              : () async {
                                  final title = titleController.text.trim();
                                  final desc = descController.text.trim();
                                  final priceVal = double.tryParse(priceController.text.trim()) ?? 0.0;
                                  final origPVal = (isPromo && origPriceController.text.trim().isNotEmpty)
                                      ? double.tryParse(origPriceController.text.trim())
                                      : null;

                                  if (title.isEmpty || desc.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(tr('edit_ad_req_error'))),
                                    );
                                    return;
                                  }

                                  if (isPromo && origPVal != null && origPVal <= priceVal) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Regular price must be higher than current price.')),
                                    );
                                    return;
                                  }

                                  final messenger = ScaffoldMessenger.of(context);
                                  final nav = Navigator.of(ctx);
                                  setEditState(() => saving = true);

                                  final res = await ApiService.updateAd(
                                    adId: ad['id'] as int,
                                    categorySlug: selectedCategory,
                                    title: title,
                                    description: desc,
                                    price: priceVal,
                                    originalPrice: origPVal,
                                    currency: currency,
                                    location: locationController.text.trim().isEmpty ? 'Entire Country' : locationController.text.trim(),
                                    phone: phoneController.text.trim(),
                                    images: images,
                                  );

                                  setEditState(() => saving = false);
                                  if (res['success'] == true) {
                                    nav.pop(true);
                                    messenger.showSnackBar(
                                      SnackBar(
                                        backgroundColor: const Color(0xFF0D9488),
                                        content: Text(tr('edit_ad_success')),
                                      ),
                                    );
                                  } else {
                                    messenger.showSnackBar(
                                      SnackBar(content: Text(res['error'] ?? 'Failed to update advertisement.')),
                                    );
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF002F34),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: saving
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(tr('edit_ad_save'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ],
            ),
          ),
          );
        },
      ),
    );
  }

  // 5. Account Settings Modal
  void _showAccountSettingsDialog() {
    final nameController = TextEditingController(text: _user?['name'] ?? '');
    final currentPassController = TextEditingController();
    final newPassController = TextEditingController();
    final confirmPassController = TextEditingController();
    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;
    bool savingName = false;
    bool savingPass = false;
    bool sendingForgot = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollController) => Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.settings_outlined, color: Color(0xFF002F34), size: 22),
                        const SizedBox(width: 8),
                        Text(tr('settings_title'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF002F34))),
                      ],
                    ),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
              ),

              // Body
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 40),
                  children: [
                    // Name update
                    Text(tr('settings_fullname'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nameController,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: savingName
                            ? null
                            : () async {
                                final newName = nameController.text.trim();
                                if (newName.isEmpty) return;
                                final messenger = ScaffoldMessenger.of(context);
                                final nav = Navigator.of(ctx);
                                setSheetState(() => savingName = true);
                                final res = await ApiService.updateProfile(newName);
                                setSheetState(() => savingName = false);
                                if (!mounted) return;
                                if (res['success'] == true) {
                                  await _checkUser();
                                  nav.pop();
                                  messenger.showSnackBar(
                                    SnackBar(backgroundColor: const Color(0xFF0D9488), content: Text(tr('settings_name_updated'))),
                                  );
                                } else {
                                  messenger.showSnackBar(
                                    SnackBar(content: Text(res['error'] ?? 'Failed to update name.')),
                                  );
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF002F34),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: savingName
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(tr('settings_save_name'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),

                    // Password change
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(tr('settings_change_password'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF002F34))),
                        TextButton(
                          onPressed: sendingForgot
                              ? null
                              : () async {
                                  final email = _user?['email'] ?? '';
                                  if (email.isEmpty) return;
                                  final messenger = ScaffoldMessenger.of(context);
                                  setSheetState(() => sendingForgot = true);
                                  await ApiService.forgotPassword(email);
                                  setSheetState(() => sendingForgot = false);
                                  if (mounted) {
                                    messenger.showSnackBar(
                                      SnackBar(
                                        content: Text('${tr("settings_reset_sent")} $email'),
                                        backgroundColor: const Color(0xFF0D9488),
                                      ),
                                    );
                                  }
                                },
                          child: sendingForgot
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0D9488)))
                              : Text(tr('settings_forgot_password'), style: const TextStyle(color: Color(0xFF0D9488), fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Current Password
                    TextField(
                      controller: currentPassController,
                      obscureText: obscureCurrent,
                      decoration: InputDecoration(
                        labelText: tr('settings_current_password'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        suffixIcon: IconButton(
                          icon: Icon(obscureCurrent ? Icons.visibility_off : Icons.visibility, size: 20, color: Colors.grey),
                          onPressed: () => setSheetState(() => obscureCurrent = !obscureCurrent),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // New Password
                    TextField(
                      controller: newPassController,
                      obscureText: obscureNew,
                      decoration: InputDecoration(
                        labelText: tr('settings_new_password'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        suffixIcon: IconButton(
                          icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility, size: 20, color: Colors.grey),
                          onPressed: () => setSheetState(() => obscureNew = !obscureNew),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Confirm New Password
                    TextField(
                      controller: confirmPassController,
                      obscureText: obscureConfirm,
                      decoration: InputDecoration(
                        labelText: tr('settings_confirm_password'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        suffixIcon: IconButton(
                          icon: Icon(obscureConfirm ? Icons.visibility_off : Icons.visibility, size: 20, color: Colors.grey),
                          onPressed: () => setSheetState(() => obscureConfirm = !obscureConfirm),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: OutlinedButton(
                        onPressed: savingPass
                            ? null
                            : () async {
                                final currentPass = currentPassController.text;
                                final newPass = newPassController.text;
                                final confirmPass = confirmPassController.text;

                                if (currentPass.isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(tr('settings_enter_current_pass'))),
                                  );
                                  return;
                                }

                                if (newPass.length < 6) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(tr('settings_pass_min_length'))),
                                  );
                                  return;
                                }

                                if (newPass != confirmPass) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(tr('settings_pass_mismatch'))),
                                  );
                                  return;
                                }

                                final messenger = ScaffoldMessenger.of(context);
                                final nav = Navigator.of(ctx);
                                setSheetState(() => savingPass = true);
                                final res = await ApiService.updatePassword(currentPass, newPass);
                                setSheetState(() => savingPass = false);
                                if (!mounted) return;

                                if (res['success'] == true) {
                                  nav.pop();
                                  messenger.showSnackBar(
                                    SnackBar(backgroundColor: const Color(0xFF0D9488), content: Text(tr('settings_pass_success'))),
                                  );
                                } else {
                                  messenger.showSnackBar(
                                    SnackBar(
                                      backgroundColor: Colors.redAccent,
                                      content: Text(res['error'] ?? 'Failed to update password.'),
                                    ),
                                  );
                                }
                              },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF002F34)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: savingPass
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF002F34)))
                            : Text(tr('settings_update_password'), style: const TextStyle(color: Color(0xFF002F34), fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 6. Admin Portal (Owner) Modal
  void _showAdminPortalDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => DefaultTabController(
        length: 3,
        child: DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.6,
          maxChildSize: 0.95,
          expand: false,
          builder: (ctx, scrollController) => Column(
            children: [
              Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                decoration: const BoxDecoration(
                  color: Color(0xFFF0FDF4),
                  border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.shield_outlined, color: Color(0xFF0D9488)),
                            SizedBox(width: 8),
                            Text('Admin Portal (Owner)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF002F34))),
                          ],
                        ),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                      ],
                    ),
                    const TabBar(
                      labelColor: Color(0xFF002F34),
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: Color(0xFF0D9488),
                      tabs: [
                        Tab(text: 'Overview'),
                        Tab(text: 'Broadcast'),
                        Tab(text: 'Manage Ads'),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    // Tab 1: Stats Overview
                    FutureBuilder<Map<String, dynamic>?>(
                      future: ApiService.getAdminStats(),
                      builder: (ctx, snap) {
                        if (snap.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)));
                        }
                        final stats = snap.data ?? {};
                        return ListView(
                          padding: const EdgeInsets.all(20),
                          children: [
                            _buildAdminStatCard('Total Users', '${stats['totalUsers'] ?? 0}', Icons.people_outline, Colors.blue),
                            const SizedBox(height: 12),
                            _buildAdminStatCard('Active Advertisements', '${stats['totalAds'] ?? 0}', Icons.inventory_2_outlined, const Color(0xFF0D9488)),
                            const SizedBox(height: 12),
                            _buildAdminStatCard('Conversations', '${stats['totalConversations'] ?? 0}', Icons.chat_bubble_outline, Colors.purple),
                          ],
                        );
                      },
                    ),

                    // Tab 2: Broadcast Notification
                    _buildAdminBroadcastTab(ctx),

                    // Tab 3: Moderation / Manage Ads
                    _buildAdminAdsTab(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAdminStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: color.withValues(alpha: 0.12),
            radius: 24,
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600)),
              Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: Color(0xFF002F34))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAdminBroadcastTab(BuildContext ctx) {
    final titleCtrl = TextEditingController();
    final msgCtrl = TextEditingController();
    bool sending = false;

    return StatefulBuilder(
      builder: (ctx, setBState) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Send Notification to All Users', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF002F34))),
            const SizedBox(height: 6),
            const Text('Sends an instant bell notification across Deallyhub.', style: TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 16),
            TextField(
              controller: titleCtrl,
              decoration: InputDecoration(
                labelText: 'Title',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: msgCtrl,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Message Content',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: sending
                    ? null
                    : () async {
                        final t = titleCtrl.text.trim();
                        final m = msgCtrl.text.trim();
                        if (t.isEmpty || m.isEmpty) return;
                        setBState(() => sending = true);
                        final res = await ApiService.sendAdminNotification(title: t, message: m);
                        setBState(() => sending = false);
                        if (res['success'] == true) {
                          titleCtrl.clear();
                          msgCtrl.clear();
                          if (ctx.mounted) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(backgroundColor: Color(0xFF0D9488), content: Text('Broadcast notification sent!')),
                            );
                          }
                        }
                      },
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF002F34)),
                child: sending
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Send Broadcast', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminAdsTab() {
    return FutureBuilder<List<dynamic>>(
      future: ApiService.adminGetAllAds(),
      builder: (ctx, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)));
        }
        final allAds = snap.data ?? [];
        if (allAds.isEmpty) {
          return const Center(child: Text('No ads found in database.', style: TextStyle(color: Colors.grey)));
        }
        return StatefulBuilder(
          builder: (ctx, setAdState) => ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: allAds.length,
            separatorBuilder: (context, index) => const Divider(height: 16),
            itemBuilder: (ctx, idx) {
              final ad = allAds[idx];
              final images = (ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
              final cover = images.isNotEmpty ? images[0] : null;

              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    width: 50,
                    height: 50,
                    child: AppImage(imageUrl: cover, fit: BoxFit.cover),
                  ),
                ),
                title: Text(ad['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: Text('ID: ${ad['id']} • ${ad['price']} ${ad['currency']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_forever, color: Colors.redAccent),
                  onPressed: () async {
                    final ok = await ApiService.adminDeleteAd(ad['id'] as int);
                    if (ok) {
                      setAdState(() {
                        allAds.removeAt(idx);
                      });
                    }
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator(color: Color(0xFF0D9488))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: Text(
          _user != null ? tr('profile_title') : (_isLogin ? tr('profile_sign_in') : tr('profile_create_account')),
          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language_rounded, color: Color(0xFF002F34), size: 22),
            tooltip: tr('lang_picker_title'),
            onPressed: () => LanguagePickerDialog.show(context),
          ),
        ],
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _user != null ? _buildProfileView() : _buildAuthForm(),
    );
  }

  Widget _buildProfileView() {
    final name = _user!['name'] ?? 'User';
    final email = _user!['email'] ?? '';
    final role = _user!['role'] ?? 'user';
    final isAdmin = role == 'admin' || email.startsWith('jannowak') || email.startsWith('admin');

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // 1. Signed in as Header Card (Matches Screenshot media_1788016230579.png)
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
            boxShadow: const [
              BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    tr('profile_signed_in_as'),
                    style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  if (isAdmin)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFCCFBF1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tr('profile_owner_admin'),
                        style: const TextStyle(
                          color: Color(0xFF0F766E),
                          fontWeight: FontWeight.w900,
                          fontSize: 10,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: const Color(0xFF0D9488),
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : 'U',
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF002F34),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          email,
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // 2. Options Menu Card (Matches the items from the web screenshot)
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Column(
            children: [
              // 1. Notifications
              ListTile(
                leading: const Icon(Icons.notifications_none_rounded, color: Color(0xFF0D9488)),
                title: Text(tr('profile_notifications'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF002F34))),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_unreadNotifications > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(10)),
                        child: Text('$_unreadNotifications', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    const SizedBox(width: 6),
                    const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                  ],
                ),
                onTap: _showNotificationsDialog,
              ),
              const Divider(height: 1, indent: 56),

              // 2. Messages
              ListTile(
                leading: const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFF0D9488)),
                title: Text(tr('nav_messages'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF002F34))),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                onTap: () => widget.onNavigateTab?.call(3),
              ),
              const Divider(height: 1, indent: 56),

              // 3. My Advertisements
              ListTile(
                leading: const Icon(Icons.description_outlined, color: Colors.blueGrey),
                title: Text(tr('profile_my_ads'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF002F34))),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                onTap: _showMyAdsDialog,
              ),
              const Divider(height: 1, indent: 56),

              // 4. Saved Items
              ListTile(
                leading: const Icon(Icons.favorite_outline_rounded, color: Colors.redAccent),
                title: ValueListenableBuilder<int>(
                  valueListenable: ApiService.savedCountNotifier,
                  builder: (context, count, _) {
                    return Text(
                      '${tr("profile_saved_items")} ($count)',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF002F34)),
                    );
                  },
                ),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                onTap: () => widget.onNavigateTab?.call(1),
              ),
              const Divider(height: 1, indent: 56),

              // 5. Language Selector Tile
              ListTile(
                leading: const Icon(Icons.language_rounded, color: Color(0xFF0D9488)),
                title: Text(tr('profile_language'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF002F34))),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      AppTranslations.supportedLanguages.firstWhere(
                        (l) => l['code'] == LanguageController.instance.languageCode,
                        orElse: () => AppTranslations.supportedLanguages[0],
                      )['native'] ?? '',
                      style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                  ],
                ),
                onTap: () => LanguagePickerDialog.show(context),
              ),
              const Divider(height: 1, indent: 56),

              // 6. Account Settings
              ListTile(
                leading: const Icon(Icons.settings_outlined, color: Colors.grey),
                title: Text(tr('profile_account_settings'), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFF002F34))),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
                onTap: _showAccountSettingsDialog,
              ),

              // 7. Admin Portal (Owner) - Only visible if admin!
              if (isAdmin) ...[
                const Divider(height: 1),
                Container(
                  color: const Color(0xFFF0FDF4),
                  child: ListTile(
                    leading: const Icon(Icons.shield_outlined, color: Color(0xFF0D9488)),
                    title: const Text(
                      'Admin Portal (Owner)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF002F34)),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF0D9488)),
                    onTap: _showAdminPortalDialog,
                  ),
                ),
              ],

              const Divider(height: 1),

              // 8. Log Out
              ListTile(
                leading: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                title: Text(
                  tr('profile_logout'),
                  style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                onTap: _showLogoutConfirmDialog,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAuthForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Tabs toggle
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isLogin = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _isLogin ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: _isLogin ? const [BoxShadow(color: Colors.black12, blurRadius: 4)] : null,
                        ),
                        child: Center(
                          child: Text(
                            tr('profile_sign_in'),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: _isLogin ? const Color(0xFF002F34) : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isLogin = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !_isLogin ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: !_isLogin ? const [BoxShadow(color: Colors.black12, blurRadius: 4)] : null,
                        ),
                        child: Center(
                          child: Text(
                            tr('profile_create_account'),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: !_isLogin ? const Color(0xFF002F34) : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (_authError != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Text(
                  _authError!,
                  style: TextStyle(color: Colors.red.shade800, fontSize: 13),
                ),
              ),

            if (!_isLogin) ...[
              Text(tr('auth_full_name'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
              const SizedBox(height: 6),
              TextFormField(
                decoration: InputDecoration(
                  hintText: 'e.g. John Doe',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Name is required' : null,
                onSaved: (val) => _name = val?.trim() ?? '',
              ),
              const SizedBox(height: 16),
            ],

            Text(tr('auth_email'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
            const SizedBox(height: 6),
            TextFormField(
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                hintText: 'name@example.com',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              ),
              validator: (val) => val == null || !val.contains('@') ? 'Valid email required' : null,
              onSaved: (val) => _email = val?.trim() ?? '',
            ),
            const SizedBox(height: 16),

            Text(tr('auth_password'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
            const SizedBox(height: 6),
            TextFormField(
              obscureText: true,
              decoration: InputDecoration(
                hintText: '••••••••',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
              ),
              validator: (val) => val == null || val.length < 6 ? 'At least 6 characters' : null,
              onSaved: (val) => _password = val?.trim() ?? '',
            ),
            if (_isLogin) ...[
              const SizedBox(height: 6),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: _showForgotPasswordDialog,
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                  ),
                  child: Text(
                    tr('auth_forgot_password'),
                    style: const TextStyle(
                      color: Color(0xFF0D9488),
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 20),

            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _authSubmitting ? null : _handleAuth,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF002F34),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _authSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        _isLogin ? tr('profile_sign_in') : tr('profile_create_account'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
              ),
            ),

            if (_isLogin) ...[
              const SizedBox(height: 12),
              Center(
                child: TextButton.icon(
                  onPressed: _showResendVerificationDialog,
                  icon: const Icon(Icons.mail_outline_rounded, size: 15, color: Colors.grey),
                  label: const Text(
                    "Didn't receive verification email? Resend",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Divider
            Row(
              children: [
                Expanded(child: Divider(color: Colors.grey.shade300)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    tr('auth_or_continue').toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ),
                Expanded(child: Divider(color: Colors.grey.shade300)),
              ],
            ),

            const SizedBox(height: 16),

            // Google Sign-In Button
            SizedBox(
              height: 48,
              width: double.infinity,
              child: OutlinedButton(
                onPressed: (_authSubmitting || _googleSubmitting || _fbSubmitting) ? null : _handleGoogleSignIn,
                style: OutlinedButton.styleFrom(
                  backgroundColor: Colors.white,
                  side: BorderSide(color: Colors.grey.shade300),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                child: _googleSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF002F34)),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'G',
                            style: TextStyle(
                              fontSize: 19,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF4285F4),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            tr('auth_google'),
                            style: const TextStyle(
                              color: Color(0xFF002F34),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: 10),

            // Facebook Sign-In Button
            SizedBox(
              height: 48,
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (_authSubmitting || _googleSubmitting || _fbSubmitting) ? null : _handleFacebookSignIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1877F2),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  elevation: 0,
                ),
                child: _fbSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'f',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              fontFamily: 'Roboto',
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            tr('auth_facebook'),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
