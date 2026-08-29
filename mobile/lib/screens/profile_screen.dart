import 'package:flutter/material.dart';
import '../api/api_service.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback? onAuthChanged;

  const ProfileScreen({super.key, this.onAuthChanged});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;
  bool _loading = true;

  // Auth form states
  bool _isLogin = true;
  final _formKey = GlobalKey<FormState>();
  String _name = '';
  String _email = '';
  String _password = '';
  bool _authSubmitting = false;
  String? _authError;

  @override
  void initState() {
    super.initState();
    _checkUser();
  }

  Future<void> _checkUser() async {
    setState(() => _loading = true);
    final user = await ApiService.getCurrentUser();
    if (mounted) {
      setState(() {
        _user = user;
        _loading = false;
      });
    }
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
        await _checkUser();
        widget.onAuthChanged?.call();
      } else {
        setState(() => _authError = res['error'] ?? 'Authentication failed');
      }
    } catch (e) {
      setState(() => _authError = 'Error connecting to server: $e');
    } finally {
      if (mounted) setState(() => _authSubmitting = false);
    }
  }

  Future<void> _logout() async {
    await ApiService.logout();
    await _checkUser();
    widget.onAuthChanged?.call();
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
          _user != null ? 'My Profile' : (_isLogin ? 'Sign In' : 'Create Account'),
          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34)),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _user != null ? _buildProfileView() : _buildAuthForm(),
    );
  }

  Widget _buildProfileView() {
    final name = _user!['name'] ?? 'User';
    final email = _user!['email'] ?? '';

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Avatar Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 32,
                backgroundColor: const Color(0xFF0D9488),
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : 'U',
                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
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
        ),
        const SizedBox(height: 24),

        // Settings / Logout
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text(
                  'Log Out',
                  style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                ),
                onTap: _logout,
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
                            'Sign In',
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
                            'Register',
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

            if (_authError != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
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
              const SizedBox(height: 16),
            ],

            if (!_isLogin) ...[
              const Text('Full Name', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
              const SizedBox(height: 6),
              TextFormField(
                decoration: InputDecoration(
                  hintText: 'John Doe',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Name required' : null,
                onSaved: (val) => _name = val?.trim() ?? '',
              ),
              const SizedBox(height: 16),
            ],

            const Text('Email Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
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

            const Text('Password', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
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
            const SizedBox(height: 24),

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
                        _isLogin ? 'Sign In' : 'Create Account',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
