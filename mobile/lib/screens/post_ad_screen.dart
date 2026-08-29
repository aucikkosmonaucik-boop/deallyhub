import 'package:flutter/material.dart';
import '../api/api_service.dart';

class PostAdScreen extends StatefulWidget {
  final VoidCallback? onAdCreated;

  const PostAdScreen({super.key, this.onAdCreated});

  @override
  State<PostAdScreen> createState() => _PostAdScreenState();
}

class _PostAdScreenState extends State<PostAdScreen> {
  final _formKey = GlobalKey<FormState>();

  String _title = '';
  String _description = '';
  String _price = '';
  String _currency = 'USD';
  String _location = 'Entire Country';
  String _phone = '';
  String _categorySlug = 'antiques-collectibles';
  bool _isFree = false;

  final List<String> _images = [];
  final TextEditingController _imgUrlController = TextEditingController();

  List<dynamic> _categories = [];
  bool _loadingCategories = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
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

  Future<void> _submitAd() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    final token = await ApiService.getToken();
    if (token == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please sign in before posting an advertisement.')),
        );
      }
      return;
    }

    setState(() => _submitting = true);

    try {
      final parsedPrice = _isFree ? 0.0 : (double.tryParse(_price) ?? 0.0);
      final res = await ApiService.createAd(
        categorySlug: _categorySlug,
        title: _title,
        description: _description,
        price: parsedPrice,
        currency: _currency,
        location: _location,
        phone: _phone,
        images: _images,
      );

      if (res['success'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF0D9488),
            content: Text('Advertisement published successfully!'),
          ),
        );
        widget.onAdCreated?.call();
        // Reset
        setState(() {
          _title = '';
          _description = '';
          _price = '';
          _images.clear();
        });
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res['error'] ?? 'Failed to publish ad')),
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Post an Advertisement',
          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34)),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loadingCategories
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Category Dropdown
                  const Text('Category *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _categorySlug,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      filled: true,
                      fillColor: const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                    ),
                    items: _categories.map((c) {
                      return DropdownMenuItem<String>(
                        value: c['slug'] as String,
                        child: Text(c['name'] as String, style: const TextStyle(fontSize: 14)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _categorySlug = val);
                    },
                  ),
                  const SizedBox(height: 16),

                  // Title
                  const Text('Title *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                  const SizedBox(height: 6),
                  TextFormField(
                    initialValue: _title,
                    decoration: InputDecoration(
                      hintText: 'e.g. iPhone 15 Pro, Vintage Jacket, Kitten...',
                      filled: true,
                      fillColor: const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Title is required' : null,
                    onSaved: (val) => _title = val?.trim() ?? '',
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
                            const Text('Price *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                            const SizedBox(height: 6),
                            TextFormField(
                              enabled: !_isFree,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: _isFree ? 'Free' : '0.00',
                                filled: true,
                                fillColor: _isFree ? const Color(0xFFE5E7EB) : const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                              ),
                              validator: (val) {
                                if (!_isFree && (val == null || val.trim().isEmpty)) return 'Required';
                                return null;
                              },
                              onSaved: (val) => _price = val?.trim() ?? '0',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Currency', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              initialValue: _currency,
                              decoration: InputDecoration(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                filled: true,
                                fillColor: const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                              ),
                              items: const [
                                DropdownMenuItem(value: 'USD', child: Text('USD')),
                                DropdownMenuItem(value: 'EUR', child: Text('EUR')),
                                DropdownMenuItem(value: 'PLN', child: Text('PLN')),
                                DropdownMenuItem(value: 'GBP', child: Text('GBP')),
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
                    title: const Text('Free / Giveaway item', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    value: _isFree,
                    activeColor: const Color(0xFF0D9488),
                    onChanged: (val) => setState(() => _isFree = val ?? false),
                  ),
                  const SizedBox(height: 8),

                  // Location & Phone
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                            const SizedBox(height: 6),
                            TextFormField(
                              initialValue: _location,
                              decoration: InputDecoration(
                                hintText: 'e.g. Warsaw',
                                filled: true,
                                fillColor: const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                              ),
                              onSaved: (val) => _location = val?.trim().isNotEmpty == true ? val!.trim() : 'Entire Country',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Phone Number', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                            const SizedBox(height: 6),
                            TextFormField(
                              keyboardType: TextInputType.phone,
                              decoration: InputDecoration(
                                hintText: '+48 ...',
                                filled: true,
                                fillColor: const Color(0xFFF9FAFB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                              ),
                              onSaved: (val) => _phone = val?.trim() ?? '',
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Photos URL
                  const Text('Photos (Image URLs)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _imgUrlController,
                          decoration: InputDecoration(
                            hintText: 'https://images.unsplash.com/...',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            filled: true,
                            fillColor: const Color(0xFFF9FAFB),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _addImageUrl,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF002F34),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Add'),
                      ),
                    ],
                  ),

                  // Image previews
                  if (_images.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _images.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final url = entry.value;
                        return Stack(
                          children: [
                            Container(
                              width: 70,
                              height: 70,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                image: DecorationImage(image: networkErrorSafeImage(url), fit: BoxFit.cover),
                              ),
                            ),
                            Positioned(
                              top: 2,
                              right: 2,
                              child: InkWell(
                                onTap: () => setState(() => _images.removeAt(idx)),
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                  child: const Icon(Icons.close, size: 12, color: Colors.white),
                                ),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ],
                  const SizedBox(height: 16),

                  // Description
                  const Text('Description *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF002F34))),
                  const SizedBox(height: 6),
                  TextFormField(
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: 'Describe details, condition, terms of sale and meetup...',
                      filled: true,
                      fillColor: const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Description is required' : null,
                    onSaved: (val) => _description = val?.trim() ?? '',
                  ),
                  const SizedBox(height: 24),

                  // Submit Button
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _submitAd,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF002F34),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _submitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Publish Advertisement', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  ImageProvider networkErrorSafeImage(String url) {
    return NetworkImage(url);
  }
}
