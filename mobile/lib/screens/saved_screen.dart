import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../widgets/app_image.dart';
import 'ad_details_screen.dart';

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  List<dynamic> _savedAds = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchSavedAds();
  }

  Future<void> _fetchSavedAds() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final token = await ApiService.getToken();
      if (token == null) {
        setState(() {
          _error = 'Please sign in to view your saved items.';
          _loading = false;
        });
        return;
      }

      final ads = await ApiService.getSavedAds();
      setState(() {
        _savedAds = ads;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load saved items.';
        _loading = false;
      });
    }
  }

  Future<void> _removeSaved(int adId) async {
    await ApiService.toggleSavedAd(adId);
    setState(() {
      _savedAds.removeWhere((item) => item['id'] == adId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text(
          'Saved Items',
          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34)),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        color: const Color(0xFF0D9488),
        onRefresh: _fetchSavedAds,
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)))
            : _error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.favorite_border, size: 64, color: Colors.grey),
                          const SizedBox(height: 12),
                          Text(_error!, style: const TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  )
                : _savedAds.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.favorite_border, size: 64, color: Colors.grey),
                            SizedBox(height: 12),
                            Text(
                              'Your wishlist is empty',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF002F34)),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Click the heart icon on any ad to bookmark it.',
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _savedAds.length,
                        itemBuilder: (ctx, idx) {
                          final ad = _savedAds[idx];
                          final images = (ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
                          final cover = images.isNotEmpty ? images[0] : null;
                          final price = ad['price'] ?? 0;
                          final currency = ad['currency'] ?? 'USD';
                          final title = ad['title'] ?? '';
                          final location = ad['location'] ?? 'Entire Country';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: const BorderSide(color: Color(0xFFE5E7EB)),
                            ),
                            elevation: 0,
                            clipBehavior: Clip.antiAlias,
                            color: Colors.white,
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => AdDetailsScreen(
                                      ad: ad,
                                      initialSaved: true,
                                      onSavedChanged: _fetchSavedAds,
                                    ),
                                  ),
                                );
                              },
                              child: Row(
                                children: [
                                  Container(
                                    width: 110,
                                    height: 110,
                                    color: Colors.grey.shade100,
                                    child: AppImage(
                                      imageUrl: cover,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(12),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            '$price $currency',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 18,
                                              color: Color(0xFF002F34),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            title,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                              color: Color(0xFF1F2937),
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 6),
                                          Row(
                                            children: [
                                              const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                                              const SizedBox(width: 2),
                                              Expanded(
                                                child: Text(
                                                  location,
                                                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.favorite, color: Colors.redAccent),
                                    onPressed: () => _removeSaved(ad['id'] as int),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
