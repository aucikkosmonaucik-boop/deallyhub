import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../widgets/app_image.dart';
import 'ad_details_screen.dart';

class SavedScreen extends StatefulWidget {
  final VoidCallback? onGoToAccount;
  const SavedScreen({super.key, this.onGoToAccount});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  List<dynamic> _savedAds = [];
  bool _loading = true;
  bool _isLoggedIn = false;
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
      final ads = await ApiService.getSavedAds();
      if (mounted) {
        setState(() {
          _isLoggedIn = token != null;
          _savedAds = ads;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load saved items.';
          _loading = false;
        });
      }
    }
  }

  Future<void> _removeSaved(Map<String, dynamic> ad) async {
    final adId = ad['id'] as int;
    setState(() {
      _savedAds.removeWhere((item) => item['id'] == adId);
    });
    await ApiService.toggleSavedAd(adId, ad);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: ValueListenableBuilder<int>(
          valueListenable: ApiService.savedCountNotifier,
          builder: (context, count, _) {
            return Text(
              count > 0 ? 'Saved Items ($count)' : 'Saved Items',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF002F34)),
            );
          },
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
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.favorite_border, size: 64, color: Colors.grey),
                              const SizedBox(height: 12),
                              const Text(
                                'Your wishlist is empty',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF002F34)),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Click the heart icon on any ad to bookmark it.',
                                style: TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                              if (!_isLoggedIn) ...[
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: widget.onGoToAccount,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF002F34),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  child: const Text('Sign in to sync saved items'),
                                ),
                              ],
                            ],
                          ),
                        ),
                      )
                    : Column(
                        children: [
                          if (!_isLoggedIn)
                            Container(
                              margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDF4),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFBBF7D0)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.info_outline, color: Color(0xFF0D9488), size: 18),
                                  const SizedBox(width: 10),
                                  const Expanded(
                                    child: Text(
                                      'Sign in to sync your saved items across devices.',
                                      style: TextStyle(fontSize: 12, color: Color(0xFF065F46)),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: widget.onGoToAccount,
                                    child: const Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0D9488))),
                                  ),
                                ],
                              ),
                            ),
                          Expanded(
                            child: ListView.builder(
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
                                        SizedBox(
                                          width: 110,
                                          height: 100,
                                          child: AppImage(imageUrl: cover, fit: BoxFit.cover),
                                        ),
                                        Expanded(
                                          child: Padding(
                                            padding: const EdgeInsets.all(12),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  title,
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF002F34)),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  '$price $currency',
                                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0D9488)),
                                                ),
                                                const SizedBox(height: 6),
                                                Row(
                                                  children: [
                                                    const Icon(Icons.location_on_outlined, size: 12, color: Colors.grey),
                                                    const SizedBox(width: 2),
                                                    Expanded(
                                                      child: Text(
                                                        location,
                                                        style: const TextStyle(fontSize: 11, color: Colors.grey),
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
                                          onPressed: () => _removeSaved(ad),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
      ),
    );
  }
}
