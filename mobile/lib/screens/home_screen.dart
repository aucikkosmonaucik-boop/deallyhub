import 'package:flutter/material.dart';
import '../api/api_service.dart';
import 'ad_details_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  List<dynamic> _categories = [];
  List<dynamic> _ads = [];
  Set<int> _savedAdIds = {};
  String? _selectedCategory;

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _loading = true);
    final catsFuture = ApiService.getCategories();
    final adsFuture = ApiService.getAds();
    final savedFuture = ApiService.getSavedAds();

    final results = await Future.wait([catsFuture, adsFuture, savedFuture]);

    if (mounted) {
      final savedList = results[2];
      setState(() {
        _categories = results[0];
        _ads = results[1];
        _savedAdIds = savedList.map<int>((e) => e['id'] as int).toSet();
        _loading = false;
      });
    }
  }

  Future<void> _fetchAds() async {
    setState(() => _loading = true);
    final ads = await ApiService.getAds(
      category: _selectedCategory,
      search: _searchController.text.trim(),
      location: _locationController.text.trim(),
    );
    if (mounted) {
      setState(() {
        _ads = ads;
        _loading = false;
      });
    }
  }

  Future<void> _toggleSaved(int adId) async {
    final isSaved = await ApiService.toggleSavedAd(adId);
    setState(() {
      if (isSaved) {
        _savedAdIds.add(adId);
      } else {
        _savedAdIds.remove(adId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            RichText(
              text: const TextSpan(
                text: 'Deally',
                style: TextStyle(color: Color(0xFF002F34), fontWeight: FontWeight.w900, fontSize: 22),
                children: [
                  TextSpan(
                    text: 'hub',
                    style: TextStyle(color: Color(0xFF0D9488)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: const Color(0xFF0D9488),
        onRefresh: () async {
          await _loadInitialData();
        },
        child: CustomScrollView(
          slivers: [
            // Search Bar Header
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Column(
                  children: [
                    // Search Input
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          hintText: 'Find something for yourself...',
                          hintStyle: const TextStyle(fontSize: 13, color: Colors.grey),
                          prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                          suffixIcon: _searchController.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear, size: 16),
                                  onPressed: () {
                                    _searchController.clear();
                                    _fetchAds();
                                  },
                                )
                              : null,
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        onSubmitted: (_) => _fetchAds(),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Location Input & Search Button
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: TextField(
                              controller: _locationController,
                              decoration: const InputDecoration(
                                hintText: 'Location (e.g. Warsaw)',
                                hintStyle: TextStyle(fontSize: 13, color: Colors.grey),
                                prefixIcon: Icon(Icons.location_on_outlined, color: Colors.grey, size: 18),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(vertical: 12),
                              ),
                              onSubmitted: (_) => _fetchAds(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _fetchAds,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF002F34),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Search', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Horizontal Categories Scroll
            SliverToBoxAdapter(
              child: Container(
                height: 52,
                margin: const EdgeInsets.symmetric(vertical: 8),
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length + 1,
                  itemBuilder: (ctx, idx) {
                    if (idx == 0) {
                      final isSelected = _selectedCategory == null;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: const Text('All Categories'),
                          selected: isSelected,
                          selectedColor: const Color(0xFF002F34),
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF002F34),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                          onSelected: (_) {
                            setState(() => _selectedCategory = null);
                            _fetchAds();
                          },
                        ),
                      );
                    }

                    final cat = _categories[idx - 1];
                    final isSelected = _selectedCategory == cat['slug'];

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(cat['name'] as String),
                        selected: isSelected,
                        selectedColor: const Color(0xFF002F34),
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : const Color(0xFF002F34),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = isSelected ? null : cat['slug'];
                          });
                          _fetchAds();
                        },
                      ),
                    );
                  },
                ),
              ),
            ),

            // Advertisements Grid
            _loading
                ? const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator(color: Color(0xFF0D9488))),
                  )
                : _ads.isEmpty
                    ? const SliverFillRemaining(
                        child: Center(
                          child: Text(
                            'No advertisements found',
                            style: TextStyle(color: Colors.grey, fontSize: 16),
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.all(16),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.68,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (ctx, idx) {
                              final ad = _ads[idx];
                              final images = (ad['images'] as List<dynamic>?)?.cast<String>() ?? [];
                              final cover = images.isNotEmpty ? images[0] : null;
                              final price = ad['price'] ?? 0;
                              final currency = ad['currency'] ?? 'USD';
                              final title = ad['title'] ?? '';
                              final location = ad['location'] ?? 'Entire Country';
                              final adId = ad['id'] as int;
                              final isSaved = _savedAdIds.contains(adId);
                              final isFree = (double.tryParse('$price') ?? 0) == 0;

                              return Card(
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
                                          initialSaved: isSaved,
                                          onSavedChanged: _loadInitialData,
                                        ),
                                      ),
                                    );
                                  },
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Image
                                      Stack(
                                        children: [
                                          Container(
                                            height: 130,
                                            width: double.infinity,
                                            color: Colors.grey.shade100,
                                            child: cover != null
                                                ? Image.network(cover, fit: BoxFit.cover)
                                                : const Icon(Icons.image_outlined, color: Colors.grey),
                                          ),
                                          Positioned(
                                            top: 6,
                                            right: 6,
                                            child: GestureDetector(
                                              onTap: () => _toggleSaved(adId),
                                              child: Container(
                                                padding: const EdgeInsets.all(6),
                                                decoration: const BoxDecoration(
                                                  color: Colors.white,
                                                  shape: BoxShape.circle,
                                                ),
                                                child: Icon(
                                                  isSaved ? Icons.favorite : Icons.favorite_border,
                                                  size: 16,
                                                  color: isSaved ? Colors.redAccent : Colors.grey,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),

                                      // Details
                                      Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.all(10),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                isFree ? 'Free' : '$price $currency',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w900,
                                                  fontSize: 16,
                                                  color: Color(0xFF002F34),
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                title,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 13,
                                                  color: Color(0xFF1F2937),
                                                ),
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const Spacer(),
                                              Row(
                                                children: [
                                                  const Icon(Icons.location_on_outlined, size: 12, color: Colors.grey),
                                                  const SizedBox(width: 2),
                                                  Expanded(
                                                    child: Text(
                                                      location,
                                                      style: const TextStyle(fontSize: 11, color: Colors.grey),
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
                                    ],
                                  ),
                                ),
                              );
                            },
                            childCount: _ads.length,
                          ),
                        ),
                      ),
          ],
        ),
      ),
    );
  }
}
