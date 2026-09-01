import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../api/api_service.dart';
import '../l10n/language_controller.dart';
import '../widgets/app_image.dart';
import '../utils/content_filter.dart';

class PostAdScreen extends StatefulWidget {
  final VoidCallback? onAdCreated;
  final VoidCallback? onGoToAccount;

  const PostAdScreen({
    super.key,
    this.onAdCreated,
    this.onGoToAccount,
  });

  @override
  State<PostAdScreen> createState() => _PostAdScreenState();
}

class _PostAdScreenState extends State<PostAdScreen> {
  final _formKey = GlobalKey<FormState>();
  final ImagePicker _picker = ImagePicker();

  bool _isLoggedIn = false;
  bool _checkingAuth = true;
  bool _pickingImage = false;

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _origPriceController = TextEditingController();
  final TextEditingController _locationController = TextEditingController(text: 'Entire Country');
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _imgUrlController = TextEditingController();

  String _currency = 'USD';
  String _categorySlug = 'antiques-collectibles';
  bool _isFree = false;
  bool _isPromo = false;

  final List<String> _images = [];

  List<dynamic> _categories = [];
  bool _loadingCategories = true;
  bool _submitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _origPriceController.dispose();
    _locationController.dispose();
    _phoneController.dispose();
    _imgUrlController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _checkAuth();
    _loadCategories();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await ApiService.getToken();
    if (mounted) {
      setState(() {
        _isLoggedIn = token != null;
        _checkingAuth = false;
      });
    }
  }

  Future<void> _loadCategories() async {
    final cats = await ApiService.getCategories();
    if (mounted) {
      setState(() {
        _categories = cats;
        if (cats.isNotEmpty) {
          _categorySlug = cats[0]['slug'] ?? 'antiques-collectibles';
        }
        _loadingCategories = false;
      });
    }
  }

  void _addImageUrl() {
    final url = _imgUrlController.text.trim();
    if (url.isNotEmpty && !_images.contains(url)) {
      setState(() {
        _images.add(url);
        _imgUrlController.clear();
      });
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      setState(() => _pickingImage = true);
      final XFile? photo = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 80,
      );

      if (photo != null) {
        final bytes = await photo.readAsBytes();
        final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        setState(() {
          _images.add(base64String);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load photo: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _pickingImage = false);
    }
  }

  Future<void> _submitAd() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    final token = await ApiService.getToken();
    if (!mounted) return;
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in before posting an advertisement.')),
      );
      widget.onGoToAccount?.call();
      return;
    }

    setState(() => _submitting = true);

    final title = _titleController.text.trim();
    final description = _descController.text.trim();
    final parsedPrice = _isFree ? 0.0 : (double.tryParse(_priceController.text.trim()) ?? 0.0);
    final parsedOrigPrice = (_isPromo && !_isFree && _origPriceController.text.trim().isNotEmpty)
        ? double.tryParse(_origPriceController.text.trim())
        : null;

    if (_isPromo && !_isFree && parsedOrigPrice != null && parsedOrigPrice <= parsedPrice) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Regular price must be higher than current promotional price.')),
      );
      setState(() => _submitting = false);
      return;
    }

    final locationVal = _locationController.text.trim().isEmpty ? 'Entire Country' : _locationController.text.trim();
    final phoneVal = _phoneController.text.trim();

    if (AppContentFilter.containsProfanity(title) ||
        AppContentFilter.containsProfanity(description) ||
        AppContentFilter.containsProfanity(locationVal)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFDC2626),
          content: Text(tr('error_profanity')),
        ),
      );
      setState(() => _submitting = false);
      return;
    }

    try {
      final res = await ApiService.createAd(
        categorySlug: _categorySlug,
        title: title,
        description: description,
        price: parsedPrice,
        originalPrice: parsedOrigPrice,
        currency: _currency,
        location: locationVal,
        phone: phoneVal,
        images: _images,
      );

      if (res['success'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF0D9488),
            content: Text(tr('post_success')),
          ),
        );
        widget.onAdCreated?.call();
        // Reset form
        setState(() {
          _titleController.clear();
          _descController.clear();
          _priceController.clear();
          _origPriceController.clear();
          _phoneController.clear();
          _locationController.text = 'Entire Country';
          _images.clear();
          _isFree = false;
          _isPromo = false;
        });
      } else {
        if (!mounted) return;
        final errStr = res['error']?.toString() ?? '';
        final violation = res['violation']?.toString() ?? '';
        String displayError = errStr;
        if (violation == 'NSFW_IMAGE_DETECTED' ||
            errStr.toLowerCase().contains('nudity') ||
            errStr.toLowerCase().contains('adult') ||
            errStr.toLowerCase().contains('erotic') ||
            errStr.toLowerCase().contains('nagość')) {
          displayError = tr('error_nsfw_image');
        } else if (errStr.toLowerCase().contains('prohibited') ||
            errStr.toLowerCase().contains('offensive') ||
            errStr.toLowerCase().contains('niedozwolon') ||
            errStr.toLowerCase().contains('obrażliw')) {
          displayError = tr('error_profanity');
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFDC2626),
            content: Text(displayError.isNotEmpty ? displayError : 'Failed to publish ad'),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_checkingAuth) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488))),
      );
    }

    // If user is not logged in, enforce registration requirement
    if (!_isLoggedIn) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: AppBar(
          title: Text(
            tr('post_title'),
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          backgroundColor: Theme.of(context).colorScheme.surface,
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF134E4A) : const Color(0xFFF0FDFA),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.lock_outline, size: 40, color: Color(0xFF0D9488)),
                ),
                const SizedBox(height: 20),
                Text(
                  'Registration Required',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'To protect our marketplace and verify sellers, posting advertisements is available exclusively to registered members.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: Colors.grey, height: 1.5),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => widget.onGoToAccount?.call(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? const Color(0xFF0D9488) : const Color(0xFF002F34),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text(
                      'Go to Account (Sign In / Register)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton.icon(
                  onPressed: _checkAuth,
                  icon: const Icon(Icons.refresh, size: 16, color: Color(0xFF0D9488)),
                  label: const Text(
                    'Already signed in? Refresh status',
                    style: TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          tr('post_title'),
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
      ),
      body: _loadingCategories
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
          : Form(
              key: _formKey,
              autovalidateMode: AutovalidateMode.onUserInteraction,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Category Dropdown
                  Text(
                    '${tr("post_category")} *',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _categories.any((c) => c['slug'] == _categorySlug)
                        ? _categorySlug
                        : (_categories.isNotEmpty ? _categories[0]['slug'] : _categorySlug),
                    dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 14),
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      filled: true,
                      fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                    ),
                    items: _categories.map((c) {
                      final slug = c['slug'] as String;
                      final rawName = c['name'] as String;
                      return DropdownMenuItem<String>(
                        value: slug,
                        child: Text(trCat(slug, rawName), style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _categorySlug = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  // Title
                  Text(
                    '${tr("post_ad_title")} *',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _titleController,
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                    decoration: InputDecoration(
                      hintText: 'e.g. iPhone 15 Pro, Vintage Jacket, Kitten...',
                      hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                      filled: true,
                      fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Title is required' : null,
                  ),
                  const SizedBox(height: 16),

                  // Price & Currency & Free toggle
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${tr("post_price")} *',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _priceController,
                              enabled: !_isFree,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: InputDecoration(
                                hintText: _isFree ? tr('common_free') : '0.00',
                                hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                                filled: true,
                                fillColor: _isFree
                                    ? (isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB))
                                    : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB)),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                              ),
                              validator: (val) {
                                if (!_isFree && (val == null || val.trim().isEmpty)) return 'Required';
                                return null;
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tr('post_currency'),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              initialValue: _currency,
                              dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 14),
                              decoration: InputDecoration(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                filled: true,
                                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                              ),
                              items: [
                                DropdownMenuItem(value: 'USD', child: Text('USD', style: TextStyle(color: Theme.of(context).colorScheme.onSurface))),
                                DropdownMenuItem(value: 'EUR', child: Text('EUR', style: TextStyle(color: Theme.of(context).colorScheme.onSurface))),
                                DropdownMenuItem(value: 'PLN', child: Text('PLN', style: TextStyle(color: Theme.of(context).colorScheme.onSurface))),
                                DropdownMenuItem(value: 'GBP', child: Text('GBP', style: TextStyle(color: Theme.of(context).colorScheme.onSurface))),
                              ],
                              onChanged: (val) => setState(() => _currency = val ?? 'USD'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      tr('post_free'),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                    value: _isFree,
                    activeColor: const Color(0xFF0D9488),
                    onChanged: (val) {
                      setState(() {
                        _isFree = val ?? false;
                        if (_isFree) _isPromo = false;
                      });
                    },
                  ),
                  if (!_isFree) ...[
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text(
                        'Promo / Discount Tag',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.deepOrange),
                      ),
                      secondary: const Icon(Icons.local_offer_outlined, color: Colors.deepOrange, size: 20),
                      value: _isPromo,
                      activeColor: Colors.deepOrange,
                      onChanged: (val) => setState(() => _isPromo = val ?? false),
                    ),
                    if (_isPromo) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF3B1A1A) : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? const Color(0xFF7F1D1D) : Colors.red.shade200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${tr("post_regular_price")} *',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                color: isDark ? const Color(0xFFFCA5A5) : Colors.red.shade900,
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _origPriceController,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              onChanged: (_) => setState(() {}),
                              decoration: InputDecoration(
                                hintText: 'e.g. 120.00',
                                hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                                filled: true,
                                fillColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: isDark ? const Color(0xFF7F1D1D) : Colors.red.shade300)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                            Builder(
                              builder: (context) {
                                final curP = double.tryParse(_priceController.text.trim()) ?? 0.0;
                                final origP = double.tryParse(_origPriceController.text.trim()) ?? 0.0;
                                if (origP > curP && curP > 0) {
                                  final discount = ((origP - curP) / origP * 100).round();
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          '${tr("post_you_save")}: ${(origP - curP).toStringAsFixed(2)} $_currency',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                            color: isDark ? const Color(0xFFFCA5A5) : Colors.red.shade800,
                                          ),
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
                      const SizedBox(height: 8),
                    ],
                  ],

                  // Location & Phone
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tr('post_location'),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _locationController,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                              decoration: InputDecoration(
                                hintText: 'e.g. Warsaw',
                                hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                                filled: true,
                                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
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
                            Text(
                              tr('post_phone'),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: Theme.of(context).colorScheme.onSurface,
                              ),
                            ),
                            const SizedBox(height: 6),
                            TextFormField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                              decoration: InputDecoration(
                                hintText: '+48 ...',
                                hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                                filled: true,
                                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Photos Section (Gallery, Camera, or URL)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        tr('post_photos'),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        '${_images.length}/10',
                        style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Add photos from your phone memory or camera',
                    style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                  ),
                  const SizedBox(height: 10),

                  // Pick Image Buttons (Gallery & Camera)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: (_pickingImage || _images.length >= 10)
                              ? null
                              : () => _pickImage(ImageSource.gallery),
                          icon: Icon(
                            Icons.photo_library_rounded,
                            size: 20,
                            color: isDark ? Colors.white : const Color(0xFF002F34),
                          ),
                          label: Text(
                            'Gallery',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : const Color(0xFF002F34),
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            side: BorderSide(color: isDark ? const Color(0xFF475569) : const Color(0xFF002F34)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: (_pickingImage || _images.length >= 10)
                              ? null
                              : () => _pickImage(ImageSource.camera),
                          icon: const Icon(Icons.camera_alt_rounded, size: 20, color: Color(0xFF0D9488)),
                          label: const Text(
                            'Camera',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0D9488)),
                          ),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 13),
                            side: const BorderSide(color: Color(0xFF0D9488)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            backgroundColor: isDark ? const Color(0xFF134E4A) : const Color(0xFFF0FDFA),
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (_pickingImage) ...[
                    const SizedBox(height: 12),
                    const Center(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF0D9488)),
                          ),
                          SizedBox(width: 8),
                          Text('Loading photo...', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ],

                  // Image Previews Grid
                  if (_images.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: _images.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final imgData = entry.value;
                        return Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Theme.of(context).dividerColor),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: AppImage(
                                imageUrl: imgData,
                                fit: BoxFit.cover,
                              ),
                            ),
                            if (idx == 0)
                              Positioned(
                                bottom: 4,
                                left: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xCC002F34),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'COVER',
                                    style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
                                  ),
                                ),
                              ),
                            Positioned(
                              top: -6,
                              right: -6,
                              child: GestureDetector(
                                onTap: () => setState(() => _images.removeAt(idx)),
                                child: Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFE11D48),
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(color: Colors.black26, blurRadius: 3),
                                    ],
                                  ),
                                  child: const Icon(Icons.close_rounded, size: 14, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ],

                  const SizedBox(height: 12),

                  // Optional Image URL Input
                  ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    dense: true,
                    title: Text(
                      'Or add image by URL (optional)',
                      style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFF94A3B8) : Colors.grey, fontWeight: FontWeight.w600),
                    ),
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _imgUrlController,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                              decoration: InputDecoration(
                                hintText: 'https://images.unsplash.com/...',
                                hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                filled: true,
                                fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: _addImageUrl,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isDark ? const Color(0xFF0D9488) : const Color(0xFF002F34),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Add'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Description
                  Text(
                    '${tr("post_desc")} *',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: _descController,
                    maxLines: 4,
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
                    decoration: InputDecoration(
                      hintText: 'Describe details, condition, terms of sale and meetup...',
                      hintStyle: TextStyle(fontSize: 13, color: isDark ? const Color(0xFF94A3B8) : Colors.grey.shade500),
                      filled: true,
                      fillColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Description is required' : null,
                  ),
                  const SizedBox(height: 24),

                  // Submit Button
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _submitAd,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? const Color(0xFF0D9488) : const Color(0xFF002F34),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _submitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(tr('post_submit'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
